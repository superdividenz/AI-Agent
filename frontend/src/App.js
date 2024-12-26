import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Chatbot from './components/Chatbot';
import PlayerStats from './components/PlayerStats';

function App() {
    return (
        <Router>
            <div className="flex flex-col min-h-screen bg-gray-100">
                <Header />
                <div className="flex-1 p-4">
                    <Routes>
                        <Route path="/" element={<Chatbot />} />
                        <Route path="/player-stats" element={<PlayerStats />} />
                    </Routes>
                </div>
            </div>
        </Router>
    );
}

export default App;