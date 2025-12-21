// WebSocket Server for Portfolio Real-time Features
// Deploy this separately (Railway, Render, Heroku, or any Node.js hosting)

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

// CORS configuration
const io = new Server(server, {
  cors: {
    origin: [
      'https://karthikprasadm.github.io',
      'http://localhost:3000',
      'http://localhost:8080',
      /https:\/\/.+\.vercel\.app/,
      /http:\/\/localhost:\d+/
    ],
    methods: ['GET', 'POST'],
    credentials: true
  }
});

app.use(cors());
app.use(express.json());

// Store connected clients and visitor count
let visitorCount = 0;
const connectedClients = new Map();

// Store real-time data
const realtimeData = {
  visitorCount: 0,
  activeUsers: 0,
  lastUpdate: null,
  galleryUpdates: [],
  notifications: []
};

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);
  
  // Increment visitor count
  visitorCount++;
  realtimeData.visitorCount = visitorCount;
  realtimeData.activeUsers = io.engine.clientsCount;
  realtimeData.lastUpdate = new Date().toISOString();
  
  // Store client info
  connectedClients.set(socket.id, {
    id: socket.id,
    connectedAt: new Date(),
    userAgent: socket.handshake.headers['user-agent']
  });
  
  // Send initial data to newly connected client
  socket.emit('initial-data', {
    visitorCount: realtimeData.visitorCount,
    activeUsers: realtimeData.activeUsers,
    timestamp: realtimeData.lastUpdate
  });
  
  // Broadcast updated visitor count to all clients
  io.emit('visitor-count-update', {
    count: realtimeData.visitorCount,
    activeUsers: realtimeData.activeUsers,
    timestamp: realtimeData.lastUpdate
  });
  
  // Handle gallery update requests
  socket.on('request-gallery-updates', () => {
    socket.emit('gallery-updates', {
      updates: realtimeData.galleryUpdates.slice(-10), // Last 10 updates
      timestamp: new Date().toISOString()
    });
  });
  
  // Handle new gallery item added (admin/authorized users only)
  socket.on('gallery-item-added', (data) => {
    // SECURITY: Verify authorization
    const authToken = data.authToken || socket.handshake.auth?.token;
    const adminToken = process.env.ADMIN_TOKEN || process.env.WEBSOCKET_ADMIN_TOKEN;
    
    if (!adminToken || authToken !== adminToken) {
      socket.emit('error', { message: 'Unauthorized: Write operations not allowed' });
      console.warn(`Unauthorized gallery-item-added attempt from ${socket.id}`);
      return;
    }
    
    const update = {
      id: Date.now(),
      type: 'gallery-item-added',
      data: data,
      timestamp: new Date().toISOString()
    };
    
    realtimeData.galleryUpdates.push(update);
    
    // Broadcast to all clients
    io.emit('gallery-update', update);
  });
  
  // Handle notification broadcasts (admin/authorized users only)
  socket.on('send-notification', (notification) => {
    // SECURITY: Verify authorization
    const authToken = notification.authToken || socket.handshake.auth?.token;
    const adminToken = process.env.ADMIN_TOKEN || process.env.WEBSOCKET_ADMIN_TOKEN;
    
    if (!adminToken || authToken !== adminToken) {
      socket.emit('error', { message: 'Unauthorized: Write operations not allowed' });
      console.warn(`Unauthorized send-notification attempt from ${socket.id}`);
      return;
    }
    
    const notif = {
      id: Date.now(),
      type: notification.type || 'info',
      message: notification.message,
      title: notification.title,
      timestamp: new Date().toISOString()
    };
    
    realtimeData.notifications.push(notif);
    
    // Broadcast to all clients
    io.emit('notification', notif);
  });
  
  // Handle ping/pong for connection health
  socket.on('ping', () => {
    socket.emit('pong', { timestamp: new Date().toISOString() });
  });
  
  // Handle client activity (page views, interactions)
  socket.on('client-activity', (activity) => {
    // Log activity (you can store this in a database)
    console.log(`Activity from ${socket.id}:`, activity);
    
    // Broadcast activity to other clients (optional)
    socket.broadcast.emit('user-activity', {
      socketId: socket.id,
      activity: activity,
      timestamp: new Date().toISOString()
    });
  });
  
  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
    
    // Decrement active users
    realtimeData.activeUsers = io.engine.clientsCount;
    
    // Remove client from map
    connectedClients.delete(socket.id);
    
    // Broadcast updated count
    io.emit('visitor-count-update', {
      count: realtimeData.visitorCount,
      activeUsers: realtimeData.activeUsers,
      timestamp: new Date().toISOString()
    });
  });
  
  // Handle errors
  socket.on('error', (error) => {
    console.error(`Socket error for ${socket.id}:`, error);
  });
});

// REST API endpoints for server status
app.get('/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    connections: io.engine.clientsCount,
    totalVisitors: realtimeData.visitorCount
  });
});

app.get('/stats', (req, res) => {
  res.json({
    visitorCount: realtimeData.visitorCount,
    activeUsers: realtimeData.activeUsers,
    connectedClients: Array.from(connectedClients.values()),
    lastUpdate: realtimeData.lastUpdate,
    recentUpdates: realtimeData.galleryUpdates.slice(-5)
  });
});

// Start server
const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || '0.0.0.0';

server.listen(PORT, HOST, () => {
  console.log(`🚀 WebSocket server running on ${HOST}:${PORT}`);
  console.log(`📡 Socket.IO server ready for connections`);
  console.log(`🌐 CORS enabled for portfolio domain`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

