# # app.py

# import os
# from flask import Flask, request, jsonify
# from flask_cors import CORS
# from dotenv import load_dotenv

# # --- Local Imports ---
# # All AI logic and Pydantic models are now in rag_legal.py
# from rag_legal import LegalRAG

# # Load environment variables
# load_dotenv()

# # --- App Initialization ---
# app = Flask(__name__)
# CORS(app, resources={r"/api/*": {
#     "origins": [
#         "http://localhost:3000",
#         "https://legal-mate-ai.vercel.app"
#     ]
# }})

# # --- AI Handler Initialization ---
# GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

# try:
#     KNOWLEDGE_BASE_PATH = "./knowledge_base"
#     # The rag_handler is now our single source for all AI tasks
#     rag_handler = LegalRAG(knowledge_base_path=KNOWLEDGE_BASE_PATH, api_key=GOOGLE_API_KEY)
# except Exception as e:
#     print(f"FATAL: Could not initialize LegalRAG handler: {e}")
#     rag_handler = None

# # --- API Endpoints ---

# @app.route('/api/know-your-rights', methods=['POST'])
# def know_your_rights():
#     data = request.get_json()
#     if not rag_handler or not data or 'query' not in data:
#         return jsonify({"error": "Invalid request or RAG system not initialized"}), 400
#     try:
#         result = rag_handler.get_rights(data['query'])
#         return jsonify(result.dict())
#     except Exception as e:
#         print(f"Error in know_your_rights: {e}")
#         return jsonify({"error": "Failed to process query"}), 500

# @app.route('/api/simplify', methods=['POST'])
# def simplify_document():
#     data = request.get_json()
#     if not rag_handler or not data or 'text' not in data:
#         return jsonify({"error": "Invalid request or RAG system not initialized"}), 400
#     try:
#         result = rag_handler.simplify_document(data['text'])
#         return jsonify(result.dict())
#     except Exception as e:
#         print(f"Error in simplify_document: {e}")
#         return jsonify({"error": "Failed to simplify document"}), 500

# @app.route("/api/advise", methods=["POST"])
# def advise_case():
#     data = request.get_json()
#     if not rag_handler or not data or 'case_text' not in data:
#         return jsonify({"error": "Invalid request or RAG system not initialized"}), 400
#     try:
#         result = rag_handler.advise_on_case(data['case_text'])
#         return jsonify(result.dict())
#     except Exception as e:
#         print(f"Error in advise_case: {e}")
#         return jsonify({"error": "Failed to analyze case"}), 500
    
# if __name__ == '__main__':
#     port = int(os.environ.get("PORT", 5000))  # Render provides $PORT
#     app.run(host='0.0.0.0', port=port, debug=True)

# app.py

import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

# --- Local Imports ---
from rag_legal import LegalRAG

# Load environment variables
load_dotenv()

# --- App Initialization ---
app = Flask(__name__)
CORS(app, resources={r"/api/*": {
    "origins": [
        "http://localhost:3000",
        "https://legal-mate-ai.vercel.app"
    ]
}})

# --- AI Handler Initialization ---
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

try:
    # --- MODIFIED ---
    # We no longer pass the knowledge base path
    # This handler will no longer fail on startup.
    rag_handler = LegalRAG(api_key=GOOGLE_API_KEY)
except Exception as e:
    print(f"FATAL: Could not initialize LegalRAG handler: {e}")
    rag_handler = None

# --- API Endpoints ---

@app.route('/api/know-your-rights', methods=['POST'])
def know_your_rights():
    data = request.get_json()
    if not rag_handler or not data or 'query' not in data:
        return jsonify({"error": "Invalid request or RAG system not initialized"}), 400
    try:
        result = rag_handler.get_rights(data['query'])
        return jsonify(result.dict())
    except Exception as e:
        print(f"Error in know_your_rights: {e}")
        return jsonify({"error": "Failed to process query"}), 500

@app.route('/api/simplify', methods=['POST'])
def simplify_document():
    data = request.get_json()
    if not rag_handler or not data or 'text' not in data:
        return jsonify({"error": "Invalid request or RAG system not initialized"}), 400
    try:
        result = rag_handler.simplify_document(data['text'])
        return jsonify(result.dict())
    except Exception as e:
        print(f"Error in simplify_document: {e}")
        return jsonify({"error": "Failed to simplify document"}), 500

@app.route("/api/advise", methods=["POST"])
def advise_case():
    data = request.get_json()
    if not rag_handler or not data or 'case_text' not in data:
        return jsonify({"error": "Invalid request or RAG system not initialized"}), 400
    try:
        result = rag_handler.advise_on_case(data['case_text'])
        return jsonify(result.dict())
    except Exception as e:
        print(f"Error in advise_case: {e}")
        return jsonify({"error": "Failed to analyze case"}), 500

# In app.py

@app.route("/api/ask-vakil", methods=["POST"])
def ask_vakil():
    data = request.get_json()
    # The frontend must send BOTH the original text and the new question
    if not rag_handler or not data or 'document_text' not in data or 'question' not in data:
        return jsonify({"error": "Invalid request"}), 400
    try:
        # We call a new method in our AI handler
        result = rag_handler.ask_question_about_document(
            data['document_text'], 
            data['question']
        )
        # The 'result' would just be a simple JSON with the answer
        return jsonify({"answer": result})
    except Exception as e:
        print(f"Error in ask_vakil: {e}")
        return jsonify({"error": "Failed to get answer"}), 500

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))  # Render provides $PORT
    app.run(host='0.0.0.0', port=port, debug=True)