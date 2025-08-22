import sys
import os
import json
from langchain_community.document_loaders import PyMuPDFLoader, Docx2txtLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import PromptTemplate
from langchain.chains import RetrievalQA
from werkzeug.utils import secure_filename
from pymongo import MongoClient
from bson import ObjectId
import google.generativeai as genai
from dotenv import load_dotenv
from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime
import logging

# Set up logging
logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
CORS(app, supports_credentials=True, resources={r"/*": {"origins": ["http://localhost:5173", "http://localhost:3000"]}})

def DocLoader(file_path):
    logger.debug(f"Loading document: {file_path}")
    ext = os.path.splitext(file_path)[1].lower()
    if ext == '.pdf':
        return PyMuPDFLoader(file_path).load()
    elif ext == '.docx':
        return Docx2txtLoader(file_path).load()
    else:
        raise ValueError(f"Unsupported file extension: {ext}")

def split_document(docs):
    logger.debug("Splitting documents")
    splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=100)
    return splitter.split_documents(docs)

def store_Faiss(splits, save_path):
    logger.debug(f"Storing FAISS index at: {save_path}")
    embeddings = HuggingFaceEmbeddings(
        model_name='sentence-transformers/all-MiniLM-L6-v2',
        model_kwargs={'device': 'cpu'}
    )
    faiss_index = FAISS.from_documents(splits, embedding=embeddings)
    faiss_index.save_local(save_path)
    return faiss_index

def load_Faiss(save_path):
    logger.debug(f"Loading FAISS index from: {save_path}")
    embeddings = HuggingFaceEmbeddings(
        model_name='sentence-transformers/all-MiniLM-L6-v2',
        model_kwargs={'device': 'cpu'}
    )
    return FAISS.load_local(save_path, embeddings, allow_dangerous_deserialization=True)

def get_prompt_template():
    return PromptTemplate(
        template="""
You are an intelligent assistant trained to answer questions based on the provided PDF contents.

Instructions:
- Use ONLY the context from the PDF to answer.
- Always format your answers in a clean, structured way using bullet points, numbered lists, or headings.
- If the answer is not in the context, respond with: "The answer is not available in the provided content."
- Be concise and accurate.

Context from PDF:
{context}

Question:
{question}

Answer:
""",
        input_variables=["context", "question"]
    )

def get_question_generation_prompt():
    return PromptTemplate(
        template="""
You are an intelligent assistant tasked with generating questions based on the provided document content.

Instructions:
- Generate 5-10 relevant questions that test understanding of key concepts, facts, or ideas in the document.
- Questions should be clear, concise, and varied (e.g., multiple-choice, short-answer, true/false).
- Format the questions as a JSON array of objects, each with 'question' and 'type' fields.
- Use ONLY the provided document content.
- If the content is insufficient, return an empty array.

Document Content:
{context}

Output (JSON):
""",
        input_variables=["context"]
    )

def create_chain_with_gemini(faiss_index):
    logger.debug("Creating RetrievalQA chain with Gemini")
    load_dotenv()
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY not found in environment variables")
    genai.configure(api_key=api_key)

    llm = ChatGoogleGenerativeAI(
        model="gemini-1.5-flash",
        google_api_key=api_key,
        temperature=0.5
    )

    prompt = get_prompt_template()
    qa_chain = RetrievalQA.from_chain_type(
        llm=llm,
        retriever=faiss_index.as_retriever(search_kwargs={"k": 4}),
        chain_type_kwargs={"prompt": prompt},
        return_source_documents=True
    )
    return qa_chain

def generate_questions(docs):
    logger.debug("Generating questions from document")
    load_dotenv()
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY not found in environment variables")
    genai.configure(api_key=api_key)

    llm = ChatGoogleGenerativeAI(
        model="gemini-1.5-flash",
        google_api_key=api_key,
        temperature=0.7
    )

    prompt = get_question_generation_prompt()
    context = "\n".join([doc.page_content for doc in docs])
    try:
        result = llm.invoke(prompt.format(context=context))
        questions = eval(result.content) if result.content else []
        if not isinstance(questions, list):
            logger.warning("Generated questions are not a list")
            return []
        logger.debug(f"Generated {len(questions)} questions")
        return questions
    except Exception as e:
        logger.error(f"Error generating questions: {str(e)}")
        return []

def process_pdf(file_path, user_id=None):
    try:
        logger.debug(f"Processing file: {file_path}")
        # Load and process document
        docs = DocLoader(file_path)
        splits = split_document(docs)

        # Store FAISS index
        file_name = os.path.splitext(os.path.basename(file_path))[0]
        save_path = os.path.join("faiss_index", file_name)
        os.makedirs("faiss_index", exist_ok=True)
        store_Faiss(splits, save_path)

        # Generate questions
        questions = generate_questions(docs)

        # Save to MongoDB if user_id is provided (for Flask endpoint)
        if user_id:
            mongo_client = MongoClient(os.getenv("MONGO_URL"))
            db = mongo_client["chat_bot"]
            pdf_collection = db["pdfhistories"]
            pdf_collection.insert_one({
                "userid": ObjectId(user_id),
                "fileName": os.path.basename(file_path),
                "filePath": file_path,
                "vectorPath": save_path,
                "questions": questions,
                "uploadDate": datetime.utcnow()
            })
            mongo_client.close()
            logger.debug(f"Metadata saved to MongoDB for file: {file_name}")

        return {
            "message": "File processed, FAISS stored, and questions generated",
            "vectorPath": save_path,
            "questions": questions
        }
    except Exception as e:
        logger.error(f"Processing failed: {str(e)}")
        raise

@app.route('/upload', methods=['POST'])
def upload_pdf():
    logger.debug("Received request on /upload")
    if 'file' not in request.files or not request.files['file'].filename:
        logger.error("No file uploaded or received")
        return jsonify({"error": "No file uploaded or received"}), 400

    if 'user_id' not in request.form:
        logger.error("User ID is required")
        return jsonify({"error": "User ID is required"}), 400

    user_id = request.form['user_id']
    uploaded_file = request.files['file']
    filename = secure_filename(uploaded_file.filename)

    ext = os.path.splitext(filename)[1].lower()
    if ext not in ['.pdf', '.docx']:
        logger.error(f"Unsupported file type: {ext}")
        return jsonify({"error": "Unsupported file type. Only PDF and DOCX are allowed"}), 400

    try:
        # Save file
        os.makedirs("uploadedPDFs", exist_ok=True)
        file_path = os.path.join("uploadedPDFs", filename)
        uploaded_file.save(file_path)
        logger.debug(f"File saved to: {file_path}")

        # Process file
        result = process_pdf(file_path, user_id)
        return jsonify(result), 200

    except Exception as e:
        logger.error(f"Failed to process file: {str(e)}")
        return jsonify({"error": f"Failed to process file: {str(e)}"}), 500

@app.route('/ask', methods=['POST'])
def ask_question():
    logger.debug("Received request on /ask")
    data = request.get_json()
    user_id = data.get("user_id")
    question = data.get("question")
    vector_path = data.get("vector_path")

    if not user_id or not question or not vector_path:
        logger.error("Missing user_id, question, or vector_path")
        return jsonify({"error": "Missing user_id, question, or vector_path"}), 400

    try:
        # Load FAISS index
        faiss_index = load_Faiss(vector_path)
        qa_chain = create_chain_with_gemini(faiss_index)

        # Answer question
        result = qa_chain.invoke({"query": question})
        answer = result["result"]
        logger.debug(f"Answer generated: {answer}")

        return jsonify({"answer": answer}), 200

    except Exception as e:
        logger.error(f"Failed to answer question: {str(e)}")
        return jsonify({"error": f"Failed to answer question: {str(e)}"}), 500

@app.route("/loaddocs", methods=["POST"])
def load_docs():
    logger.debug("Received request on /loaddocs")
    data = request.get_json()
    user_id = data.get("user_id")
    file_name = data.get("file_name")

    if not user_id or not file_name:
        logger.error("Missing user_id or file_name")
        return jsonify({"error": "Missing user_id or file_name"}), 400

    try:
        mongo_client = MongoClient(os.getenv("MONGO_URL"))
        db = mongo_client["chat_bot"]
        pdf_collection = db["pdfhistories"]

        user_doc = pdf_collection.find_one({
            "userid": ObjectId(user_id),
            "fileName": file_name
        })

        mongo_client.close()

        if not user_doc:
            logger.error("No document found")
            return jsonify({"error": "No document found"}), 400

        vector_path = user_doc.get("vectorPath")
        if not vector_path:
            logger.error("No vector path found")
            return jsonify({"error": "No vector path found"}), 400

        logger.debug(f"Document loaded: {file_name}")
        return jsonify({
            "message": "PDF document loaded successfully",
            "vectorPath": vector_path,
            "questions": user_doc.get("questions", [])
        }), 200

    except Exception as e:
        logger.error(f"Failed to load document: {str(e)}")
        return jsonify({"error": f"Failed to load document: {str(e)}"}), 500

@app.route("/getdocs", methods=["POST"])
def get_user_doc():
    logger.debug("Received request on /getdocs")
    data = request.get_json()
    user_id = data.get("user_id")

    if not user_id:
        logger.error("No user_id provided")
        return jsonify({"error": "No user_id provided"}), 400

    try:
        mongo_client = MongoClient(os.getenv("MONGO_URL"))
        db = mongo_client["chat_bot"]
        pdf_collection = db["pdfhistories"]

        user_docs = pdf_collection.find({"userid": ObjectId(user_id)})
        file_list = [
            {
                "fileName": doc["fileName"],
                "filePath": doc["filePath"],
                "vectorPath": doc["vectorPath"],
                "uploadDate": doc["uploadDate"].isoformat(),
                "questions": doc.get("questions", [])
            }
            for doc in user_docs
        ]

        mongo_client.close()
        logger.debug(f"Found {len(file_list)} documents for user {user_id}")
        return jsonify({"files": file_list}), 200

    except Exception as e:
        logger.error(f"Failed to fetch documents: {str(e)}")
        return jsonify({"error": f"Failed to fetch documents: {str(e)}"}), 500

if __name__ == "__main__":
    if len(sys.argv) > 1:
        # Script mode: Process a single file
        file_path = sys.argv[1]
        try:
            result = process_pdf(file_path)
            print(json.dumps(result))
        except Exception as e:
            print(json.dumps({"error": str(e)}))
            sys.exit(1)
    else:
        # Flask server mode
        logger.info("Starting Flask server on http://localhost:5000")
        app.run(host="localhost", port=5000, debug=True)