import React, { useState, useCallback, useRef, useEffect } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import './App.css'; 

import heroBg from './assets/hero-bg.png';

function App() {
  const [inputText, setInputText] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { role: 'model', content: "Welcome to LeDorian. How can I assist you with your legal documents today? You can ask a legal question, paste text, or use the paperclip icon below to upload a PDF/DOCX for context." }
  ]);
  const [documentContext, setDocumentContext] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const chatEndRef = useRef(null);

  const API_BASE_URL = 'http://127.0.0.1:8000';

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, loading]);

  const handleSendMessage = useCallback(async (e) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    const userMessage = inputText;
    setInputText('');
    
    // Add user message to history immediately for responsive UI
    const updatedHistory = [...chatHistory, { role: 'user', content: userMessage }];
    setChatHistory(updatedHistory);
    
    setLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/chat`, {
        message: userMessage,
        // We exclude the hardcoded welcome message to save tokens
        history: chatHistory.slice(1).map(msg => ({ 
          role: msg.role === 'model' ? 'model' : 'user', 
          content: msg.content 
        })),
        document_context: documentContext
      });

      setChatHistory(prev => [...prev, { role: 'model', content: response.data.reply }]);
      
    } catch (err) {
      console.error('Error during chat:', err);
      setChatHistory(prev => [...prev, { role: 'model', content: `**Error:** ${err.response?.data?.detail || 'An unexpected error occurred communicating with LeDorian.'}` }]);
    } finally {
      setLoading(false);
    }
  }, [inputText, chatHistory, documentContext]);

  const handleFileUpload = useCallback(async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsUploading(true);
    setChatHistory(prev => [...prev, { role: 'user', content: `*(Uploading document: ${file.name}...)*` }]);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(`${API_BASE_URL}/upload-context`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      setDocumentContext(response.data.extracted_text);
      setChatHistory(prev => [...prev, { 
        role: 'model', 
        content: `I have successfully analyzed **${response.data.filename}**. What specific clauses, risks, or jargon would you like me to identify for you?` 
      }]);
    } catch (err) {
      console.error('Error during file upload:', err);
      setChatHistory(prev => [...prev, { 
        role: 'model', 
        content: `**Error uploading file:** ${err.response?.data?.detail || 'An unexpected error occurred.'}` 
      }]);
    } finally {
      setIsUploading(false);
    }
    
    // reset file input
    event.target.value = null;
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="app-container">
      {/* Compact Premium Hero Section */}
      <header className="hero-section compact" style={{ backgroundImage: `url(${heroBg})` }}>
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1 className="hero-title">Le<span className="accent">Dorian</span></h1>
        </div>
      </header>

      <main className="chat-interface">
        <div className="premium-card chat-card">
          <div className="chat-window">
            {chatHistory.map((msg, index) => (
              <div key={index} className={`message-wrapper ${msg.role}`}>
                {msg.role === 'model' && <div className="avatar model-avatar">⚖️</div>}
                <div className={`message-bubble ${msg.role}`}>
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
                {msg.role === 'user' && <div className="avatar user-avatar">👤</div>}
              </div>
            ))}
            
            {loading && (
              <div className="message-wrapper model">
                <div className="avatar model-avatar">⚖️</div>
                <div className="message-bubble model typing-indicator">
                  <span></span><span></span><span></span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <div className="chat-input-area">
            <label className="file-upload-btn" title="Upload Context Document (.pdf, .docx)">
              📋
              <input type="file" onChange={handleFileUpload} accept=".pdf,.docx" disabled={isUploading || loading} />
            </label>
            
            <textarea
              className="chat-input"
              placeholder="Ask LeDorian a question or paste text to analyze..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading || isUploading}
              rows="1"
            />
            
            <button 
              className="send-btn" 
              onClick={handleSendMessage} 
              disabled={!inputText.trim() || loading || isUploading}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;