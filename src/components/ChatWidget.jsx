import { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Loader, Shield, RefreshCw } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import './ChatWidget.css';

export default function ChatWidget({ isLoggedIn }) {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    // Auto scroll down
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    // Fetch history when opened
    useEffect(() => {
        // Focus input after opening
        if (isOpen && !isLoading) {
            setTimeout(() => inputRef.current?.focus(), 300);
        }
    }, [isOpen, isLoggedIn, isLoading]);

    const handleClearChat = () => {
        if (!confirm('Are you sure you want to clear your current conversation history?')) return;
        setMessages([]);
    };

    const handleSend = async (e) => {
        e.preventDefault();

        if (!input.trim() || !isLoggedIn || isLoading) return;

        const userMessage = { role: 'user', text: input.trim(), _id: Date.now().toString() };

        // Optimistic UI update
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/ai/message', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ text: userMessage.text, history: messages })
            });

            const data = await res.json();

            if (res.ok && data.message) {
                setMessages(prev => [...prev, data.message]);
            } else {
                // Return an error message visually from the system
                setMessages(prev => [...prev, {
                    role: 'system',
                    text: '⚠️ Communication error. The AI specialist is currently unavailable.',
                    _id: 'err' + Date.now()
                }]);
            }
        } catch (error) {
            console.error("Chat send error:", error);
            setMessages(prev => [...prev, {
                role: 'system',
                text: '⚠️ Network error. Please check your connection.',
                _id: 'err' + Date.now()
            }]);
        } finally {
            setIsLoading(false);
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    };

    return (
        <div className={`chat-widget-container ${isOpen ? 'open' : ''}`}>
            {/* Chat button toggle */}
            {!isOpen && (
                <button
                    className="chat-toggle-btn animate-bounce-in"
                    onClick={() => setIsOpen(true)}
                    aria-label="Open AI Cybersecurity Assistant"
                >
                    <Shield size={24} className="main-icon" />
                    <span className="tooltip">Ask AI Specialist</span>
                </button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div className="chat-window shadow-2xl animate-slide-up">

                    {/* Header */}
                    <div className="chat-header">
                        <div className="chat-title">
                            <div className="avatar glow">
                                <Shield size={18} />
                            </div>
                            <div>
                                <h3>Cipher AI</h3>
                                <span>Cybersecurity Specialist</span>
                            </div>
                        </div>
                        <div className="header-actions">
                            {isLoggedIn && messages.length > 0 && (
                                <button onClick={handleClearChat} className="icon-btn" title="Clear History">
                                    <RefreshCw size={16} />
                                </button>
                            )}
                            <button onClick={() => setIsOpen(false)} className="icon-btn">
                                <X size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Messages Body */}
                    <div className="chat-body">
                        {!isLoggedIn ? (
                            <div className="chat-status-message">
                                <Shield size={32} />
                                <p>Please Log In or Sign Up to access your personal AI Cybersecurity Specialist.</p>
                            </div>
                        ) : messages.length === 0 ? (
                            <div className="chat-welcome">
                                <div className="welcome-icon">
                                    <Shield size={32} />
                                </div>
                                <p>System initialized. I am Cipher, your dedicated cybersecurity analyst. How can I help you secure your systems or learn today?</p>
                            </div>
                        ) : (
                            <div className="messages-list">
                                {messages.map((msg, i) => (
                                    <div key={msg._id || i} className={`message-wrapper ${msg.role}`}>
                                        <div className="message-bubble">
                                            {msg.role === 'model' || msg.role === 'system' ? (
                                                <ReactMarkdown>{msg.text}</ReactMarkdown>
                                            ) : (
                                                <p>{msg.text}</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {isLoading && (
                                    <div className="message-wrapper model">
                                        <div className="message-bubble typing">
                                            <div className="dot"></div>
                                            <div className="dot"></div>
                                            <div className="dot"></div>
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>
                        )}
                    </div>

                    {/* Input Area */}
                    <form className="chat-footer" onSubmit={handleSend}>
                        <input
                            ref={inputRef}
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder={isLoggedIn ? "Ask about security, phishing, etc..." : "Log in to chat"}
                            disabled={!isLoggedIn || isLoading}
                        />
                        <button
                            type="submit"
                            disabled={!isLoggedIn || !input.trim() || isLoading}
                            className="send-btn"
                        >
                            {isLoading ? <Loader size={18} className="spinner" /> : <Send size={18} />}
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}
