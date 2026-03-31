import os
from dotenv import load_dotenv
# Load environment variables FIRST before anything else dependencies
load_dotenv()

from fastapi import FastAPI, HTTPException, Request, UploadFile, File
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import logging
import io
import google.generativeai as genai
from PyPDF2 import PdfReader
import docx

from fastapi.middleware.cors import CORSMiddleware
from prompts import SYSTEM_INSTRUCTION

# --- Configure Logging ---
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# --- Configuration ---
LLM_API_KEY = os.getenv("LLM_API_KEY", "YOUR_LLM_API_KEY_HERE")
LLM_MODEL_NAME = "gemini-2.5-flash"

# --- FastAPI App Initialization ---
app = FastAPI(
    title="LeDorian Conversational Backend",
    description="Stateful chat backend for processing legal documents with Gemini AI.",
    version="2.0.0"
)

origins = [
    "http://localhost",
    "http://localhost:5173",  # Your frontend's address
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"], 
    allow_headers=["*"],
)

# --- Models for Request and Response ---
class ChatMessage(BaseModel):
    role: str # "user" or "model"
    content: str

class ChatRequest(BaseModel):
    message: str
    history: List[ChatMessage] = []
    document_context: Optional[str] = None

class UploadResponse(BaseModel):
    extracted_text: str
    filename: str

class ChatResponse(BaseModel):
    reply: str

# --- LLM and Prompt Configuration ---
genai.configure(api_key=LLM_API_KEY)
model = genai.GenerativeModel(
    model_name=LLM_MODEL_NAME,
    system_instruction=SYSTEM_INSTRUCTION
)

# --- API Endpoints ---
@app.post("/upload-context", response_model=UploadResponse)
async def upload_context(file: UploadFile = File(...)):
    """
    Receives a document file (PDF or DOCX), extracts text, and returns the full text 
    back to the client. This text will then be kept in the frontend and passed into chat requests.
    """
    extracted_text = ""
    try:
        file_content = await file.read()
        if file.filename.endswith(".pdf"):
            logger.info(f"Processing PDF file: {file.filename}")
            reader = PdfReader(io.BytesIO(file_content))
            for page in reader.pages:
                extracted_text += page.extract_text() + "\n"
        elif file.filename.endswith(".docx"):
            logger.info(f"Processing DOCX file: {file.filename}")
            document = docx.Document(io.BytesIO(file_content))
            for paragraph in document.paragraphs:
                extracted_text += paragraph.text + "\n"
        else:
            raise HTTPException(status_code=400, detail="Unsupported file type. Please upload PDF or DOCX.")

        return UploadResponse(extracted_text=extracted_text, filename=file.filename)

    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error processing uploaded file: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to process file: {e}")

@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    """
    Takes a new user message, historical conversation context, and the document itself,
    and returns LeDorian's conversational reply.
    """
    try:
        # 1. Rebuild History for Gemini SDK
        # Gemini expects history in the format: [{"role": "user", "parts": ["hello"]}, {"role": "model", "parts": ["hi"]}]
        formatted_history = []
        for msg in request.history:
            formatted_history.append({
                "role": msg.role,
                "parts": [msg.content]
            })
        
        # 2. Start Chat Session
        chat = model.start_chat(history=formatted_history)

        # 3. Augment the user message if it's the very first message with a document
        user_message = request.message
        if request.document_context and len(request.history) == 0:
            logger.info("Injecting massive document context into the first message.")
            user_message = (
                f"--- DOCUMENT CONTEXT FOR THIS CONVERSATION ---\n"
                f"\"\"\"{request.document_context}\"\"\"\n"
                f"--------------------------------------------\n\n"
                f"USER QUESTION: {request.message}"
            )

        # 4. Generate Response
        logger.info(f"Sending message to LLM. History length: {len(request.history)}. Message length: {len(user_message)}")
        response = await chat.send_message_async(user_message)
        
        return ChatResponse(reply=response.text)

    except Exception as e:
        logger.error(f"Error during chat generation: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"LLM Generation failed: {str(e)}")