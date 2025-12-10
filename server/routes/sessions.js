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

    const newSession = {
      id: uuidv4(),
      clientId,
      recruiterId: req.user.id,
      status: 'active',
      startTime: new Date().toISOString(),
      endTime: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    console.log(`[SESSIONS] Creating new session:`, { 
      id: newSession.id, 
      clientId: newSession.clientId, 
      recruiterId: newSession.recruiterId 
    });

    await dbStore.saveSessions([newSession]);
    
    console.log(`[SESSIONS] Session saved successfully for client ${clientId}`);

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

// Get active session for logged-in client
router.get('/me/active', verifyClient, async (req, res) => {
  try {
    ensureDb();
    const clientId = req.user.id;
    
    console.log(`[SESSIONS] Client ${clientId} requesting active session`);
    
    // Get all sessions for this client
    const allSessions = await dbStore.getSessions({ clientId });
    console.log(`[SESSIONS] Found ${allSessions.length} total sessions for client ${clientId}`);
    
    const activeSession = allSessions.find(s => s.status === 'active') || null;
    
    if (!activeSession) {
      console.log(`[SESSIONS] No active session found for client ${clientId}`);
      return res.json(null);
    }
    
    console.log(`[SESSIONS] Active session found: ${activeSession.id} for client ${clientId}`);
    
    // Get recruiter info
    const recruiters = await dbStore.getRecruiters();
    const recruiter = recruiters.find(r => r.id === activeSession.recruiterId);
    
    // Get jobs applied during this session
    const allJobs = await dbStore.getJobs({ clientId });
    const sessionStart = new Date(activeSession.startTime);
    const sessionJobs = allJobs.filter(job => {
      const jobDate = new Date(job.createdAt || job.date);
      return jobDate >= sessionStart &&
             (job.status === 'Applied' || job.status === 'To be Applied');
    });
    
    // Calculate duration
    const now = new Date();
    const durationMs = now - sessionStart;
    const durationMinutes = Math.round(durationMs / 1000 / 60);
    const hours = Math.floor(durationMinutes / 60);
    const minutes = durationMinutes % 60;
    
    res.json({
      ...activeSession,
      recruiter: recruiter ? { id: recruiter.id, name: recruiter.name, email: recruiter.email } : null,
      jobsApplied: sessionJobs.length,
      duration: {
        totalMinutes: durationMinutes,
        hours,
        minutes,
        formatted: hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`
      }
    });
  } catch (error) {
    console.error('Error fetching active session:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get session history for logged-in client
router.get('/me/history', verifyClient, async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    ensureDb();
    const clientId = req.user.id;
    
    const allSessions = await dbStore.getSessions({ clientId });
    const completedSessions = allSessions
      .filter(s => s.status === 'completed' && s.endTime)
      .sort((a, b) => new Date(b.endTime) - new Date(a.endTime))
      .slice(0, parseInt(limit));
    
    const allJobs = await dbStore.getJobs({ clientId });
    const recruiters = await dbStore.getRecruiters();
    
    const sessionsWithDetails = completedSessions.map(session => {
      const recruiter = recruiters.find(r => r.id === session.recruiterId);
      const sessionStart = new Date(session.startTime);
      const sessionEnd = new Date(session.endTime);
      
      const sessionJobs = allJobs.filter(job => {
        const jobDate = new Date(job.createdAt || job.date);
        return jobDate >= sessionStart &&
               jobDate <= sessionEnd &&
               (job.status === 'Applied' || job.status === 'To be Applied');
      });
      
      const durationMs = sessionEnd - sessionStart;
      const durationMinutes = Math.round(durationMs / 1000 / 60);
      const hours = Math.floor(durationMinutes / 60);
      const minutes = durationMinutes % 60;
      
      return {
        ...session,
        recruiter: recruiter ? { id: recruiter.id, name: recruiter.name, email: recruiter.email } : null,
        jobsApplied: sessionJobs.length,
        duration: {
          totalMinutes: durationMinutes,
          hours,
          minutes,
          formatted: hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`
        }
      };
    });
    
    res.json(sessionsWithDetails);
  } catch (error) {
    console.error('Error fetching session history:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;


