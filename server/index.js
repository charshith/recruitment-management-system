const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

// Initialize database connection if enabled
if (process.env.USE_DB === 'true' || process.env.USE_DB === '1') {
  try {
    require('./config/database');
    console.log('📊 Database connection initialized');
  } catch (error) {
    console.warn('⚠️  Database connection failed, using file storage:', error.message);
  }
}

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting - exclude auth routes (login needs to be more lenient)
const rateLimiter = require('./middleware/rateLimiter');
app.use('/api', (req, res, next) => {
  // Skip rate limiting for login endpoints
  if (req.path === '/auth/recruiter/login' || req.path === '/auth/admin/login') {
    return next();
  }
  rateLimiter(req, res, next);
});

// Request logging (simple)
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/recruiters', require('./routes/recruiters'));
app.use('/api/clients', require('./routes/clients'));
app.use('/api/jobs', require('./routes/jobs'));
app.use('/api/sessions', require('./routes/sessions'));
app.use('/api/admin', require('./routes/admin'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler (must be last)
const errorHandler = require('./middleware/errorHandler');
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
});


