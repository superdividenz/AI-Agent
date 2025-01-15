import React, { useState, useEffect } from 'react';
const personality = require('../config/personality.json');
const messages = require('../config/messages.json');
const chatHistory = require('../data/chatHistory.json');

const ChatComponent = () => {
    const [input, setInput] = useState('');
    const [response, setResponse] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [chatHistoryState, setChatHistoryState] = useState(chatHistory || []);

    // Handle sending a message
    const handleSend = async () => {
        if (!input.trim()) return;

        setIsLoading(true);

        try {
            // Send the user input to the backend with personality included
            const res = await fetch('http://localhost:5000/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userInput: input,
                    personality: personality // Sending personality data to the server
                }),
            });

            if (!res.ok) {
                throw new Error(`HTTP error! Status: ${res.status}`);
            }

            const data = await res.json();
            setResponse(data.aiResponse);

            // Update chat history
            setChatHistoryState(prev => [...prev, { userInput: input, aiResponse: data.aiResponse }]);
            setInput(''); // Clear input after sending
        } catch (error) {
            console.error('Error sending message:', error);
            setResponse(messages.error || "Oops! Something went wrong. Let's try that again.");
        } finally {
            setIsLoading(false);
        }
    };

    // Use messages for the initial response if there's no previous response
    useEffect(() => {
        if (!response && !input) {
            setResponse(messages.welcome || "Hi there! How can I help you today?");
        }
    }, [input, messages, response]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
                    <h1 className="text-3xl font-bold text-white">Yommy</h1>
                    <p className="text-sm text-blue-200 mt-1">AI Bot</p>
                </div>

                {/* Chat Input */}
                <div className="p-6">
                    <div className="flex space-x-4">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="What's on your mind?"
                            className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            disabled={isLoading}
                        />
                        <button
                            onClick={handleSend}
                            disabled={isLoading}
                            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all"
                        >
                            {isLoading ? 'Thinking...' : 'Send'}
                        </button>
                    </div>
                </div>

                {/* Response Section */}
                <div className="p-6 bg-gray-50 border-t border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Yommy says:</h2>
                    <div className="bg-white p-4 rounded-lg shadow-inner">
                        {isLoading ? (
                            <div className="flex items-center justify-center space-x-2">
                                <div className="w-4 h-4 bg-blue-600 rounded-full animate-bounce"></div>
                                <div className="w-4 h-4 bg-blue-600 rounded-full animate-bounce delay-100"></div>
                                <div className="w-4 h-4 bg-blue-600 rounded-full animate-bounce delay-200"></div>
                            </div>
                        ) : (
                            <p className="text-gray-700 whitespace-pre-wrap">{response}</p>
                        )}
                    </div>
                    
                    {/* Display chat history */}
                    <div className="mt-4">
                        {chatHistoryState.map((chat, index) => (
                            <div key={index}>
                                <p className="text-sm text-gray-600">User: {chat.userInput}</p>
                                <p className="text-sm text-gray-800">AI: {chat.aiResponse}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatComponent;