npm install
npm start
backend node server.js

project-root/
│
├── frontend/ # Frontend directory
│ ├── src/
│ │ ├── components/
│ │ │ └── ChatComponent.js
│ │ ├── config/
│ │ │ ├── personality.json
│ │ │ └── messages.json
│ │ ├── data/
│ │ │ └── chatHistory.json
│ │ ├── App.js
│ │ └── index.js
│ ├── public/
│ │ └── index.html
│ ├── package.json
│ └── .gitignore
│
├── backend/  
│ ├── server.js
│ ├── chat.db # SQLite database file
│ ├── package.json
│ ├── package-lock.json
│ └── ...
├── .gitignore
└── README.md
