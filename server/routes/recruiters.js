const express = require('express');
const router = express.Router();
const authRoutes = require('./auth');
const { verifyToken } = authRoutes;

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

// Get current recruiter profile
router.get('/me', verifyToken, async (req, res) => {
  try {
    ensureDb();
    
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    // Try direct lookup first
    let recruiter = await dbStore.getRecruiterById(req.user.id);
    
    // If not found, try by email (in case of ID mismatch)
    if (!recruiter && req.user.email) {
      recruiter = await dbStore.getRecruiterByEmail(req.user.email);
      if (recruiter) {
        // ID mismatch - return error to force re-login
        return res.status(401).json({ 
          error: 'Session invalid',
          message: 'Please logout and login again.'
        });
      }
    }

    if (!recruiter) {
      return res.status(404).json({ 
        error: 'Recruiter not found',
        message: 'Your account may have been deleted. Please contact administrator or login again.'
      });
    }

    // Remove password from response
    const { password: _, ...recruiterWithoutPassword } = recruiter;

    res.json(recruiterWithoutPassword);
  } catch (error) {
    console.error('Error fetching recruiter profile:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get recruiter's assigned clients
router.get('/me/clients', verifyToken, async (req, res) => {
  try {
    ensureDb();
    
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    // First verify the recruiter exists - try by ID, then by email
    let recruiter = await dbStore.getRecruiterById(req.user.id);
    
    if (!recruiter && req.user.email) {
      recruiter = await dbStore.getRecruiterByEmail(req.user.email);
      if (recruiter) {
        return res.status(401).json({ 
          error: 'Session invalid',
          message: 'Please logout and login again.'
        });
      }
    }

    if (!recruiter) {
      return res.status(404).json({ 
        error: 'Recruiter not found',
        message: 'Your account may have been deleted. Please contact administrator or login again.'
      });
    }

    // Ensure assignedClients is an array
    if (!Array.isArray(recruiter.assignedClients)) {
      recruiter.assignedClients = [];
    }

    const clients = await dbStore.getClients();
    
    // Get assigned clients - use recruiter.id from database
    const assignedClients = clients.filter(c => c.assignedRecruiter === recruiter.id);
    
    // Get jobs for all clients assigned to this recruiter
    const clientIds = assignedClients.map(c => c.id);
    let jobs = [];
    for (const clientId of clientIds) {
      const clientJobs = await dbStore.getJobs({ clientId });
      jobs.push(...clientJobs);
    }

    // Get stats for each client
    const clientsWithStats = assignedClients.map(client => {
      const clientJobs = jobs.filter(j => j.clientId === client.id);
      
      // Get today's date in YYYY-MM-DD format (using local timezone)
      const now = new Date();
      const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      const todayUTC = now.toISOString().split('T')[0];
      
      // Count today's applications - check both date formats and include "To be Applied"
      const todayJobs = clientJobs.filter(j => {
        const jobDate = j.date ? (typeof j.date === 'string' ? j.date : j.date.toISOString().split('T')[0]) : '';
        const matchesDate = jobDate === today || jobDate === todayUTC;
        const matchesStatus = j.status === 'Applied' || j.status === 'To be Applied';
        return matchesDate && matchesStatus;
      });
      
      return {
        ...client,
        todayApplications: todayJobs.length,
        totalApplications: clientJobs.filter(j => j.status === 'Applied' || j.status === 'To be Applied').length
      };
    });

    res.json(clientsWithStats);
  } catch (error) {
    console.error('Error fetching clients:', error);
    res.status(500).json({ 
      error: 'Server error',
      message: error.message || 'Failed to fetch clients'
    });
  }
});

// Get recruiter dashboard stats
router.get('/me/dashboard', verifyToken, async (req, res) => {
  try {
    ensureDb();
    
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    // First verify the recruiter exists - try by ID, then by email
    let recruiter = await dbStore.getRecruiterById(req.user.id);
    
    if (!recruiter && req.user.email) {
      recruiter = await dbStore.getRecruiterByEmail(req.user.email);
      if (recruiter) {
        return res.status(401).json({ 
          error: 'Session invalid',
          message: 'Please logout and login again.'
        });
      }
    }
    
    if (!recruiter) {
      return res.status(404).json({ 
        error: 'Recruiter not found',
        message: 'Your account may have been deleted. Please contact administrator or login again.'
      });
    }
    
    const clients = await dbStore.getClients();
    const recruiterClients = clients.filter(c => c.assignedRecruiter === recruiter.id);
    const clientIds = recruiterClients.map(c => c.id);
    
    // Get all jobs for recruiter's clients
    let recruiterJobs = [];
    for (const clientId of clientIds) {
      const clientJobs = await dbStore.getJobs({ clientId });
      recruiterJobs.push(...clientJobs);
    }

    // Get today's date in YYYY-MM-DD format (using local timezone)
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const todayUTC = now.toISOString().split('T')[0];
    
    // Count today's applications - check both date formats and include "To be Applied"
    const todayJobs = recruiterJobs.filter(j => {
      // Handle both string and Date object formats
      const jobDate = j.date ? (typeof j.date === 'string' ? j.date : j.date.toISOString().split('T')[0]) : '';
      const matchesDate = jobDate === today || jobDate === todayUTC;
      const matchesStatus = j.status === 'Applied' || j.status === 'To be Applied';
      return matchesDate && matchesStatus;
    });
    
    const thisWeek = getWeekDates();
    const weekJobs = recruiterJobs.filter(j => {
      // Handle both string and Date object formats
      const jobDate = j.date ? (typeof j.date === 'string' ? j.date : j.date.toISOString().split('T')[0]) : '';
      return thisWeek.includes(jobDate) && j.status === 'Applied';
    });

    const thisMonth = new Date().toISOString().slice(0, 7);
    const monthJobs = recruiterJobs.filter(j => {
      // Handle both string and Date object formats
      const jobDate = j.date ? (typeof j.date === 'string' ? j.date : j.date.toISOString().split('T')[0]) : '';
      return jobDate.startsWith(thisMonth) && j.status === 'Applied';
    });

    // Use recruiter.id from database (not token ID) to ensure consistency
    const assignedClients = clients.filter(c => c.assignedRecruiter === recruiter.id);

    res.json({
      todayApplications: todayJobs.length,
      weekApplications: weekJobs.length,
      monthApplications: monthJobs.length,
      assignedClients: assignedClients.length,
      clients: assignedClients.map(client => ({
        id: client.id,
        name: client.name,
        dailyTarget: client.dailyTarget,
        todayApplications: recruiterJobs.filter(j => {
          const jobDate = j.date ? (typeof j.date === 'string' ? j.date : j.date.toISOString().split('T')[0]) : '';
          return j.clientId === client.id && jobDate === today && j.status === 'Applied';
        }).length
      }))
    });
  } catch (error) {
    console.error('Error fetching dashboard:', error);
    res.status(500).json({ 
      error: 'Server error',
      message: error.message || 'Failed to fetch dashboard data'
    });
  }
});

// Helper function to get week dates
function getWeekDates() {
  const today = new Date();
  const day = today.getDay();
  const diff = today.getDate() - day;
  const weekStart = new Date(today.setDate(diff));
  const dates = [];
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + i);
    dates.push(date.toISOString().split('T')[0]);
  }
  
  return dates;
}

// Get analytics data for charts
router.get('/me/analytics', verifyToken, async (req, res) => {
  try {
    const { period = '30' } = req.query; // days
    const days = parseInt(period);
    ensureDb();
    
    // First verify recruiter exists
    const recruiter = await dbStore.getRecruiterById(req.user.id);
    if (!recruiter) {
      return res.status(404).json({ error: 'Recruiter not found' });
    }
    
    const jobs = await dbStore.getJobs({});
    const clients = await dbStore.getClients();
    const sessions = await dbStore.getSessions({});
    
    // Filter recruiter's jobs - use recruiter.id from database
    const recruiterJobs = jobs.filter(j => {
      const client = clients.find(c => c.id === j.clientId);
      return client && client.assignedRecruiter === recruiter.id;
    });

    // Filter recruiter's sessions - use recruiter.id from database
    const recruiterSessions = sessions.filter(s => s.recruiterId === recruiter.id);

    // Date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Daily trends (last N days)
    const dailyTrends = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayJobs = recruiterJobs.filter(j => {
        const jobDate = j.date ? (typeof j.date === 'string' ? j.date : j.date.toISOString().split('T')[0]) : '';
        return jobDate === dateStr && j.status === 'Applied';
      });
      dailyTrends.push({
        date: dateStr,
        count: dayJobs.length,
        label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      });
    }

    // Status distribution
    const statusCounts = {
      Applied: recruiterJobs.filter(j => j.status === 'Applied').length,
      'Not Fit': recruiterJobs.filter(j => j.status === 'Not Fit').length,
      Duplicate: recruiterJobs.filter(j => j.status === 'Duplicate').length
    };

    // Client performance
    const clientPerformance = clients
      .filter(c => c.assignedRecruiter === recruiter.id)
      .map(client => {
        const clientJobs = recruiterJobs.filter(j => j.clientId === client.id && j.status === 'Applied');
        const today = new Date().toISOString().split('T')[0];
        const todayJobs = clientJobs.filter(j => {
          const jobDate = j.date ? (typeof j.date === 'string' ? j.date : j.date.toISOString().split('T')[0]) : '';
          return jobDate === today;
        });
        
        return {
          clientId: client.id,
          clientName: client.name,
          total: clientJobs.length,
          today: todayJobs.length,
          target: client.dailyTarget || 0,
          completionRate: client.dailyTarget > 0 ? (todayJobs.length / client.dailyTarget) * 100 : 0
        };
      })
      .sort((a, b) => b.total - a.total);

    // Session statistics
    const sessionStats = {
      total: recruiterSessions.length,
      active: recruiterSessions.filter(s => s.status === 'active').length,
      completed: recruiterSessions.filter(s => s.status === 'completed').length,
      averageDuration: 0 // Will calculate if needed
    };

    // Calculate average session duration
    const completedSessions = recruiterSessions.filter(s => s.status === 'completed' && s.startTime && s.endTime);
    if (completedSessions.length > 0) {
      const totalDuration = completedSessions.reduce((sum, s) => {
        const duration = new Date(s.endTime) - new Date(s.startTime);
        return sum + duration;
      }, 0);
      sessionStats.averageDuration = Math.round(totalDuration / completedSessions.length / 1000 / 60); // minutes
    }

    res.json({
      dailyTrends,
      statusDistribution: statusCounts,
      clientPerformance,
      sessionStats,
      period: days
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get activity timeline
router.get('/me/timeline', verifyToken, async (req, res) => {
  try {
    const { limit = 50 } = req.query;
    ensureDb();
    
    // First verify recruiter exists
    const recruiter = await dbStore.getRecruiterById(req.user.id);
    if (!recruiter) {
      return res.status(404).json({ error: 'Recruiter not found' });
    }
    
    const jobs = await dbStore.getJobs({});
    const sessions = await dbStore.getSessions({});
    const clients = await dbStore.getClients();
    
    // Filter recruiter's data - use recruiter.id from database
    const recruiterJobs = jobs.filter(j => {
      const client = clients.find(c => c.id === j.clientId);
      return client && client.assignedRecruiter === recruiter.id;
    });

    const recruiterSessions = sessions.filter(s => s.recruiterId === recruiter.id);

    // Combine jobs and sessions into timeline
    const timeline = [
      ...recruiterJobs.map(job => ({
        id: job.id,
        type: 'job',
        action: `Applied to ${job.companyName}`,
        description: `${job.jobTitle}${job.location ? ` in ${job.location}` : ''}`,
        status: job.status,
        date: job.createdAt || job.date,
        clientId: job.clientId,
        clientName: clients.find(c => c.id === job.clientId)?.name || 'Unknown'
      })),
      ...recruiterSessions
        .filter(s => s.status === 'completed' && s.endTime)
        .map(session => ({
          id: session.id,
          type: 'session',
          action: 'Completed session',
          description: `Session with ${clients.find(c => c.id === session.clientId)?.name || 'Unknown'}`,
          status: 'completed',
          date: session.endTime,
          clientId: session.clientId,
          clientName: clients.find(c => c.id === session.clientId)?.name || 'Unknown',
          duration: session.startTime && session.endTime 
            ? Math.round((new Date(session.endTime) - new Date(session.startTime)) / 1000 / 60)
            : 0
        }))
    ];

    // Sort by date (newest first) and limit
    timeline.sort((a, b) => new Date(b.date) - new Date(a.date));
    const limited = timeline.slice(0, parseInt(limit));

    res.json(limited);
  } catch (error) {
    console.error('Error fetching timeline:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get productivity insights
router.get('/me/insights', verifyToken, async (req, res) => {
  try {
    ensureDb();
    const jobs = await dbStore.getJobs({});
    ensureDb();
    const sessions = await dbStore.getSessions({});
    ensureDb();
    const clients = await dbStore.getClients();
    
    // First verify recruiter exists
    const recruiterId = String(req.user.id).trim();
    const recruiter = await dbStore.getRecruiterById(recruiterId);
    if (!recruiter) {
      return res.status(404).json({ error: 'Recruiter not found' });
    }
    
    const recruiterJobs = jobs.filter(j => {
      const client = clients.find(c => c.id === j.clientId);
      return client && client.assignedRecruiter === recruiter.id;
    });

    const recruiterSessions = sessions.filter(s => s.recruiterId === recruiter.id);

    // Best performing times (hour of day)
    const hourStats = {};
    recruiterJobs.forEach(job => {
      if (job.createdAt) {
        const hour = new Date(job.createdAt).getHours();
        hourStats[hour] = (hourStats[hour] || 0) + 1;
      }
    });
    const bestHour = Object.entries(hourStats).sort((a, b) => b[1] - a[1])[0];
    
    // Daily streaks
    const today = new Date().toISOString().split('T')[0];
    let streak = 0;
    let checkDate = new Date();
    while (true) {
      const dateStr = checkDate.toISOString().split('T')[0];
      const dayJobs = recruiterJobs.filter(j => {
        const jobDate = j.date ? (typeof j.date === 'string' ? j.date : j.date.toISOString().split('T')[0]) : '';
        return jobDate === dateStr && j.status === 'Applied';
      });
      if (dayJobs.length > 0) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    // Average applications per session
    const completedSessions = recruiterSessions.filter(s => s.status === 'completed');
    let avgPerSession = 0;
    if (completedSessions.length > 0) {
      const jobsPerSession = completedSessions.map(session => {
        const sessionStart = new Date(session.startTime);
        const sessionEnd = session.endTime ? new Date(session.endTime) : new Date();
        return recruiterJobs.filter(job => {
          const jobDate = new Date(job.createdAt || job.date);
          return jobDate >= sessionStart && jobDate <= sessionEnd;
        }).length;
      });
      avgPerSession = Math.round(
        jobsPerSession.reduce((sum, count) => sum + count, 0) / jobsPerSession.length
      );
    }

    // Achievement badges
    const badges = [];
    if (recruiterJobs.filter(j => j.status === 'Applied').length >= 100) {
      badges.push({ id: 'century', name: 'Century Club', description: 'Applied to 100+ jobs' });
    }
    if (streak >= 7) {
      badges.push({ id: 'week_streak', name: 'Week Warrior', description: '7+ day streak' });
    }
    if (streak >= 30) {
      badges.push({ id: 'month_streak', name: 'Month Master', description: '30+ day streak' });
    }
    if (avgPerSession >= 10) {
      badges.push({ id: 'productive', name: 'Productivity Pro', description: '10+ jobs per session' });
    }

    res.json({
      bestPerformingHour: bestHour ? { hour: parseInt(bestHour[0]), count: bestHour[1] } : null,
      currentStreak: streak,
      averagePerSession: avgPerSession,
      totalSessions: recruiterSessions.length,
      totalJobs: recruiterJobs.filter(j => j.status === 'Applied').length,
      badges
    });
  } catch (error) {
    console.error('Error fetching insights:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;


