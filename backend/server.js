require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const fs = require('fs');
const app = express();

app.use(cors());
app.use(express.json());

// Load bot personality from JSON file
let botPersonality = {};
try {
  botPersonality = JSON.parse(fs.readFileSync('./personality.json', 'utf8'));
} catch (err) {
  console.error('Error reading personality file:', err);
}

// Connect to SQLite database
const db = new sqlite3.Database(process.env.DATABASE_PATH, (err) => {
  if (err) {
    console.error('Error connecting to SQLite database:', err);
  } else {
    console.log('Connected to SQLite database');
    db.run(`
      CREATE TABLE IF NOT EXISTS chats (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_input TEXT,
        ai_response TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
  }
});

// Handle Hyperbolic API requests with personality
app.post('/api/chat', async (req, res) => {
  const { userInput } = req.body;
  console.log('Received user input:', userInput);

  const url = process.env.HYPERBOLIC_API_URL;
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${process.env.HYPERBOLIC_API_KEY}`,
  };
  const body = JSON.stringify({
    model: 'deepseek-ai/DeepSeek-V3',
    messages: [
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

    let aiResponse = json.choices[0].message.content;

    // Apply personality to the response
    if (botPersonality.useEmojis) {
      aiResponse += ` ${botPersonality.emojiSet[Math.floor(Math.random() * botPersonality.emojiSet.length)]}`;
    }
    if (Math.random() < 0.3) { // 30% chance to use a catchphrase
      aiResponse += ` ${botPersonality.catchPhrases[Math.floor(Math.random() * botPersonality.catchPhrases.length)]}`;
    }

    // Save chat history to SQLite
    db.run(
      'INSERT INTO chats (user_input, ai_response) VALUES (?, ?)',
      [userInput, aiResponse],
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
      res.json(rows);
    }
  });
});

// API for reloading personality
app.get('/api/reload-personality', (req, res) => {
  try {
    botPersonality = JSON.parse(fs.readFileSync('./personality.json', 'utf8'));
    res.json({ status: 'Personality reloaded successfully', botPersonality });
  } catch (err) {
    res.status(500).json({ error: 'Failed to reload personality', details: err.message });
  }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));