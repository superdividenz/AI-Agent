import React, { useState, useEffect, useRef } from 'react';

const ChatComponent = () => {
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    // Handle sending a message
    const handleSend = async () => {
        if (!input.trim()) return;

        setIsLoading(true);
        setMessages(prevMessages => [...prevMessages, { text: input, sender: 'user' }]);

        try {
            // Send the user input to the backend
            const res = await fetch('http://localhost:5001/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userInput: input }),
            });

            if (!res.ok) {
                throw new Error(`HTTP error! Status: ${res.status}`);
            }

            const data = await res.json();
            setMessages(prevMessages => [...prevMessages, { text: data.aiResponse, sender: 'bot' }]);
        } catch (error) {
            console.error('Error sending message:', error);
            setMessages(prevMessages => [...prevMessages, { text: "Oops! Something went wrong. Let's try that again.", sender: 'bot' }]);
        } finally {
            setIsLoading(false);
            setInput('');
        }
    };

    // Scroll to bottom effect
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
                    <h1 className="text-3xl font-bold text-white">Yommerss</h1>
                    <p className="text-sm text-blue-200 mt-1">AI Bot</p>
                </div>

                {/* Chat Messages */}
                <div className="p-6 space-y-4 overflow-y-auto max-h-[500px]">
                    {messages.map((message, index) => (
                        <div key={index} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`p-3 rounded-lg max-w-xs ${message.sender === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}>
                                <p className="text-sm">{message.text}</p>
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex justify-start mt-4">
                            <div className="flex items-center justify-center space-x-2">
                                <div className="w-4 h-4 bg-blue-600 rounded-full animate-bounce"></div>
                                <div className="w-4 h-4 bg-blue-600 rounded-full animate-bounce delay-100"></div>
                                <div className="w-4 h-4 bg-blue-600 rounded-full animate-bounce delay-200"></div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Chat Input */}
                <div className="p-6 bg-gray-50">
                    <div className="flex space-x-4">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="What's on your mind?"
                            className="flex-1 p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            disabled={isLoading}
                            aria-label="Enter your message"
                        />
                        <button
                            onClick={handleSend}
                            disabled={isLoading}
                            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all"
                            aria-label="Send message"
                        >
                            {isLoading ? 'Thinking...' : 'Send'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatComponent;