const fs = require('fs').promises;
const path = require('path');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Check if database should be used
const USE_DB = process.env.USE_DB === 'true' || process.env.USE_DB === '1';

// If using database, import dbStore
let dbStore = null;
if (USE_DB) {
  try {
    dbStore = require('./dbStore');
  } catch (error) {
  }
}

const DATA_DIR = path.join(__dirname, '../data');

// Ensure data directory exists (async)
const ensureDataDir = async () => {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
};

// Initialize default data if files don't exist
const initializeData = async () => {
  await ensureDataDir();
  
  const recruitersFile = path.join(DATA_DIR, 'recruiters.json');
  const clientsFile = path.join(DATA_DIR, 'clients.json');
  const jobsFile = path.join(DATA_DIR, 'jobs.json');
  const sessionsFile = path.join(DATA_DIR, 'sessions.json');
  const notificationsFile = path.join(DATA_DIR, 'notifications.json');

  try {
    // Initialize recruiters with default password (hashed)
    try {
      await fs.access(recruitersFile);
    } catch {
      const defaultPassword = await bcrypt.hash('password123', 10);
      const defaultRecruiters = [
        {
          id: 'rec1',
          name: 'John Recruiter',
          email: 'recruiter@example.com',
          password: defaultPassword,
          assignedClients: ['client1']
        }
      ];
      await fs.writeFile(recruitersFile, JSON.stringify(defaultRecruiters, null, 2));
    }

    // Initialize clients
    try {
      await fs.access(clientsFile);
    } catch {
      const defaultClients = [
        {
          id: 'client1',
          name: 'Tech Corp',
          email: 'client@example.com',
          assignedRecruiter: 'rec1',
          monthlyTarget: 200,
          dailyTarget: 30,
          instructions: 'Focus on remote positions in software development. Salary range: $80k-$150k.'
        }
      ];
      await fs.writeFile(clientsFile, JSON.stringify(defaultClients, null, 2));
    }

    // Initialize empty arrays for jobs, sessions, notifications
    const files = [
      { path: jobsFile, data: [] },
      { path: sessionsFile, data: [] },
      { path: notificationsFile, data: [] }
    ];

    for (const file of files) {
      try {
        await fs.access(file.path);
      } catch {
        await fs.writeFile(file.path, JSON.stringify(file.data, null, 2));
      }
    }
  } catch (error) {
    console.error('Error initializing data:', error);
  }
};

// Initialize on module load
initializeData();

// In-memory cache with TTL (5 minutes)
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const getCacheKey = (filename) => `file:${filename}`;

// Helper functions to read/write data (async)
const readFile = async (filename, useCache = true) => {
  const cacheKey = getCacheKey(filename);
  
  if (useCache && cache.has(cacheKey)) {
    const cached = cache.get(cacheKey);
    if (Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }
    cache.delete(cacheKey);
  }

  const filePath = path.join(DATA_DIR, filename);
  try {
    const data = await fs.readFile(filePath, 'utf8');
    const parsed = JSON.parse(data);
    
    if (useCache) {
      cache.set(cacheKey, { data: parsed, timestamp: Date.now() });
    }
    
    return parsed;
  } catch (error) {
    if (error.code === 'ENOENT') {
      return [];
    }
    throw error;
  }
};

const writeFile = async (filename, data, invalidateCache = true) => {
  const filePath = path.join(DATA_DIR, filename);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
  
  if (invalidateCache) {
    const cacheKey = getCacheKey(filename);
    cache.delete(cacheKey);
    // Update cache with new data
    cache.set(cacheKey, { data, timestamp: Date.now() });
  }
};

// Data access functions - use database if available, otherwise fall back to files
const getRecruiters = async () => {
  if (USE_DB && dbStore) {
    return await dbStore.getRecruiters();
  }
  return await readFile('recruiters.json');
};

const saveRecruiters = async (recruiters) => {
  if (USE_DB && dbStore) {
    return await dbStore.saveRecruiters(recruiters);
  }
  return await writeFile('recruiters.json', recruiters);
};

const getClients = async () => {
  if (USE_DB && dbStore) {
    return await dbStore.getClients();
  }
  return await readFile('clients.json');
};

const saveClients = async (clients) => {
  if (USE_DB && dbStore) {
    return await dbStore.saveClients(clients);
  }
  return await writeFile('clients.json', clients);
};

const getJobs = async (filters) => {
  if (USE_DB && dbStore) {
    return await dbStore.getJobs(filters || {});
  }
  const jobs = await readFile('jobs.json');
  // Apply basic filtering for file-based storage
  if (filters) {
    let filtered = jobs;
    if (filters.clientId) {
      filtered = filtered.filter(j => j.clientId === filters.clientId);
    }
    if (filters.recruiterId) {
      filtered = filtered.filter(j => j.recruiterId === filters.recruiterId);
    }
    if (filters.status) {
      filtered = filtered.filter(j => j.status === filters.status);
    }
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(j =>
        j.companyName.toLowerCase().includes(searchLower) ||
        j.jobTitle.toLowerCase().includes(searchLower) ||
        (j.location && j.location.toLowerCase().includes(searchLower))
      );
    }
    // Pagination
    if (filters.limit) {
      const offset = filters.offset || 0;
      filtered = filtered.slice(offset, offset + filters.limit);
    }
    return filtered;
  }
  return jobs;
};

const saveJobs = async (jobs) => {
  if (USE_DB && dbStore) {
    return await dbStore.saveJobs(jobs);
  }
  return await writeFile('jobs.json', jobs);
};

const getSessions = async (filters) => {
  if (USE_DB && dbStore) {
    return await dbStore.getSessions(filters || {});
  }
  const sessions = await readFile('sessions.json');
  if (filters) {
    let filtered = sessions;
    if (filters.clientId) {
      filtered = filtered.filter(s => s.clientId === filters.clientId);
    }
    if (filters.recruiterId) {
      filtered = filtered.filter(s => s.recruiterId === filters.recruiterId);
    }
    if (filters.status) {
      filtered = filtered.filter(s => s.status === filters.status);
    }
    if (filters.limit) {
      filtered = filtered.slice(0, filters.limit);
    }
    return filtered;
  }
  return sessions;
};

const saveSessions = async (sessions) => {
  if (USE_DB && dbStore) {
    return await dbStore.saveSessions(sessions);
  }
  return await writeFile('sessions.json', sessions);
};

const getNotifications = async (filters) => {
  if (USE_DB && dbStore) {
    return await dbStore.getNotifications(filters || {});
  }
  const notifications = await readFile('notifications.json');
  if (filters) {
    let filtered = notifications;
    if (filters.clientId) {
      filtered = filtered.filter(n => n.clientId === filters.clientId);
    }
    if (filters.read !== undefined) {
      filtered = filtered.filter(n => n.read === filters.read);
    }
    if (filters.limit) {
      filtered = filtered.slice(0, filters.limit);
    }
    return filtered;
  }
  return notifications;
};

const saveNotifications = async (notifications) => {
  if (USE_DB && dbStore) {
    return await dbStore.saveNotifications(notifications);
  }
  return await writeFile('notifications.json', notifications);
};

// Clear cache function (useful for testing)
const clearCache = () => {
  cache.clear();
};

module.exports = {
  getRecruiters,
  saveRecruiters,
  getClients,
  saveClients,
  getJobs,
  saveJobs,
  getSessions,
  saveSessions,
  getNotifications,
  saveNotifications,
  clearCache
};
