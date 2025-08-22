# StudyGenie

**StudyGenie** – Your AI-Powered Study Companion 📚🤖

StudyGenie is a task-oriented study assistant that helps students achieve their learning goals efficiently. Upload PDFs, set study objectives, and let StudyGenie guide you with personalized study plans, summaries, quizzes, and web-based resource recommendations.

## Features

* Upload and manage study PDFs.
* AI-generated summaries and quiz questions.
* Personalized task breakdown for study goals.
* Persistent PDF storage and vector indexing via FAISS.
* Interactive Q\&A with Gemini 1.5 Flash LLM.
* Full-stack MERN + Python integration for smooth workflow.

## Tech Stack

* **Frontend:** React, CSS
* **Backend:** Node.js, Express, Flask (for AI logic)
* **Database:** MongoDB
* **AI/ML:** LangChain, FAISS, HuggingFace embeddings, Google Gemini API

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/StudyGenie.git
   cd StudyGenie
   ```

2. Install backend dependencies:

   ```bash
   cd StudyGenie_Backend
   npm install
   pip install -r requirements.txt
   venv\Scripts\activate
   python StudyGenieModel2.py    
   ```

3. Install frontend dependencies:

   ```bash
   cd ../StudyGenie_Frontend
   npm install
   npm run dev
   ```

4. Run the backend server:

   ```bash
   cd ../StudyGenie_Backend
   npm run start
   ```

5. Run the frontend:

   ```bash
   cd ../StudyGenie_Frontend
   npm start
   ```

## Usage

1. Open the app in your browser.
2. Sign up or log in.
3. Upload your PDFs and set your study goals.
4. Ask questions or request summaries and quizzes.
5. Track your progress over time.


