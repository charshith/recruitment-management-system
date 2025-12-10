const express = require('express');
const router = express.Router();
const authRoutes = require('./auth');
const { verifyToken } = authRoutes;
const { verifyClient } = require('./clients');

const { v4: uuidv4 } = require('uuid');

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

// Start a session
router.post('/start', verifyToken, async (req, res) => {
  try {
    const { clientId } = req.body;

    if (!clientId) {
      return res.status(400).json({ error: 'Client ID is required' });
    }

    // Verify client is assigned to this recruiter
    ensureDb();
    const clients = await dbStore.getClients();
    const client = clients.find(c => c.id === clientId);
    
    if (!client || client.assignedRecruiter !== req.user.id) {
      return res.status(403).json({ error: 'Client not assigned to you' });
    }

    // Check if there's an active session
    ensureDb();
    const activeSessions = await dbStore.getSessions({ 
      clientId, 
      recruiterId: req.user.id, 
      status: 'active' 
    });
    const activeSession = activeSessions.length > 0 ? activeSessions[0] : null;

    if (activeSession) {
      return res.status(400).json({ error: 'Session already active' });
    }

    // Ensure clientId is normalized (trimmed string)
    const normalizedClientId = String(clientId).trim();
    
    const newSession = {
      id: uuidv4(),
      clientId: normalizedClientId,
      recruiterId: String(req.user.id).trim(),
      status: 'active',
      startTime: new Date().toISOString(),
      endTime: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await dbStore.saveSessions([newSession]);

    // Create notification for client
    await dbStore.addNotification({
      id: uuidv4(),
      clientId,
      type: 'session_started',
      message: 'Your recruiter started applying to jobs',
      read: false,
      createdAt: new Date().toISOString()
    });

    res.status(201).json(newSession);
  } catch (error) {
    console.error('Error starting session:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// End a session
router.post('/end', verifyToken, async (req, res) => {
  try {
    const { clientId } = req.body;

    if (!clientId) {
      return res.status(400).json({ error: 'Client ID is required' });
    }

    ensureDb();
    const activeSessions = await dbStore.getSessions({ 
      clientId, 
      recruiterId: req.user.id, 
      status: 'active' 
    });
    const activeSession = activeSessions.length > 0 ? activeSessions[0] : null;

    if (!activeSession) {
      return res.status(400).json({ error: 'No active session found' });
    }

    await dbStore.updateSession(activeSession.id, {
      status: 'completed',
      endTime: new Date().toISOString()
    });
    activeSession.status = 'completed';
    activeSession.endTime = new Date().toISOString();

    // Create notification for client
    await dbStore.addNotification({
      id: uuidv4(),
      clientId,
      type: 'session_ended',
      message: 'Your recruiter finished the session',
      read: false,
      createdAt: new Date().toISOString()
    });

    res.json(activeSession);
  } catch (error) {
    console.error('Error ending session:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get active session for a client
router.get('/client/:clientId/active', verifyToken, async (req, res) => {
  try {
    ensureDb();
    const activeSessions = await dbStore.getSessions({ 
      clientId: req.params.clientId, 
      recruiterId: req.user.id, 
      status: 'active' 
    });
    const activeSession = activeSessions.length > 0 ? activeSessions[0] : null;

    res.json(activeSession || null);
  } catch (error) {
    console.error('Error fetching session:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get previous sessions for a client
router.get('/client/:clientId/history', verifyToken, async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    ensureDb();
    const completedSessions = await dbStore.getSessions({ 
      clientId: req.params.clientId, 
      recruiterId: req.user.id, 
      status: 'completed',
      limit: parseInt(limit)
    });
    
    const allJobs = await dbStore.getJobs({ clientId: req.params.clientId });
    
    // Map completed sessions with job counts and duration
    const clientSessions = completedSessions
      .filter(s => s.endTime)
      .sort((a, b) => new Date(b.endTime) - new Date(a.endTime))
      .map(session => {
        // Calculate jobs applied during this session
        const sessionStart = new Date(session.startTime);
        const sessionEnd = new Date(session.endTime);
        const sessionJobs = allJobs.filter(job => {
          const jobDate = new Date(job.createdAt || job.date);
          return job.clientId === session.clientId &&
                 jobDate >= sessionStart &&
                 jobDate <= sessionEnd &&
                 (job.status === 'Applied' || job.status === 'To be Applied');
        });
        
        // Calculate duration
        const durationMs = sessionEnd - sessionStart;
        const durationMinutes = Math.round(durationMs / 1000 / 60);
        const hours = Math.floor(durationMinutes / 60);
        const minutes = durationMinutes % 60;
        
        return {
          ...session,
          jobsApplied: sessionJobs.length,
          duration: {
            totalMinutes: durationMinutes,
            hours,
            minutes,
            formatted: hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`
          }
        };
      });

    res.json(clientSessions);
  } catch (error) {
    console.error('Error fetching session history:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============================================
// CLIENT-SIDE SESSION ENDPOINTS
// ============================================

// Get active session for logged-in client - EXACT SAME AS RECRUITER BUT NO RECRUITER FILTER
router.get('/me/active', verifyClient, async (req, res) => {
  try {
    ensureDb();
    const clientId = req.user.id;
    
    // Use same method as recruiter endpoint - just filter by clientId and status
    const activeSessions = await dbStore.getSessions({ 
      clientId, 
      status: 'active' 
    });
    const activeSession = activeSessions.length > 0 ? activeSessions[0] : null;

    if (!activeSession) {
      return res.json(null);
    }
    
    // Get jobs count for this session (same as recruiter view)
    const allJobs = await dbStore.getJobs({ clientId });
    const sessionStart = new Date(activeSession.startTime);
    const sessionJobs = allJobs.filter(job => {
      const jobDate = new Date(job.createdAt || job.date);
      return jobDate >= sessionStart &&
             (job.status === 'Applied' || job.status === 'To be Applied');
    });
    
    res.json({
      ...activeSession,
      jobsApplied: sessionJobs.length
    });
  } catch (error) {
    console.error('Error fetching active session:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get session history for logged-in client - EXACT SAME AS RECRUITER BUT NO RECRUITER FILTER
router.get('/me/history', verifyClient, async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    ensureDb();
    const clientId = req.user.id;
    
    // Use same method as recruiter endpoint
    const completedSessions = await dbStore.getSessions({ 
      clientId, 
      status: 'completed',
      limit: parseInt(limit)
    });
    
    const allJobs = await dbStore.getJobs({ clientId });
    
    // Map completed sessions with job counts and duration - EXACT SAME LOGIC AS RECRUITER
    const clientSessions = completedSessions
      .filter(s => s.endTime)
      .sort((a, b) => new Date(b.endTime) - new Date(a.endTime))
      .map(session => {
        // Calculate jobs applied during this session
        const sessionStart = new Date(session.startTime);
        const sessionEnd = new Date(session.endTime);
        const sessionJobs = allJobs.filter(job => {
          const jobDate = new Date(job.createdAt || job.date);
          return job.clientId === session.clientId &&
                 jobDate >= sessionStart &&
                 jobDate <= sessionEnd &&
                 (job.status === 'Applied' || job.status === 'To be Applied');
        });
        
        // Calculate duration
        const durationMs = sessionEnd - sessionStart;
        const durationMinutes = Math.round(durationMs / 1000 / 60);
        const hours = Math.floor(durationMinutes / 60);
        const minutes = durationMinutes % 60;
        
        return {
          ...session,
          jobsApplied: sessionJobs.length,
          duration: {
            totalMinutes: durationMinutes,
            hours,
            minutes,
            formatted: hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`
          }
        };
      });

    res.json(clientSessions);
  } catch (error) {
    console.error('Error fetching session history:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;


