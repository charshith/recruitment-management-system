const express = require('express');
const router = express.Router();
const authRoutes = require('./auth');
const { verifyToken } = authRoutes;
const { validateJob } = require('../middleware/validator');
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');

// Middleware to verify client token
const verifyClient = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
    const decoded = jwt.verify(token, JWT_SECRET);
    
    if (decoded.role !== 'client') {
      return res.status(403).json({ error: 'Client access required' });
    }
    
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

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

// Add a new job application
router.post('/', verifyToken, validateJob, async (req, res) => {
  try {
    const { clientId, companyName, jobTitle, jobLink, location, status, notes } = req.body;

    // Verify client is assigned to this recruiter
    ensureDb();
    const clients = await dbStore.getClients();
    const client = clients.find(c => c.id === clientId);
    
    if (!client || client.assignedRecruiter !== req.user.id) {
      return res.status(403).json({ error: 'Client not assigned to you' });
    }

    const newJob = {
      id: uuidv4(),
      clientId,
      recruiterId: req.user.id,
      companyName: companyName.trim(),
      jobTitle: jobTitle.trim(),
      jobLink: jobLink.trim(),
      location: location ? location.trim() : '',
      status,
      notes: notes ? notes.trim() : '',
      date: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString()
    };

    await dbStore.addJob(newJob);

    // Create notification for client
    await dbStore.addNotification({
      id: uuidv4(),
      clientId,
      type: 'job_added',
      message: `New job application: ${companyName} - ${jobTitle}`,
      read: false,
      createdAt: new Date().toISOString()
    });

    res.status(201).json(newJob);
  } catch (error) {
    console.error('Error adding job:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update a job
router.put('/:jobId', verifyToken, validateJob, async (req, res) => {
  try {
    const { companyName, jobTitle, jobLink, location, status, notes } = req.body;

    ensureDb();
    const job = await dbStore.getJobById(req.params.jobId);
    
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }
    
    // Verify the job belongs to this recruiter's client
    const clients = await dbStore.getClients();
    const client = clients.find(c => c.id === job.clientId);
    
    if (!client || client.assignedRecruiter !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to edit this job' });
    }

    // Update job
    const updatedJob = await dbStore.updateJob(req.params.jobId, {
      companyName: companyName.trim(),
      jobTitle: jobTitle.trim(),
      jobLink: jobLink.trim(),
      location: location ? location.trim() : '',
      status,
      notes: notes ? notes.trim() : ''
    });
    
    res.json(updatedJob);
  } catch (error) {
    console.error('Error updating job:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete a job
router.delete('/:jobId', verifyToken, async (req, res) => {
  try {
    ensureDb();
    const job = await dbStore.getJobById(req.params.jobId);
    
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Verify the job belongs to this recruiter's client
    const clients = await dbStore.getClients();
    const client = clients.find(c => c.id === job.clientId);
    
    if (!client || client.assignedRecruiter !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to delete this job' });
    }

    await dbStore.deleteJob(req.params.jobId);

    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    console.error('Error deleting job:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get jobs for current client (client viewing their own jobs)
router.get('/me', verifyClient, async (req, res) => {
  try {
    const { page = 1, limit = 50, status, search } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    
    ensureDb();
    
    // Database query with filters and pagination
    const filters = {
      clientId: req.user.id,
      status: status || undefined,
      search: search || undefined,
      limit: limitNum,
      offset: (pageNum - 1) * limitNum
    };
    const jobs = await dbStore.getJobs(filters);
    const total = await dbStore.getJobCount({
      clientId: req.user.id,
      status: status || undefined,
      search: search || undefined
    });
    
    res.json({
      jobs,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get jobs for a client (with pagination) - for recruiters
router.get('/client/:clientId', verifyToken, async (req, res) => {
  try {
    const { page = 1, limit = 50, status, search } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    
    ensureDb();
    
    // Database query with filters and pagination
    const filters = {
      clientId: req.params.clientId,
      status: status || undefined,
      search: search || undefined,
      limit: limitNum,
      offset: (pageNum - 1) * limitNum
    };
    const jobs = await dbStore.getJobs(filters);
    const total = await dbStore.getJobCount({
      clientId: req.params.clientId,
      status: status || undefined,
      search: search || undefined
    });
    
    res.json({
      jobs,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;


