# ⚖️ LeDorian: AI Legal Assistant

**LeDorian** is a premium, full-stack conversational AI legal assistant designed to simplify complex contracts, extract core structured insights, and answer legal questions directly. Featuring a sleek "High-End Law Firm" aesthetic, LeDorian instantly identifies legal vulnerabilities, translates heavy jargon, and specifically evaluates documents under the strict context of **Indian Law**.

![LeDorian Premium Chat Interface](https://img.shields.io/badge/UI-Premium_Chat-1E3B27?style=for-the-badge&logoColor=white)

---

## 🌟 Key Features

- **Conversational UI**: A sleek, real-time messaging interface (similar to ChatGPT or Claude) boasting custom typography, glassmorphism input bars, and beautiful message formatting via React-Markdown.
- **Context-Aware Document Analysis**: Seamlessly ingest `.pdf` and `.docx` files via the chat window's upload clipboard. LeDorian absorbs the entire document's text into its "memory" instantly without cluttering the screen.
- **Indian Law Default Setting**: Driven by a highly customized system instruction prompt, all logic and liability assessments default to Indian Law unless otherwise specified by the user.
- **Risk & Loophole Identification**: Empowers users by effortlessly flagging vague phrasing, biased obligations, exception clauses, and disproportionate structural risks.
- **Jargon Translation**: Instantly converts dense, intimidating legal language into plain English summaries.

---

## Contributions

This project was initially developed as part of a team effort.

My contributions include:
- Frontend UI improvements and styling  
- Backend API restructuring and integration  
- Enhancing document processing workflow  
- Preparing project for independent deployment  

---

## 🛠 Tech Stack

### Frontend
- **Framework**: React 19 (via Vite)
- **Styling**: Vanilla CSS (CSS Variables, Flexbox Grid, Glassmorphism UI)
- **Networking**: Axios
- **Libraries**: `react-markdown` (for rendering AI bolding, headers, and bullet points)

### Backend
- **Framework**: FastAPI (Python)
- **AI Engine**: Google Generative AI (`gemini-2.5-flash`)
- **Document Extractors**: `PyPDF2`, `python-docx`
- **Data Validation**: Pydantic
- **Environment Management**: `python-dotenv`

---

## 🚀 Setup & Installation

To run LeDorian locally, you will need to start both the Python Backend and the Node/React Frontend concurrently. 

### 1. Backend Initialization 
The backend requires a Gemini API key to communicate with the generative AI model.

```bash
# Navigate to Backend
cd Backend

# Create and activate a virtual environment (Windows)
python -m venv venv
.\venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create an Environment File
echo LLM_API_KEY=your_google_gemini_api_key_here > .env

# Run the FastAPI Server
uvicorn main:app --reload
# The server will run at http://127.0.0.1:8000
```

### 2. Frontend Initialization
The frontend is a lightweight Vite/React environment.

```bash
# Navigate to Frontend
cd Frontend

# Install node modules
npm install

# Start Local Development Server
npm run dev
# The application will be live at http://localhost:5173
```

---

## 💡 How to Use
1. Open the application at `http://localhost:5173`.
2. Click the **Clipboard Icon (📋)** next to the textual input bar to upload your lease agreement, NDA, or service contract.
3. Wait a moment for LeDorian to confirm receipt ("I have successfully analyzed the document...").
4. **Chat!** Ask specific questions like:
   - *"List all the termination clauses."*
   - *"Are there any disproportionate risks for me as a tenant?"*
   - *"Rewrite Clause 3 so a 5-year-old could understand it."*

---
*© LeDorian | Premium Legal Document Intelligence System*
