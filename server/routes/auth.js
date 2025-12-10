const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { validateLogin } = require('../middleware/validator');

// Database is required - no file storage fallback
let dbStore = null;
try {
  dbStore = require('../utils/dbStore');
} catch (error) {
  console.error('❌ Database is required but not available:', error.message);
  throw new Error('Database connection is required. Please ensure database is configured and running.');
}

// Helper to ensure database is available
const ensureDb = () => {
  if (!dbStore) {
    throw new Error('Database is not available');
  }
  return dbStore;
};

// JWT Secret - use environment variable or fallback for development
// WARNING: In production, JWT_SECRET must be set in environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

if (process.env.NODE_ENV === 'production' && JWT_SECRET === 'your-secret-key-change-in-production') {
  console.error('⚠️  WARNING: Using default JWT_SECRET in production is insecure!');
  console.error('⚠️  Please set JWT_SECRET environment variable.');
}

// Recruiter Login
router.post('/recruiter/login', validateLogin, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    ensureDb();
    const recruiter = await dbStore.getRecruiterByEmail(email);

    // Strict validation - account must exist
    if (!recruiter) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password exists (account is activated)
    if (!recruiter.password) {
      return res.status(401).json({ error: 'Account not activated. Please contact administrator.' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, recruiter.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: recruiter.id, email: recruiter.email, role: 'recruiter' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Remove password from response
    const { password: _, ...recruiterWithoutPassword } = recruiter;

    res.json({
      token,
      recruiter: recruiterWithoutPassword
    });
  } catch (error) {
    console.error('Login error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// Client Login
router.post('/client/login', validateLogin, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    ensureDb();
    const client = await dbStore.getClientByEmail(email);

    if (!client) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!client.password) {
      return res.status(401).json({ error: 'Account not activated. Please contact admin to set your password.' });
    }

    const isValidPassword = await bcrypt.compare(password, client.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: client.id, email: client.email, role: 'client' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Remove password from response
    const { password: _, ...clientWithoutPassword } = client;

    res.json({
      token,
      client: clientWithoutPassword
    });
  } catch (error) {
    console.error('Client login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// Admin Login
router.post('/admin/login', validateLogin, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    ensureDb();
    const admin = await dbStore.getAdminByEmail(email);

    if (!admin) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, admin.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: admin.id, email: admin.email, role: 'admin' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Remove password from response
    const { password: _, ...adminWithoutPassword } = admin;

    res.json({
      token,
      admin: adminWithoutPassword
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// Verify token middleware
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired. Please login again.' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    res.status(401).json({ error: 'Token verification failed' });
  }
};

// Verify admin token middleware
const verifyAdmin = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

module.exports = router;
module.exports.verifyToken = verifyToken;
module.exports.verifyAdmin = verifyAdmin;


