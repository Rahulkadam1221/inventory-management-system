const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
require('dotenv').config();

// Connect to Database
connectDB();

const app = express();
const server = http.createServer(app);

// Configure CORS for production
const allowedOrigins = process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : [];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // Allow non-browser clients
    if (origin.match(/http:\/\/localhost:\d+/) || origin.match(/http:\/\/127\.0\.0\.1:\d+/)) {
      return callback(null, true); // Allow any local development port
    }
    if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.length === 0) {
      return callback(null, true); // Allow if in list or if no strict origins defined
    }
    callback(new Error('Not allowed by CORS'));
  },
  methods: ["GET", "POST", "PUT", "DELETE"],
};

const io = new Server(server, { cors: corsOptions });

const PORT = process.env.PORT || 5000;

// Middleware to attach io to req
app.use((req, res, next) => {
  req.io = io;
  next();
});

const auth = require('./routes/authRoutes');
const products = require('./routes/productRoutes');
const orders = require('./routes/orderRoutes');
const sales = require('./routes/salesRoutes');
const notifications = require('./routes/notificationRoutes');
const stock = require('./routes/stockRoutes');

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Mount routers
app.use('/api/auth', auth);
app.use('/api/products', products);
app.use('/api/orders', orders);
app.use('/api/sales', sales);
app.use('/api/notifications', notifications);
app.use('/api/stock', stock);

// Basic Routes
app.get('/api/status', (req, res) => {
  res.json({ 
    message: 'IMS Backend is healthy', 
    timestamp: new Date().toISOString(),
    status: 'online'
  });
});

// Socket.io Connection
io.on('connection', (socket) => {
  console.log('🔌 New client connected:', socket.id);
  socket.on('disconnect', () => {
    console.log('❌ Client disconnected');
  });
});

// Start Server
server.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
