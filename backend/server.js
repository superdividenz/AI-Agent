require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to SQLite database
const db = new sqlite3.Database(process.env.DATABASE_PATH, (err) => {
    if (err) {
        console.error('Error connecting to SQLite database:', err);
    } else {
        console.log('Connected to SQLite database');

        // Create a table for chat history if it doesn't exist
        db.run(`
            CREATE TABLE IF NOT EXISTS chats (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_input TEXT,
                ai_response TEXT,
                personality TEXT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `, (err) => {
            if (err) {
                console.error('Error creating chats table:', err);
            } else {
                // Add personality column if it doesn't exist
                db.run(`
                    ALTER TABLE chats ADD COLUMN personality TEXT
                `, (alterErr) => {
                    if (alterErr) {
                        if (alterErr.message.includes('duplicate column name: personality')) {
                            console.log('Personality column already exists in chats table');
                        } else {
                            console.error('Error adding personality column:', alterErr);
                        }
                    } else {
                        console.log('Added or confirmed personality column in chats table');
                    }
                });
            }
        });
    }
});

// Handle Hyperbolic API requests
app.post('/api/chat', async (req, res) => {
    const { userInput, personality } = req.body;
    console.log('Received user input:', userInput, 'Personality:', personality);

    const url = process.env.HYPERBOLIC_API_URL;
    const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.HYPERBOLIC_API_KEY}`,
    };
    const body = JSON.stringify({
        model: 'meta-llama/Llama-3.3-70B-Instruct',
        messages: [
            {
                role: 'system',
                content: `You are an AI with a ${personality?.tone || 'default'} tone, with ${personality?.humor || 'default'} humor, and ${personality?.verbosity || 'default'} verbosity.`
            },
            {
                role: 'user',
                content: userInput,
            },
        ],
        max_tokens: 512,
        temperature: 0.1,
        top_p: 0.9,
        stream: false,
    });

    try {
        console.log('Sending request to Hyperbolic API...');
        const response = await fetch(url, {
            method: 'POST',
            headers,
            body,
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const json = await response.json();
        console.log('Received response from Hyperbolic API:', json);

        const aiResponse = json.choices[0].message.content;

        // Save chat history to SQLite
        db.run(
            'INSERT INTO chats (user_input, ai_response, personality) VALUES (?, ?, ?)',
            [userInput, aiResponse, JSON.stringify(personality || {})],
            (err) => {
                if (err) {
                    console.error('Error saving chat:', err);
                }
            }
        );

        res.json({ aiResponse });
    } catch (error) {
        console.error('Error fetching response from Hyperbolic API:', error);
        res.status(500).json({ error: 'Failed to fetch response' });
    }
});

// Fetch chat history
app.get('/api/chat-history', (req, res) => {
    db.all('SELECT * FROM chats ORDER BY timestamp DESC', (err, rows) => {
        if (err) {
            console.error('Error fetching chat history:', err);
            res.status(500).json({ error: 'Failed to fetch chat history' });
        } else {
            // Parse the personality JSON string back to an object
            const historyWithParsedPersonality = rows.map(row => ({
                ...row,
                personality: JSON.parse(row.personality || '{}')
            }));
            res.json(historyWithParsedPersonality);
        }
    });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));