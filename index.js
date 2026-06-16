const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dns = require('dns');

// MongoDB Atlas DNS 조회 오류(querySrv ECONNREFUSED) 해결을 위해 DNS 서버를 Google Public DNS로 명시
dns.setServers(['8.8.8.8', '8.8.4.4']);

require('dotenv').config();
const todoRouter = require('./routers/todos');

const app = express();
const PORT = process.env.PORT || 5000;

// --- MongoDB Connection ---
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/todo_db';

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('🍃 몽고디비 연결 성공');
  })
  .catch((err) => {
    console.error('❌ 몽고디비 연결 실패:', err);
  });

// --- Middlewares ---
// Enable CORS for all requests (useful when connecting from frontends on different ports/domains)
app.use(cors());

// Parse JSON request bodies
app.use(express.json());

// Custom request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
  });
  next();
});

// --- Routes ---

// 1. Root Endpoint (Welcome Page/Status Check)
app.get('/', (req, res) => {
  res.json({
    message: "Todo Application Backend API Server is running!",
    version: "1.0.0",
    status: "healthy",
    endpoints: {
      todos: {
        list: "GET /api/todos",
        create: "POST /api/todos",
        update: "PATCH /api/todos/:id",
        delete: "DELETE /api/todos/:id"
      }
    }
  });
});

// 2. Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: "UP", timestamp: new Date().toISOString() });
});

// 3. Todo API Routes
app.use('/api/todos', todoRouter);


// --- Error Handling Middleware ---
app.use((req, res, next) => {
  res.status(404).json({ error: "API Route Not Found" });
});

app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err.stack);
  res.status(500).json({
    error: "Internal Server Error",
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});


// --- Server Listener ---
app.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(`🚀 Todo Backend Server listening on port: ${PORT}`);
  console.log(`👉 Access locally at: http://localhost:${PORT}`);
  console.log(`🛠️  Run environment: ${process.env.NODE_ENV}`);
  console.log(`==================================================`);
});
