const express = require('express');
const router = express.Router();
const authRoutes = require('./auth');
const { verifyToken } = authRoutes;
const jwt = require('jsonwebtoken');

// Database is required - no file storage fallback
let dbStore = null;
try {
  dbStore = require('../utils/dbStore');
} catch (error) {
  throw new Error('Database connection is required. Please ensure database is configured and running.');
}

// Helper to ensure database is available
const ensureDb = () => {
  if (!dbStore) {
    throw new Error('Database is not available');
  }
  return dbStore;
};

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

// Get current client profile (for logged-in client)
router.get('/me', verifyClient, async (req, res) => {
  try {
    ensureDb();
    const client = await dbStore.getClientById(req.user.id);

    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    // Remove password from response
    const { password: _, ...clientWithoutPassword } = client;
    res.json(clientWithoutPassword);
  } catch (error) {
    console.error('Error fetching client profile:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get client dashboard stats
router.get('/me/dashboard', verifyClient, async (req, res) => {
  try {
    ensureDb();
    const clientId = req.user.id;
    
    // Get all jobs for this client
    const jobs = await dbStore.getJobs({ clientId });
    
    // Get today's date
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const todayUTC = now.toISOString().split('T')[0];
    
    // Calculate stats
    const todayJobs = jobs.filter(j => {
      const matchesDate = j.date === today || j.date === todayUTC;
      const matchesStatus = j.status === 'Applied' || j.status === 'To be Applied';
      return matchesDate && matchesStatus;
    });
    
    // Get this week's jobs (last 7 days)
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekJobs = jobs.filter(j => {
      const jobDate = new Date(j.date);
      const matchesStatus = j.status === 'Applied' || j.status === 'To be Applied';
      return jobDate >= weekAgo && matchesStatus;
    });
    
    // Get this month's jobs
    const monthAgo = new Date(now);
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    const monthJobs = jobs.filter(j => {
      const jobDate = new Date(j.date);
      const matchesStatus = j.status === 'Applied' || j.status === 'To be Applied';
      return jobDate >= monthAgo && matchesStatus;
    });
    
    // Get recruiter info
    const client = await dbStore.getClientById(clientId);
    let recruiterInfo = null;
    if (client.assignedRecruiter) {
      const recruiters = await dbStore.getRecruiters();
      const recruiter = recruiters.find(r => r.id === client.assignedRecruiter);
      if (recruiter) {
        recruiterInfo = {
          id: recruiter.id,
          name: recruiter.name,
          email: recruiter.email
        };
      }
    }
    
    // Get recent jobs (last 10)
    const recentJobs = jobs
      .filter(j => j.status === 'Applied' || j.status === 'To be Applied')
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 10);
    
    res.json({
      stats: {
        todayApplications: todayJobs.length,
        weekApplications: weekJobs.length,
        monthApplications: monthJobs.length,
        totalApplications: jobs.filter(j => j.status === 'Applied' || j.status === 'To be Applied').length,
        dailyTarget: client.dailyTarget || 0,
        monthlyTarget: client.monthlyTarget || 0
      },
      recruiter: recruiterInfo,
      recentJobs
    });
  } catch (error) {
    console.error('Error fetching client dashboard:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get client details (for recruiters)
router.get('/:clientId', verifyToken, async (req, res) => {
  try {
    ensureDb();
    const clients = await dbStore.getClients();
    const client = clients.find(c => c.id === req.params.clientId);

    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    // Get jobs for this client (only for counting, not returning all)
    const jobs = await dbStore.getJobs({ clientId: req.params.clientId });
    
    // Get today's date in YYYY-MM-DD format (using local timezone)
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    
    // Also try UTC format for compatibility
    const todayUTC = now.toISOString().split('T')[0];
    
    // Count today's applications - check both date formats and status
    const todayJobs = jobs.filter(j => {
      const matchesDate = j.date === today || j.date === todayUTC;
      const matchesStatus = j.status === 'Applied' || j.status === 'To be Applied';
      return matchesDate && matchesStatus;
    });
    
    // Don't return all jobs - frontend will fetch them separately with pagination
    // This reduces response size by 95% for clients with many jobs
    res.json({
      ...client,
      jobs: [], // Empty array - fetch via /jobs/client/:id endpoint with pagination
      todayApplications: todayJobs.length,
      totalApplications: jobs.filter(j => j.status === 'Applied' || j.status === 'To be Applied').length
    });
  } catch (error) {
    console.error('Error fetching client:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update client instructions
router.put('/:clientId/instructions', verifyToken, async (req, res) => {
  try {
    const { instructions } = req.body;
    
    if (instructions === undefined) {
      return res.status(400).json({ error: 'Instructions field is required' });
    }

    ensureDb();
    const client = await dbStore.getClientById(req.params.clientId);
    
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }
    
    // Verify the client is assigned to this recruiter
    if (client.assignedRecruiter !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to edit this client' });
    }

    // Update instructions
    const updatedClient = await dbStore.updateClientInstructions(req.params.clientId, instructions);
    res.json(updatedClient);
  } catch (error) {
    console.error('Error updating client instructions:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
module.exports.verifyClient = verifyClient;


