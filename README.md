# CSSWENG-SKK-Events-and-Members-Management-System

npm init npm install express mongoose dotenv hbs

### Instructions for .env file
1. Create .env file to run locally
2. Set variables to following:
```
PORT= <port number>
MONGODB_URI= <mongodb connection string>
```

### Project Layout
project/
├── views/
│   ├── layouts/
│   │   └── main.hbs
│   ├── index.hbs
│   └── member-database.hbs
├── public/
│   └── styles.css
├── models/
│   └── Member.js
├── app.js
└── .env
