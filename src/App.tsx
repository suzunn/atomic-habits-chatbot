import React, { useState, useRef, useEffect } from 'react';
import { Github, Moon, Sun, Send, StopCircle, Loader2 } from 'lucide-react';
import { Message } from './types';
import { config } from './config';

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const suggestions = [
    "What are atomic habits?",
    "How do I build better habits?",
    "Explain the 1% rule",
    "What are the 4 laws of behavior change?",
    "How do I break bad habits?"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const formatMessage = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')  // **bold**
      .replace(/\*(.*?)\*/g, '<em>$1</em>')            // *italic*
      .replace(/\d+\./g, '<ol><li>')                   // numaralı liste
      .replace(/\n/g, '<br>');                          // yeni satırları <br> ile değiştirme
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const newMessage: Message = {
      text: input,
      isUser: true,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, newMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch(config.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey}`
        },
        body: JSON.stringify({
          message: input,
          mode: 'chat',
          sessionId: 'atomic-habits-session'
        })
      });

      const data = await response.json();

      if (data.textResponse) {
        const botMessage: Message = {
          text: formatMessage(data.textResponse),
          isUser: false,
          timestamp: new Date().toISOString()
        };

        setMessages(prev => [...prev, botMessage]);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'} transition-colors duration-200`}>
      <div className="max-w-4xl mx-auto p-4">
        <div className="flex justify-between items-center mb-8 pt-4">
          <h1 className="text-3xl font-bold">Atomic Habits Chat</h1>
          <div className="flex gap-4">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-full ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'} transition-all duration-200 hover:scale-110`}
            >
              {darkMode ? <Sun size={24} /> : <Moon size={24} />}
            </button>
            <a
              href="https://github.com/suzunn"
              target="_blank"
              rel="noopener noreferrer"
              className={`p-2 rounded-full ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'} transition-all duration-200 hover:scale-110`}
            >
              <Github size={24} />
            </a>
          </div>
        </div>

        <div className={`mb-4 p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg h-[60vh] overflow-y-auto`}>
          {messages.map((message, index) => (
            <div
              key={index}
              className={`mb-4 ${message.isUser ? 'text-right' : 'text-left'}`}
            >
              <div
                className={`inline-block max-w-[70%] p-3 rounded-lg ${
                  message.isUser
                    ? `${darkMode ? 'bg-blue-600' : 'bg-blue-500'} text-white`
                    : `${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`
                } animate-appear`}
                dangerouslySetInnerHTML={{ __html: message.text }} // XSS önlemek için güvenli kullanımı unutmayın
              />
            </div>
          ))}
          {isLoading && (
            <div className="flex items-center gap-2 text-gray-500">
              <Loader2 className="animate-spin" size={20} />
              <span>Thinking...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              className={`px-4 py-2 rounded-full text-sm ${
                darkMode
                  ? 'bg-gray-800 hover:bg-gray-700'
                  : 'bg-white hover:bg-gray-100'
              } shadow-md transition-all duration-200 hover:scale-105 active:scale-95`}
            >
              {suggestion}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask anything about Atomic Habits..."
            className={`flex-1 p-3 rounded-lg resize-none ${
              darkMode ? 'bg-gray-800' : 'bg-white'
            } shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
            rows={1}
          />
          <button
            onClick={handleSend}
            disabled={isLoading}
            className={`p-3 rounded-lg ${
              darkMode ? 'bg-blue-600' : 'bg-blue-500'
            } text-white shadow-lg transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <Send size={20} />
          </button>
          {isLoading && (
            <button
              onClick={() => setIsLoading(false)}
              className={`p-3 rounded-lg ${
                darkMode ? 'bg-red-600' : 'bg-red-500'
              } text-white shadow-lg transition-all duration-200 hover:scale-105 active:scale-95`}
            >
              <StopCircle size={20} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
