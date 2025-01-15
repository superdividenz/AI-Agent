import React from 'react';
import ChatComponent from './components/ChatComponent';
import personality from './config/personality.json';
import messages from './config/messages.json';
import chatHistory from './data/chatHistory.json';

function App() {
    return (
        <div className="App">
            <ChatComponent 
                personality={personality} 
                messages={messages}
                initialChatHistory={chatHistory}
            />
        </div>
    );
}

export default App;