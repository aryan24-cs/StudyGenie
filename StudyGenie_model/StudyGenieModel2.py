from langchain_community.document_loaders import PyMuPDFLoader,Docx2txtLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_core.prompts import PromptTemplate
from langchain.chains import RetrievalQA
from langchain_google_genai import ChatGoogleGenerativeAI
from werkzeug.utils import secure_filename
import os
from pymongo import MongoClient
from bson import ObjectId
import google.generativeai as genai
from dotenv import load_dotenv
from flask import Flask,request,jsonify
from flask_cors import CORS


app = Flask(__name__)
CORS(app,supports_credentials=True, resources={r"/*": {"origins":"http://localhost:5173"}})


qa_chain = None


def DocLoader(file_path):
    ext = os.path.splitext(file_path)[1].lower()
    if(ext == '.pdf'):
        loader = PyMuPDFLoader(file_path)
    elif(ext == '.docx'):
        loader = Docx2txtLoader(file_path)
    return loader.load()


def split_document(docs):
    splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=100)
    return splitter.split_documents(docs)


def store_Faiss(splits, save_path):
    embeddings = HuggingFaceEmbeddings(
        model_name='sentence-transformers/all-MiniLM-L6-v2', 
        model_kwargs={'device': 'cpu'}
    )
    faiss_index = FAISS.from_documents(splits, embedding=embeddings)
    faiss_index.save_local(save_path)
    return faiss_index


def load_Faiss(save_path):
    embeddings = HuggingFaceEmbeddings(
        model_name='sentence-transformers/all-MiniLM-L6-v2',
        model_kwargs={'device': 'cpu'}
    )
    return FAISS.load_local(save_path, embeddings,allow_dangerous_deserialization=True)

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



def create_chain_with_gemini(faiss_index):
    load_dotenv()
    api_key = os.getenv("GEMINI_API_KEY")
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




@app.route('/upload', methods=['POST'])  
def upload_pdf():
    print("Received a request on /upload") 
    if 'file' not in request.files:  
        return jsonify({"error": "No file uploaded or received"}), 400

    uploaded_file = request.files['file']
    filename = secure_filename(uploaded_file.filename)
    
    ext = os.path.splitext(filename)[1].lower()
    
    if ext not in ['.pdf','.docx']:
        return jsonify({"error":"unsupported file"}),400

    os.makedirs("uploadedPDFs", exist_ok=True) 
    file_path = os.path.join("uploadedPDFs", filename)
    uploaded_file.save(file_path)

    try:
        docs = DocLoader(file_path)
        split = split_document(docs)

        file_name = os.path.splitext(filename)[0]
        os.makedirs("faiss_index", exist_ok=True)  
        save_path = os.path.join("faiss_index", file_name)

        faiss_index = store_Faiss(split, save_path)

        global qa_chain  
        qa_chain = create_chain_with_gemini(faiss_index)

        return jsonify({"message": "file processed and FAISS stored","vectorPath":save_path}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

        
@app.route('/ask',methods=['POST'])
def ask_question():
    
    global qa_chain 
    
    data = request.get_json()
    user_id = data.get("user_id")
    question = data.get("question")
    
    if not question:
        return jsonify ({"error":"no question asked"}), 400
    

        
    load_dotenv()
    api_key = os.getenv('GEMINI_API_KEY')
    genai.configure(api_key=api_key)
        
    llm = ChatGoogleGenerativeAI(
        model="gemini-1.5-flash",
        google_api_key=api_key,
        temperature=0.5
    )
    
    try:
        if qa_chain:
            result = qa_chain.invoke({"query":question})
            answer = result["result"]
        else:
            llm_results = llm.invoke(question)
            answer = llm_results.content
        
        print("answer:",answer)
        return jsonify({"answer":answer}),200
    
    except Exception as e:
        return jsonify({"error":str(e)}),500


@app.route("/loaddocs",methods=["POST"])
def Load_docs():
    data = request.get_json()
    user_id = data.get("user_id")
    file_name = data.get("file_name")
    
    if not user_id or not file_name:
        return jsonify({"no user or no file found"}) ,400
    
    Mongo_client = MongoClient(os.getenv("MONGO_URL"))
    db = Mongo_client["chat_bot"]
    pdf_collection = db["pdfhistories"]
    userdocs = pdf_collection.find_one({
        "userid":ObjectId(user_id),
        "fileName":file_name
    })
    
    if not userdocs:
        return jsonify("no document found"),400
    
    vector_path = userdocs["vectorPath"]
    if not vector_path:
        return jsonify("no vector path found"),400
    
    faiss_index = load_Faiss(vector_path)
    global qa_chain
    qa_chain =  create_chain_with_gemini(faiss_index)
    
    return jsonify({"message":"pdf document loaded sccussfully"})



@app.route("/getdocs",methods=["POST"])
def get_user_doc():
    data = request.get_json()
    user_id = data.get("user_id")
    
    if not user_id:
        return jsonify({"no User found"}),400
    
    mongo_client = MongoClient(os.getenv("MONGO_URL"))
    db = mongo_client["chat_bot"]
    pdf_collection =  db["pdfhistories"]
    
    userdocs = pdf_collection.find({"userid":ObjectId(user_id)})
    
    file_list = [doc["fileName"] for doc in userdocs]
    
    return jsonify({"files":file_list}),200

if __name__ == "__main__":
    app.run(host="localhost",port=5000)