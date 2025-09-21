// ==================== UPDATED SERVER.JS WITH CORS FIX ====================
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');
const userRoutes = require('./routes/userRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Security middleware
app.use(helmet());

// CORS Configuration - Updated for Vite
const allowedOrigins = [
  'http://localhost:3000',      // Create React App default
  'http://localhost:5173',      // Vite default port
  'http://localhost:5174',      // Vite fallback port
  process.env.FRONTEND_URL      // Production URL
].filter(Boolean); // Remove undefined values

app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://task-manager-m67u.vercel.app',
    'https://task-manager-89rp.vercel.app',
    /https:\/\/.*\.vercel\.app$/  // Allow any Vercel domain
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/team-task-manager', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected successfully'))
.catch((error) => console.log('MongoDB connection error:', error));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/users', userRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    message: 'Server is running', 
    timestamp: new Date().toISOString(),
    cors: 'Configured for Vite development'
  });
});

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`CORS enabled for origins: ${allowedOrigins.join(', ')}`);
});

// ==================== ALTERNATIVE: SIMPLE CORS FIX ====================
// If you prefer a simpler approach, just replace the CORS section with:

/*
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:5174',
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true
}));
*/