import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

function App() {
    const [message, setMessage] = useState('');
    const [conversation, setConversation] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const handleSend = async () => {
        if (!message.trim()) return;

        const userMessage = { sender: 'user', text: message };
        setConversation((prev) => [...prev, userMessage]);
        setMessage('');
        setIsLoading(true);

        try {
            const response = await axios.post('http://localhost:5001/chat', {
                message,
            });
            const aiMessage = { sender: 'ai', text: response.data.reply };
            setConversation((prev) => [...prev, aiMessage]);
        } catch (error) {
            console.error(error);
            setConversation((prev) => [
                ...prev,
                { sender: 'ai', text: 'Error communicating with the AI.' },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    // Automatically scroll to the latest message
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [conversation]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Yommys Chatbot</h1>
            <div className="w-full max-w-2xl bg-white rounded-lg shadow-lg flex flex-col h-[70vh]">
                <div className="flex-1 p-4 overflow-y-auto">
                    {conversation.map((msg, index) => (
                        <div
                            key={index}
                            className={`flex mb-4 ${
                                msg.sender === 'user' ? 'justify-end' : 'justify-start'
                            }`}
                        >
                            <div
                                className={`max-w-[70%] p-3 rounded-lg ${
                                    msg.sender === 'user'
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-gray-200 text-gray-800'
                                }`}
                            >
                                {msg.text}
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex justify-start mb-4">
                            <div className="bg-gray-200 text-gray-800 p-3 rounded-lg">
                                Typing...
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
                <div className="p-4 border-t border-gray-200">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Type a message..."
                            className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                            onClick={handleSend}
                            disabled={isLoading}
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            Send
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default App;