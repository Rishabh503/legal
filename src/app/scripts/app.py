import os
import json
import re
from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv

# --- LangChain & Google Generative AI Imports ---
from langchain_google_genai import ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings
from langchain.prompts import ChatPromptTemplate
from langchain_community.document_loaders import TextLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
from langchain.chains import RetrievalQA

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

# --- LLM Initialization ---
llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash-preview-05-20",
    temperature=0.3,
    google_api_key=os.getenv("GOOGLE_API_KEY")
)

# --- RAG Chain Cache ---
rag_chain_cache = {}

def get_rag_chain():
    """Initialize and cache RAG chain for legal documents."""
    if "rag_chain" in rag_chain_cache:
        return rag_chain_cache["rag_chain"]

    # Embeddings
    embeddings = GoogleGenerativeAIEmbeddings(
        model="models/embedding-001",
        google_api_key=os.getenv("GOOGLE_API_KEY")
    )

    # Load legal document
    kb_path = "./knowledge_base/payment_of_wages_act.txt"
    if not os.path.exists(kb_path):
        raise FileNotFoundError(f"{kb_path} not found!")

    loader = TextLoader(kb_path)
    docs = loader.load()

    # Split into chunks
    splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=100)
    split_docs = splitter.split_documents(docs)

    # Vector store
    vector_store = FAISS.from_documents(split_docs, embeddings)
    retriever = vector_store.as_retriever()

    # Create RetrievalQA chain
    rag_chain = RetrievalQA.from_chain_type(
        llm=llm,
        chain_type="stuff",
        retriever=retriever,
        return_source_documents=True
    )
    rag_chain_cache["rag_chain"] = rag_chain
    return rag_chain

def clean_text_formatting(text):
    """Clean up numbered lists and formatting issues in text."""
    if not isinstance(text, str):
        return text
    
    # Remove numbered list patterns like "1. ", "2. ", etc.
    text = re.sub(r'\d+\.\s+\*\*([^*]+)\*\*:\s*', r'\1: ', text)
    text = re.sub(r'\d+\.\s+', '', text)
    
    # Remove markdown bold formatting
    text = re.sub(r'\*\*([^*]+)\*\*', r'\1', text)
    
    # Clean up multiple spaces and newlines
    text = re.sub(r'\s+', ' ', text)
    text = text.strip()
    
    return text

def parse_json_from_response(content):
    """Helper function to extract JSON from LLM response."""
    try:
        # First try direct parsing
        parsed = json.loads(content)
    except json.JSONDecodeError:
        # Try to extract JSON from markdown code blocks
        json_match = re.search(r'```json\s*(.*?)\s*```', content, re.DOTALL)
        if json_match:
            try:
                parsed = json.loads(json_match.group(1))
            except json.JSONDecodeError:
                pass
        else:
            # Try to find any JSON object in the text
            json_match = re.search(r'(\{.*\})', content, re.DOTALL)
            if json_match:
                try:
                    parsed = json.loads(json_match.group(1))
                except json.JSONDecodeError:
                    pass
            else:
                raise ValueError("Could not parse JSON from LLM response")
    
    # Clean up text formatting in the parsed JSON
    if isinstance(parsed, dict):
        for key, value in parsed.items():
            if isinstance(value, str):
                parsed[key] = clean_text_formatting(value)
            elif isinstance(value, list):
                for i, item in enumerate(value):
                    if isinstance(item, dict):
                        for sub_key, sub_value in item.items():
                            if isinstance(sub_value, str):
                                item[sub_key] = clean_text_formatting(sub_value)
    
    return parsed

# --- API Endpoints ---

@app.route('/api/know-your-rights', methods=['POST'])
def know_your_rights():
    data = request.get_json()
    if not data or 'query' not in data:
        return jsonify({"error": "No query provided"}), 400

    try:
        # Temporary workaround: Use general legal knowledge instead of RAG
        # due to Google embedding API quota limits
        formatting_prompt = f"""
        You are a legal expert with knowledge of employment law, particularly the Payment of Wages Act. 
        Answer the user's question about their legal rights and format your response into this exact JSON structure:
        
        {{
            "explanation": "A simple, plain-language explanation of the user's rights based on general legal principles",
            "relevantLaws": [
                {{
                    "title": "The title of the relevant law or legal principle",
                    "text": "A simple explanation of what the law means"
                }}
            ],
            "guidance": "Actionable guidance or next steps for the user - write as flowing paragraphs, NOT as numbered lists or bullet points",
            "disclaimer": "This is for informational purposes only and does not constitute legal advice. Please consult with a qualified attorney for personalized legal advice."
        }}
        
        IMPORTANT FORMATTING RULES:
        - For "guidance": Write in paragraph form, not numbered lists or bullet points
        - Use natural language flow with proper sentences
        - Separate different advice points with periods, not numbers or bullets
        - Keep all text clean and readable for web display
        
        User's question: {data['query']}
        
        Focus on employment rights, wage payment laws, and worker protections. Provide practical, actionable advice.
        Respond with ONLY the JSON, no additional text:
        """
        
        response = llm.invoke([{"role": "user", "content": formatting_prompt}])
        content = response.content if hasattr(response, "content") else str(response)
        
        parsed_response = parse_json_from_response(content)
        return jsonify(parsed_response)
        
    except Exception as e:
        print(f"Error in know_your_rights: {str(e)}")
        return jsonify({"error": f"Failed to process rights query: {str(e)}"}), 500

@app.route('/api/simplify', methods=['POST'])
def simplify_document():
    data = request.get_json()
    if not data or 'text' not in data:
        return jsonify({"error": "No text provided"}), 400

    prompt_text = f"""
    You are an expert legal assistant. Simplify the following legal text into a JSON response with this exact structure:
    
    {{
        "summary_points": [
            {{
                "title": "A short, clear title for the point",
                "text": "The simplified explanation of the point"
            }}
        ]
    }}
    
    Legal Text to simplify:
    {data['text']}
    
    Respond with ONLY the JSON, no additional text:
    """

    try:
        response = llm.invoke([{"role": "user", "content": prompt_text}])
        content = response.content if hasattr(response, "content") else str(response)
        
        print("Raw LLM response:", content)  # Debug log
        
        parsed_response = parse_json_from_response(content)
        
        # Validate the response structure
        if "summary_points" not in parsed_response or not isinstance(parsed_response["summary_points"], list):
            raise ValueError("Missing 'summary_points' key or invalid format")

        return jsonify(parsed_response)

    except Exception as e:
        print(f"Error in simplify_document: {str(e)}")
        return jsonify({
            "error": "Failed to simplify document",
            "details": str(e)
        }), 500
        
@app.route("/api/advise", methods=["POST"])
def advise_case():
    data = request.get_json()
    if not data or 'case_text' not in data:
        return jsonify({"error": "No case text provided"}), 400
    
    case_text = data.get("case_text", "").strip()
    if not case_text:
        return jsonify({"error": "Case text is empty"}), 400

    prompt_text = f"""
    You are an AI Legal Advisor. Analyze the user's situation and provide a JSON response with this exact structure:
    
    {{
        "analysis_points": [
            {{
                "type": "point",
                "title": "A short, clear title for the legal point",
                "text": "The detailed explanation of the legal point"
            }},
            {{
                "type": "recommendation", 
                "title": "A short, clear title for the recommendation",
                "text": "The detailed explanation of the recommendation"
            }}
        ]
    }}
    
    Each item must have "type" as either "point" (for legal analysis) or "recommendation" (for actionable advice).
    Provide multiple points and recommendations as relevant.
    
    User's case:
    {case_text}
    
    Respond with ONLY the JSON, no additional text:
    """

    try:
        response = llm.invoke([{"role": "user", "content": prompt_text}])
        content = response.content if hasattr(response, "content") else str(response)
        
        print("Raw LLM response:", content)  # Debug log
        
        parsed_response = parse_json_from_response(content)
        
        # Validate the response structure
        if "analysis_points" not in parsed_response or not isinstance(parsed_response["analysis_points"], list):
            raise ValueError("Missing 'analysis_points' key or invalid format")
        
        # Validate each analysis point
        for point in parsed_response["analysis_points"]:
            if not all(key in point for key in ["type", "title", "text"]):
                raise ValueError("Invalid analysis point structure")
            if point["type"] not in ["point", "recommendation"]:
                raise ValueError("Invalid analysis point type")

        return jsonify(parsed_response)
        
    except Exception as e:
        print(f"Error in advise_case: {str(e)}")
        return jsonify({
            "error": "Failed to analyze case",
            "details": str(e)
        }), 500

# if __name__ == '__main__':
#     app.run(host='0.0.0.0', port=5000, debug=True)

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))  # Render provides $PORT
    app.run(host='0.0.0.0', port=port, debug=True)
