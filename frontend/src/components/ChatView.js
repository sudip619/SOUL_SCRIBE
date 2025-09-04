// frontend/src/components/ChatView.js
import React, { useState, useEffect, useRef } from 'react';
import { makeAuthenticatedRequest } from '../services/api';
import MoodSelector from './MoodSelector';
import CardStack from './CardStack';
import { useTheme } from '../context/ThemeContext';

function ChatView({ showAlert }) {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const { applyTheme } = useTheme();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    if (messages.length === 0) {
        setMessages([
          { role: 'assistant', content: "Hello! I'm your AI Therapist. How can I help you today?" }
        ]);
    }
  }, []);


  const sendMessage = async () => {
    const userMessage = userInput.trim();
    if (!userMessage || isLoading) return;

    setIsLoading(true);
    setMessages((prevMessages) => [...prevMessages, { role: 'user', content: userMessage }]);
    setUserInput('');

    try {
      const response = await makeAuthenticatedRequest('/chat', 'POST', { message: userMessage });
      const data = await response.json();

      if (response.ok) {
        const botReply = data.reply;
        setMessages((prevMessages) => [...prevMessages, { role: 'assistant', content: botReply }]);
      } else {
        setMessages((prevMessages) => [...prevMessages, { role: 'assistant', content: `Error: ${data.message || 'Failed to get AI response.'}` }]);
        showAlert(data.message || 'Failed to get AI response.', false);
      }
    } catch (error)      {
      console.error('Error sending message to AI:', error);
      setMessages((prevMessages) => [...prevMessages, { role: 'assistant', content: `Network Error: ${error.message}` }]);
      showAlert('Network error or failed to get AI response.', false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  return (
    <div className="w-full flex flex-col items-center gap-8">
    <div className="flex flex-col w-full max-w-6xl rounded-lg h-[640px] overflow-hidden glass-panel">
      <div className="flex-grow-[4] p-4 overflow-y-auto space-y-4 text-dark-text-light" style={{ minHeight: '0' }}>
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`bubble break-words ${msg.role === 'user' ? 'bubble-user' : 'bubble-bot'}`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bubble bubble-bot">
              <span className="inline-block animate-pulse">Typing...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="flex flex-col flex-grow-[1] bg-dark-bg-primary/20 border-t border-dark-bg-secondary/30">
        {/* --- MODIFIED INPUT AREA --- */}
        <div className="composer p-4 items-center gap-x-2">
          
          {/* This entire block replaces your old <input /> */}
          <div className="chat-input-card">
            <div className="chat-input-card2">
              <div className="chat-input-group">
                <input
                  required=""
                  type="text"
                  id="user-input"
                  className="chat-input-field"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  autoComplete="off"
                  disabled={isLoading}
                  placeholder=" " 
                />
                <label htmlFor="user-input" className="chat-input-label">
                  {isLoading ? "AI is responding..." : "Type a message..."}
                </label>
              </div>
            </div>
          </div>

          <button
            onClick={sendMessage}
            className="send-fly-button"
            disabled={isLoading}
          >
            <div className="svg-wrapper-1">
              <div className="svg-wrapper">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  width="24"
                  height="24"
                >
                  <path fill="none" d="M0 0h24v24H0z"></path>
                  <path
                    fill="currentColor"
                    d="M1.946 9.315c-.522-.174-.527-.455.01-.634l19.087-6.362c.529-.176.832.12.684.638l-5.454 19.086c-.15.529-.455.547-.679.045L12 14l6-8-8 6-8.054-2.685z"
                  ></path>
                </svg>
              </div>
            </div>
            <span>Send</span>
          </button>
        </div>
        {/* --- END OF MODIFIED INPUT AREA --- */}

        <div className="p-1 bg-dark-bg-primary border-t border-dark-bg-secondary flex justify-center items-center flex-shrink-0">
            <MoodSelector showAlert={showAlert} />
        </div>
      </div>
    </div>

    <section className="card-stack-section" data-aos="fade-up" data-aos-duration="1000">
      <CardStack showAlert={showAlert} />
      <div className="flex justify-center mt-4">
        <button onClick={() => applyTheme('neutral')} className="nav-button px-4 py-2 rounded-md">Reset Theme</button>
      </div>
    </section>
    </div>
  );
}

export default ChatView;
