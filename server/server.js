const express = require('express');
const cors = require('cors');
require('dotenv').config();

const User = require('./models/User');
const Workspace = require('./models/Workspace');
const Collaboration = require('./models/Collaboration');
const authRoutes = require('./routes/auth');
const workspaceRoutes = require('./routes/workspace');
const collaborationRoutes = require('./routes/collaboration');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging (disabled for cleaner output)
// app.use((req, res, next) => {
//   console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
//   next();
// });

// Health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'ReqForge API Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/workspaces', workspaceRoutes);
app.use('/api/collaboration', collaborationRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handler
app.use((error, req, res, next) => {
  res.status(error.status || 500).json({
    success: false,
    message: error.message || 'Internal server error'
  });
});

// Start server
const startServer = async () => {
  try {
    await User.createTable();
    await Workspace.createTable();
    await Collaboration.createTable();
    
    app.listen(PORT, () => {
      console.log(`🚀 ReqForge Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();