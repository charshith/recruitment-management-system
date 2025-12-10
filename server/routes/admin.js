const express = require('express');
const router = express.Router();
const authRoutes = require('./auth');
const { verifyAdmin } = authRoutes;
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

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

// Note: Database triggers now handle syncing automatically
// This function is kept for initial sync or manual fixes if needed
const syncRecruiterAssignedClients = async (recruiterId) => {
  ensureDb();
  
  try {
    const { query } = require('../config/database');
    
    // Get all clients assigned to this recruiter
    const result = await query(
      'SELECT id FROM clients WHERE assigned_recruiter = $1',
      [recruiterId]
    );
    
    const clientIds = result.rows.map(row => row.id);
    
    // Update recruiter's assigned_clients array
    await query(
      'UPDATE recruiters SET assigned_clients = $1, updated_at = $2 WHERE id = $3',
      [clientIds, new Date().toISOString(), recruiterId]
    );
  } catch (error) {
    console.error(`Error syncing assigned_clients for recruiter ${recruiterId}:`, error);
  }
};

// ============================================
// ADMIN MANAGEMENT
// ============================================
// Get current admin profile
router.get('/me', verifyAdmin, async (req, res) => {
  try {
    ensureDb();
    
    const admin = await dbStore.getAdminById(req.user.id);
    if (!admin) {
      return res.status(404).json({ error: 'Admin not found' });
    }
    
    const { password, ...adminWithoutPassword } = admin;
    res.json(adminWithoutPassword);
  } catch (error) {
    console.error('Error fetching admin profile:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/admins', verifyAdmin, async (req, res) => {
  try {
    ensureDb();
    
    const admins = await dbStore.getAdmins();
    // Remove passwords from response
    const adminsWithoutPasswords = admins.map(admin => {
      const { password, ...adminWithoutPassword } = admin;
      return adminWithoutPassword;
    });
    
    res.json(adminsWithoutPasswords);
  } catch (error) {
    console.error('Error fetching admins:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/admins', verifyAdmin, async (req, res) => {
  try {
    ensureDb();
    
    const { name, email, password, generatePassword } = req.body;
    
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }
    
    // Generate password if requested
    let adminPassword = password;
    let generatedPassword = null;
    if (generatePassword && !password) {
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
      generatedPassword = Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
      adminPassword = generatedPassword;
    }
    
    if (!adminPassword) {
      return res.status(400).json({ error: 'Password is required or generate one' });
    }
    
    if (adminPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    const newAdmin = {
      id: uuidv4(),
      name: name.trim(),
      email: email.trim(),
      password: hashedPassword,
      role: 'admin',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const admin = await dbStore.addAdmin(newAdmin);
    const { password: _, ...adminWithoutPassword } = admin;
    
    if (generatedPassword) {
      adminWithoutPassword.generatedPassword = generatedPassword;
    }
    
    res.status(201).json(adminWithoutPassword);
  } catch (error) {
    console.error('Error creating admin:', error);
    if (error.message && error.message.includes('duplicate')) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/admins/:adminId', verifyAdmin, async (req, res) => {
  try {
    ensureDb();
    
    const { name, email, password, generatePassword } = req.body;
    
    let admin = await dbStore.getAdminById(req.params.adminId);
    if (!admin) {
      return res.status(404).json({ error: 'Admin not found' });
    }
    
    // Handle password update
    let passwordUpdate = null;
    let generatedPassword = null;
    if (generatePassword && !password) {
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
      generatedPassword = Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
      passwordUpdate = await bcrypt.hash(generatedPassword, 10);
    } else if (password) {
      if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters' });
      }
      passwordUpdate = await bcrypt.hash(password, 10);
    }
    
    const updates = {
      name: name !== undefined ? name.trim() : admin.name,
      email: email !== undefined ? email.trim() : admin.email
    };
    
    if (passwordUpdate) {
      updates.password = passwordUpdate;
    }
    
    const updatedAdmin = await dbStore.updateAdmin(req.params.adminId, updates);
    const { password: _, ...adminWithoutPassword } = updatedAdmin;
    
    if (generatedPassword) {
      adminWithoutPassword.generatedPassword = generatedPassword;
    }
    
    res.json(adminWithoutPassword);
  } catch (error) {
    console.error('Error updating admin:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/admins/:adminId', verifyAdmin, async (req, res) => {
  try {
    ensureDb();
    
    // Prevent deleting yourself
    if (req.params.adminId === req.user.id) {
      return res.status(400).json({ error: 'You cannot delete your own account' });
    }
    
    await dbStore.deleteAdmin(req.params.adminId);
    res.json({ message: 'Admin deleted successfully' });
  } catch (error) {
    console.error('Error deleting admin:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============================================
// DASHBOARD STATS
// ============================================
router.get('/dashboard', verifyAdmin, async (req, res) => {
  try {
    ensureDb();
    const clients = await dbStore.getClients();
    const recruiters = await dbStore.getRecruiters();
    
    // Get today's date
    const today = new Date().toISOString().split('T')[0];
    const todayUTC = new Date().toISOString().split('T')[0];
    
    // Get all jobs
    const allJobs = await dbStore.getJobs({});
    
    // Count today's applications
    const todayJobs = allJobs.filter(j => {
      const jobDate = j.date ? (typeof j.date === 'string' ? j.date : j.date.toISOString().split('T')[0]) : '';
      return (jobDate === today || jobDate === todayUTC) && (j.status === 'Applied' || j.status === 'To be Applied');
    });
    
    // Count this week's applications
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekJobs = allJobs.filter(j => {
      const jobDate = j.date ? (typeof j.date === 'string' ? j.date : new Date(j.date).toISOString().split('T')[0]) : '';
      const jobDateObj = new Date(jobDate);
      return jobDateObj >= weekAgo && (j.status === 'Applied' || j.status === 'To be Applied');
    });
    
    // Count this month's applications
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    const monthJobs = allJobs.filter(j => {
      const jobDate = j.date ? (typeof j.date === 'string' ? j.date : new Date(j.date).toISOString().split('T')[0]) : '';
      const jobDateObj = new Date(jobDate);
      return jobDateObj >= monthAgo && (j.status === 'Applied' || j.status === 'To be Applied');
    });
    
    res.json({
      totalClients: clients.length,
      totalRecruiters: recruiters.length,
      todayApplications: todayJobs.length,
      weekApplications: weekJobs.length,
      monthApplications: monthJobs.length,
      totalJobs: allJobs.length
    });
  } catch (error) {
    console.error('Error fetching admin dashboard:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============================================
// CLIENT MANAGEMENT
// ============================================
router.get('/clients', verifyAdmin, async (req, res) => {
  try {
    ensureDb();
    
    const clients = await dbStore.getClients();
    const recruiters = await dbStore.getRecruiters();
    
    const recruiterMap = {};
    recruiters.forEach(r => {
      recruiterMap[r.id] = r.name;
    });
    
    const { page = 1, limit = 50, search, recruiterId } = req.query;
    let filtered = Array.isArray(clients) ? clients : [];
    
    if (search) {
      const searchLower = String(search).toLowerCase();
      filtered = filtered.filter(c => {
        const name = String(c.name || '').toLowerCase();
        const email = String(c.email || '').toLowerCase();
        return name.includes(searchLower) || email.includes(searchLower);
      });
    }
    
    if (recruiterId) {
      filtered = filtered.filter(c => c.assignedRecruiter === recruiterId);
    }
    
    const result = filtered.map(c => ({
      id: c.id,
      name: c.name || '',
      email: c.email || '',
      assignedRecruiter: c.assignedRecruiter || null,
      assignedRecruiterName: c.assignedRecruiter ? recruiterMap[c.assignedRecruiter] || null : null,
      monthlyTarget: c.monthlyTarget || 0,
      dailyTarget: c.dailyTarget || 0,
      instructions: c.instructions || '',
      todayApplications: 0,
      totalApplications: 0,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt
    }));
    
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 50;
    const total = result.length;
    const start = (pageNum - 1) * limitNum;
    const paginated = result.slice(start, start + limitNum);
    
    res.json({
      clients: paginated,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum) || 1
      }
    });
  } catch (error) {
    console.error('Error fetching clients:', error);
    res.json({
      clients: [],
      pagination: { page: 1, limit: 50, total: 0, totalPages: 1 }
    });
  }
});

router.get('/clients/:clientId', verifyAdmin, async (req, res) => {
  try {
    ensureDb();
    const client = await dbStore.getClientById(req.params.clientId);
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }
    
    // Get recruiter info
    const recruiters = await dbStore.getRecruiters();
    const recruiter = client.assignedRecruiter 
      ? recruiters.find(r => r.id === client.assignedRecruiter)
      : null;
    
    // Get jobs for this client
    const clientJobs = await dbStore.getJobs({ clientId: req.params.clientId });
    
    // Get sessions for this client
    const clientSessions = await dbStore.getSessions({ clientId: req.params.clientId });
    
    // Remove password hash, but include hasPassword boolean
    const { password, ...clientWithoutPassword } = client;
    
    res.json({
      ...clientWithoutPassword,
      hasPassword: !!password,
      assignedRecruiterName: recruiter ? recruiter.name : null,
      assignedRecruiterEmail: recruiter ? recruiter.email : null,
      jobs: clientJobs,
      sessions: clientSessions,
      stats: {
        totalJobs: clientJobs.length,
        appliedJobs: clientJobs.filter(j => j.status === 'Applied' || j.status === 'To be Applied').length,
        totalSessions: clientSessions.length,
        activeSessions: clientSessions.filter(s => s.status === 'active').length
      }
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/clients', verifyAdmin, async (req, res) => {
  try {
    const { name, email, password, assignedRecruiter, monthlyTarget, dailyTarget, instructions, generatePassword } = req.body;
    
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }
    
    let clientPassword = password;
    let generatedPassword = null;
    if (generatePassword && !password) {
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
      generatedPassword = Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
      clientPassword = generatedPassword;
    }
    
    const hashedPassword = clientPassword ? await bcrypt.hash(clientPassword, 10) : null;
    
    ensureDb();
    const { query } = require('../config/database');
    const clientId = uuidv4();
    
    await query(
      `INSERT INTO clients (id, name, email, password, assigned_recruiter, monthly_target, daily_target, instructions, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [clientId, name.trim(), email.trim(), hashedPassword, assignedRecruiter || null, monthlyTarget || 0, dailyTarget || 0, instructions || null, new Date().toISOString(), new Date().toISOString()]
    );
    
    const newClient = {
      id: clientId,
      name: name.trim(),
      email: email.trim(),
      assignedRecruiter: assignedRecruiter || null,
      monthlyTarget: monthlyTarget || 0,
      dailyTarget: dailyTarget || 0,
      instructions: instructions || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    if (generatedPassword) {
      newClient.generatedPassword = generatedPassword;
    }
    
    res.status(201).json(newClient);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/clients/:clientId', verifyAdmin, async (req, res) => {
  try {
    const { name, email, password, assignedRecruiter, monthlyTarget, dailyTarget, instructions, generatePassword } = req.body;
    
    ensureDb();
    const client = await dbStore.getClientById(req.params.clientId);
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }
    
    let passwordUpdate = null;
    let generatedPassword = null;
    if (generatePassword && !password) {
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
      generatedPassword = Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
      passwordUpdate = await bcrypt.hash(generatedPassword, 10);
    } else if (password) {
      passwordUpdate = await bcrypt.hash(password, 10);
    }
    
    const { query } = require('../config/database');
    const updates = [];
    const values = [];
    let paramIndex = 1;
    
    if (name !== undefined) {
      updates.push(`name = $${paramIndex++}`);
      values.push(name.trim());
    }
    if (email !== undefined) {
      updates.push(`email = $${paramIndex++}`);
      values.push(email.trim());
    }
    if (passwordUpdate) {
      updates.push(`password = $${paramIndex++}`);
      values.push(passwordUpdate);
    }
    if (assignedRecruiter !== undefined) {
      updates.push(`assigned_recruiter = $${paramIndex++}`);
      values.push(assignedRecruiter || null);
    }
    if (monthlyTarget !== undefined) {
      updates.push(`monthly_target = $${paramIndex++}`);
      values.push(monthlyTarget || 0);
    }
    if (dailyTarget !== undefined) {
      updates.push(`daily_target = $${paramIndex++}`);
      values.push(dailyTarget || 0);
    }
    if (instructions !== undefined) {
      updates.push(`instructions = $${paramIndex++}`);
      values.push(instructions || null);
    }
    
    updates.push(`updated_at = $${paramIndex++}`);
    values.push(new Date().toISOString());
    values.push(req.params.clientId);
    
    await query(
      `UPDATE clients SET ${updates.join(', ')} WHERE id = $${paramIndex}`,
      values
    );
    
    const updated = await dbStore.getClientById(req.params.clientId);
    const { password: _, ...updatedWithoutPassword } = updated;
    
    const response = {
      ...updatedWithoutPassword,
      hasPassword: !!updated.password
    };
    
    if (generatedPassword) {
      response.generatedPassword = generatedPassword;
    }
    
    res.json(response);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/clients/:clientId', verifyAdmin, async (req, res) => {
  try {
    ensureDb();
    await dbStore.deleteClient(req.params.clientId);
    res.json({ message: 'Client deleted successfully' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============================================
// RECRUITER MANAGEMENT
// ============================================
router.get('/recruiters', verifyAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 50, search } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    
    let allRecruiters;
    allRecruiters = await dbStore.getRecruiters();
    
    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      allRecruiters = allRecruiters.filter(r => 
        r.name.toLowerCase().includes(searchLower) || 
        r.email.toLowerCase().includes(searchLower)
      );
    }
    
    // Get stats for each recruiter
    ensureDb();
    const allJobs = await dbStore.getJobs({});
    
    // Get clients once
    let clients;
    clients = await dbStore.getClients();
    
    const today = new Date().toISOString().split('T')[0];
    const recruitersWithStats = allRecruiters.map(recruiter => {
      const recruiterJobs = allJobs.filter(j => j.recruiterId === recruiter.id);
      const todayJobs = recruiterJobs.filter(j => {
        const jobDate = j.date ? (typeof j.date === 'string' ? j.date : j.date.toISOString().split('T')[0]) : '';
        return (jobDate === today) && (j.status === 'Applied' || j.status === 'To be Applied');
      });
      
      // Get assigned clients
      const assignedClients = clients.filter(c => c.assignedRecruiter === recruiter.id);
      
      return {
        ...recruiter,
        todayApplications: todayJobs.length,
        totalApplications: recruiterJobs.filter(j => j.status === 'Applied' || j.status === 'To be Applied').length,
        assignedClientsCount: assignedClients.length,
        assignedClients: assignedClients.map(c => ({ id: c.id, name: c.name }))
      };
    });
    
    // Pagination
    const total = recruitersWithStats.length;
    const startIndex = (pageNum - 1) * limitNum;
    const paginatedRecruiters = recruitersWithStats.slice(startIndex, startIndex + limitNum);
    
    res.json({
      recruiters: paginatedRecruiters,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Error fetching recruiters:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/recruiters/:recruiterId', verifyAdmin, async (req, res) => {
  try {
    let recruiter;
    recruiter = await dbStore.getRecruiterById(req.params.recruiterId);
    
    if (!recruiter) {
      return res.status(404).json({ error: 'Recruiter not found' });
    }
    
    // Get assigned clients
    const clients = await dbStore.getClients();
    const assignedClients = clients.filter(c => c.assignedRecruiter === req.params.recruiterId);
    
    // Get jobs for this recruiter
    let recruiterJobs = [];
    ensureDb();
      recruiterJobs = await dbStore.getJobs({ recruiterId: req.params.recruiterId });
    
    
    // Get sessions for this recruiter
    let recruiterSessions = [];
    ensureDb();
      recruiterSessions = await dbStore.getSessions({ recruiterId: req.params.recruiterId });
    
    
    // Calculate stats
    const today = new Date().toISOString().split('T')[0];
    const todayJobs = recruiterJobs.filter(j => {
      const jobDate = j.date ? (typeof j.date === 'string' ? j.date : j.date.toISOString().split('T')[0]) : '';
      return (jobDate === today) && (j.status === 'Applied' || j.status === 'To be Applied');
    });
    
    res.json({
      ...recruiter,
      assignedClients: assignedClients,
      jobs: recruiterJobs,
      sessions: recruiterSessions,
      stats: {
        totalJobs: recruiterJobs.length,
        todayJobs: todayJobs.length,
        appliedJobs: recruiterJobs.filter(j => j.status === 'Applied' || j.status === 'To be Applied').length,
        totalSessions: recruiterSessions.length,
        activeSessions: recruiterSessions.filter(s => s.status === 'active').length,
        assignedClientsCount: assignedClients.length
      }
    });
  } catch (error) {
    console.error('Error fetching recruiter:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/recruiters', verifyAdmin, async (req, res) => {
  try {
    const { name, email, password, assignedClients, generatePassword } = req.body;
    
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }
    
    // Generate password if requested
    let recruiterPassword = password;
    let generatedPassword = null;
    if (generatePassword && !password) {
      // Generate a random 12-character password
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
      generatedPassword = Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
      recruiterPassword = generatedPassword;
    }
    
    if (!recruiterPassword) {
      return res.status(400).json({ error: 'Password is required or generate one' });
    }
    
    if (recruiterPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    
    const hashedPassword = await bcrypt.hash(recruiterPassword, 10);
    const newRecruiter = {
      id: uuidv4(),
      name: name.trim(),
      email: email.trim(),
      password: hashedPassword,
      assignedClients: assignedClients || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    ensureDb();
    const recruiters = await dbStore.getRecruiters();
    recruiters.push(newRecruiter);
    await dbStore.saveRecruiters(recruiters);
    const { password: _, ...recruiterWithoutPassword } = newRecruiter;
    
    // Return generated password if one was created
    if (generatedPassword) {
      recruiterWithoutPassword.generatedPassword = generatedPassword;
    }
    
    res.status(201).json(recruiterWithoutPassword);
  } catch (error) {
    console.error('Error creating recruiter:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/recruiters/:recruiterId', verifyAdmin, async (req, res) => {
  try {
    const { name, email, password, assignedClients, generatePassword } = req.body;
    
    ensureDb();
    const recruiter = await dbStore.getRecruiterById(req.params.recruiterId);
    if (!recruiter) {
      return res.status(404).json({ error: 'Recruiter not found' });
    }
    
    // Update clients' assignedRecruiter field if assignedClients changed
    if (assignedClients !== undefined) {
      const { getClient } = require('../config/database');
      const client = await getClient();
      try {
        await client.query('BEGIN');
        // First, unassign all clients from this recruiter
        await client.query(
          'UPDATE clients SET assigned_recruiter = NULL WHERE assigned_recruiter = $1',
          [req.params.recruiterId]
        );
        // Then assign new clients
        if (assignedClients.length > 0) {
          await client.query(
            `UPDATE clients SET assigned_recruiter = $1 WHERE id = ANY($2::text[])`,
            [req.params.recruiterId, assignedClients]
          );
        }
        await client.query('COMMIT');
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
      // Database triggers will automatically sync recruiter's assigned_clients array
    }
    
    // Update recruiter using saveRecruiters (get all, update one, save all)
    const recruiters = await dbStore.getRecruiters();
    const index = recruiters.findIndex(r => r.id === req.params.recruiterId);
    if (index === -1) {
      return res.status(404).json({ error: 'Recruiter not found' });
    }
    
    const updatedRecruiter = {
      ...recruiters[index],
      name: name !== undefined ? name.trim() : recruiters[index].name,
      email: email !== undefined ? email.trim() : recruiters[index].email,
      assignedClients: assignedClients !== undefined ? assignedClients : recruiters[index].assignedClients,
      updatedAt: new Date().toISOString()
    };
    
    // Handle password update
    let generatedPasswordValue = null;
    if (generatePassword && !password) {
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
      generatedPasswordValue = Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
      updatedRecruiter.password = await bcrypt.hash(generatedPasswordValue, 10);
    } else if (password) {
      if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters' });
      }
      updatedRecruiter.password = await bcrypt.hash(password, 10);
    }
    
    recruiters[index] = updatedRecruiter;
    await dbStore.saveRecruiters(recruiters);
    
    const { password: _, ...recruiterWithoutPassword } = updatedRecruiter;
    
    // Return generated password if one was created
    if (generatedPasswordValue) {
      recruiterWithoutPassword.generatedPassword = generatedPasswordValue;
    }
    
    res.json(recruiterWithoutPassword);
  } catch (error) {
    console.error('Error updating recruiter:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/recruiters/:recruiterId', verifyAdmin, async (req, res) => {
  try {
    ensureDb();
    await dbStore.deleteRecruiter(req.params.recruiterId);
    
    res.json({ message: 'Recruiter deleted successfully' });
  } catch (error) {
    console.error('Error deleting recruiter:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============================================
// JOB MANAGEMENT (Admin can view/edit/delete all jobs)
// ============================================
router.get('/jobs', verifyAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 50, search, clientId, recruiterId, status, dateFrom, dateTo } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    
    const filters = {
      search: search || undefined,
      clientId: clientId || undefined,
      recruiterId: recruiterId || undefined,
      status: status || undefined,
      limit: limitNum,
      offset: (pageNum - 1) * limitNum
    };
    
    ensureDb();
    let jobs = await dbStore.getJobs(filters);
    let total = await dbStore.getJobCount(filters);
    
    // Apply date filters if provided
    if (dateFrom || dateTo) {
      jobs = jobs.filter(j => {
        const jobDate = j.date ? (typeof j.date === 'string' ? j.date : j.date.toISOString().split('T')[0]) : '';
        if (dateFrom && jobDate < dateFrom) return false;
        if (dateTo && jobDate > dateTo) return false;
        return true;
      });
      total = jobs.length;
    }
    
    // Get client and recruiter names
    const clients = await dbStore.getClients();
    const recruiters = await dbStore.getRecruiters();
    
    const jobsWithNames = jobs.map(job => {
      const client = clients.find(c => c.id === job.clientId);
      const recruiter = recruiters.find(r => r.id === job.recruiterId);
      return {
        ...job,
        clientName: client ? client.name : 'Unknown',
        recruiterName: recruiter ? recruiter.name : 'Unknown'
      };
    });
    
    res.json({
      jobs: jobsWithNames,
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

router.put('/jobs/:jobId', verifyAdmin, async (req, res) => {
  try {
    const { companyName, jobTitle, jobLink, location, status, notes } = req.body;
    
    ensureDb();
    const updatedJob = await dbStore.updateJob(req.params.jobId, {
      companyName: companyName?.trim(),
      jobTitle: jobTitle?.trim(),
      jobLink: jobLink?.trim(),
      location: location?.trim(),
      status,
      notes: notes?.trim()
    });
    if (!updatedJob) {
      return res.status(404).json({ error: 'Job not found' });
    }
    res.json(updatedJob);
  } catch (error) {
    console.error('Error updating job:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/jobs/:jobId', verifyAdmin, async (req, res) => {
  try {
    await dbStore.deleteJob(req.params.jobId);
    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    console.error('Error deleting job:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============================================
// SESSION MANAGEMENT
// ============================================
router.get('/sessions', verifyAdmin, async (req, res) => {
  try {
    const { status, clientId, recruiterId } = req.query;
    
    ensureDb();
    const filters = {};
    if (status) filters.status = status;
    if (clientId) filters.clientId = clientId;
    if (recruiterId) filters.recruiterId = recruiterId;
    const sessions = await dbStore.getSessions(filters);
    
    // Get client and recruiter names
    const clients = await dbStore.getClients();
    const recruiters = await dbStore.getRecruiters();
    
    const sessionsWithNames = sessions.map(session => {
      const client = clients.find(c => c.id === session.clientId);
      const recruiter = recruiters.find(r => r.id === session.recruiterId);
      return {
        ...session,
        clientName: client ? client.name : 'Unknown',
        recruiterName: recruiter ? recruiter.name : 'Unknown'
      };
    });
    
    res.json(sessionsWithNames);
  } catch (error) {
    console.error('Error fetching sessions:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/sessions/:sessionId/end', verifyAdmin, async (req, res) => {
  try {
    ensureDb();
    await dbStore.updateSession(req.params.sessionId, {
      status: 'completed',
      endTime: new Date().toISOString()
    });
    res.json({ message: 'Session ended successfully' });
  } catch (error) {
    console.error('Error ending session:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============================================
// BULK OPERATIONS
// ============================================
router.post('/recruiters/:recruiterId/assign-clients', verifyAdmin, async (req, res) => {
  try {
    const { clientIds } = req.body; // Array of client IDs
    
    if (!Array.isArray(clientIds)) {
      return res.status(400).json({ error: 'clientIds must be an array' });
    }
    
    // Verify recruiter exists
    let recruiter;
    recruiter = await dbStore.getRecruiterById(req.params.recruiterId);
    
    if (!recruiter) {
      return res.status(404).json({ error: 'Recruiter not found' });
    }
    
    // Update clients
    ensureDb();
    const { getClient } = require('../config/database');
    const client = await getClient();
    try {
      await client.query('BEGIN');
      // Unassign all current clients from this recruiter
      await client.query(
        'UPDATE clients SET assigned_recruiter = NULL WHERE assigned_recruiter = $1',
        [req.params.recruiterId]
      );
      // Assign new clients
      if (clientIds.length > 0) {
        await client.query(
          `UPDATE clients SET assigned_recruiter = $1, updated_at = $2 WHERE id = ANY($3::text[])`,
          [req.params.recruiterId, new Date().toISOString(), clientIds]
        );
      }
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
    
    // Database triggers will automatically sync recruiter's assigned_clients array
    
    res.json({ message: 'Clients assigned successfully', assignedCount: clientIds.length });
  } catch (error) {
    console.error('Error assigning clients:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============================================
// EXPORT FUNCTIONALITY
// ============================================
router.get('/export/clients', verifyAdmin, async (req, res) => {
  try {
    const clients = await dbStore.getClients();
    const recruiters = await dbStore.getRecruiters();
    
    const csv = [
      ['Name', 'Email', 'Assigned Recruiter', 'Daily Target', 'Monthly Target', 'Created At'].join(','),
      ...clients.map(c => {
        const recruiter = c.assignedRecruiter ? recruiters.find(r => r.id === c.assignedRecruiter) : null;
        return [
          `"${c.name}"`,
          `"${c.email}"`,
          `"${recruiter ? recruiter.name : 'Unassigned'}"`,
          c.dailyTarget || 0,
          c.monthlyTarget || 0,
          c.createdAt || ''
        ].join(',');
      })
    ].join('\n');
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=clients.csv');
    res.send(csv);
  } catch (error) {
    console.error('Error exporting clients:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/export/jobs', verifyAdmin, async (req, res) => {
  try {
    const { dateFrom, dateTo, clientId, recruiterId } = req.query;
    
    ensureDb();
    const filters = {};
    if (clientId) filters.clientId = clientId;
    if (recruiterId) filters.recruiterId = recruiterId;
    let jobs = await dbStore.getJobs(filters);
    
    if (dateFrom || dateTo) {
      jobs = jobs.filter(j => {
        const jobDate = j.date ? (typeof j.date === 'string' ? j.date : j.date.toISOString().split('T')[0]) : '';
        if (dateFrom && jobDate < dateFrom) return false;
        if (dateTo && jobDate > dateTo) return false;
        return true;
      });
    }
    
    const clients = await dbStore.getClients();
    const recruiters = await dbStore.getRecruiters();
    
    const csv = [
      ['Date', 'Company', 'Job Title', 'Location', 'Status', 'Client', 'Recruiter', 'Link', 'Notes'].join(','),
      ...jobs.map(j => {
        const client = clients.find(c => c.id === j.clientId);
        const recruiter = recruiters.find(r => r.id === j.recruiterId);
        return [
          j.date || '',
          `"${j.companyName}"`,
          `"${j.jobTitle}"`,
          `"${j.location || ''}"`,
          j.status || '',
          `"${client ? client.name : 'Unknown'}"`,
          `"${recruiter ? recruiter.name : 'Unknown'}"`,
          `"${j.jobLink}"`,
          `"${(j.notes || '').replace(/"/g, '""')}"`
        ].join(',');
      })
    ].join('\n');
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=jobs.csv');
    res.send(csv);
  } catch (error) {
    console.error('Error exporting jobs:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============================================
// JOB ACTIVITY OVERVIEW
// ============================================
router.get('/jobs/activity', verifyAdmin, async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const daysNum = parseInt(days);
    
    ensureDb();
    const allJobs = await dbStore.getJobs({});
    
    // Filter by date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysNum);
    
    const filteredJobs = allJobs.filter(job => {
      const jobDate = job.date ? (typeof job.date === 'string' ? new Date(job.date) : job.date) : null;
      if (!jobDate) return false;
      return jobDate >= startDate && jobDate <= endDate && (job.status === 'Applied' || job.status === 'To be Applied');
    });
    
    // Group by date
    const dailyActivity = {};
    filteredJobs.forEach(job => {
      const date = typeof job.date === 'string' ? job.date : job.date.toISOString().split('T')[0];
      dailyActivity[date] = (dailyActivity[date] || 0) + 1;
    });
    
    // Group by recruiter
    const recruiterActivity = {};
    const recruiters = await dbStore.getRecruiters();
    filteredJobs.forEach(job => {
      const recruiter = recruiters.find(r => r.id === job.recruiterId);
      const recruiterName = recruiter ? recruiter.name : 'Unknown';
      recruiterActivity[recruiterName] = (recruiterActivity[recruiterName] || 0) + 1;
    });
    
    // Group by client
    const clientActivity = {};
    const clients = await dbStore.getClients();
    filteredJobs.forEach(job => {
      const client = clients.find(c => c.id === job.clientId);
      const clientName = client ? client.name : 'Unknown';
      clientActivity[clientName] = (clientActivity[clientName] || 0) + 1;
    });
    
    res.json({
      totalJobs: filteredJobs.length,
      dailyActivity,
      recruiterActivity,
      clientActivity,
      period: {
        start: startDate.toISOString().split('T')[0],
        end: endDate.toISOString().split('T')[0],
        days: daysNum
      }
    });
  } catch (error) {
    console.error('Error fetching job activity:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============================================
// REPORTS
// ============================================
router.get('/reports/daily', verifyAdmin, async (req, res) => {
  try {
    const { date } = req.query;
    const targetDate = date ? new Date(date) : new Date();
    const dateStr = targetDate.toISOString().split('T')[0];
    
    ensureDb();
    const allJobs = await dbStore.getJobs({});
    
    const dayJobs = allJobs.filter(j => {
      const jobDate = j.date ? (typeof j.date === 'string' ? j.date : j.date.toISOString().split('T')[0]) : '';
      return jobDate === dateStr;
    });
    
    const recruiters = await dbStore.getRecruiters();
    const clients = await dbStore.getClients();
    
    const report = {
      date: dateStr,
      totalApplications: dayJobs.filter(j => j.status === 'Applied' || j.status === 'To be Applied').length,
      byRecruiter: {},
      byClient: {},
      byStatus: {}
    };
    
    dayJobs.forEach(job => {
      const recruiter = recruiters.find(r => r.id === job.recruiterId);
      const client = clients.find(c => c.id === job.clientId);
      
      if (recruiter) {
        report.byRecruiter[recruiter.name] = (report.byRecruiter[recruiter.name] || 0) + 1;
      }
      if (client) {
        report.byClient[client.name] = (report.byClient[client.name] || 0) + 1;
      }
      report.byStatus[job.status] = (report.byStatus[job.status] || 0) + 1;
    });
    
    res.json(report);
  } catch (error) {
    console.error('Error generating daily report:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/reports/weekly', verifyAdmin, async (req, res) => {
  try {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);
    
    ensureDb();
    const allJobs = await dbStore.getJobs({});
    
    const weekJobs = allJobs.filter(j => {
      const jobDate = j.date ? (typeof j.date === 'string' ? new Date(j.date) : j.date) : null;
      if (!jobDate) return false;
      return jobDate >= startDate && jobDate <= endDate && (j.status === 'Applied' || j.status === 'To be Applied');
    });
    
    const recruiters = await dbStore.getRecruiters();
    const clients = await dbStore.getClients();
    
    const report = {
      period: {
        start: startDate.toISOString().split('T')[0],
        end: endDate.toISOString().split('T')[0]
      },
      totalApplications: weekJobs.length,
      byRecruiter: {},
      byClient: {},
      dailyBreakdown: {}
    };
    
    weekJobs.forEach(job => {
      const recruiter = recruiters.find(r => r.id === job.recruiterId);
      const client = clients.find(c => c.id === job.clientId);
      const date = typeof job.date === 'string' ? job.date : job.date.toISOString().split('T')[0];
      
      if (recruiter) {
        report.byRecruiter[recruiter.name] = (report.byRecruiter[recruiter.name] || 0) + 1;
      }
      if (client) {
        report.byClient[client.name] = (report.byClient[client.name] || 0) + 1;
      }
      report.dailyBreakdown[date] = (report.dailyBreakdown[date] || 0) + 1;
    });
    
    res.json(report);
  } catch (error) {
    console.error('Error generating weekly report:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/reports/monthly', verifyAdmin, async (req, res) => {
  try {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 1);
    
    ensureDb();
    const allJobs = await dbStore.getJobs({});
    
    const monthJobs = allJobs.filter(j => {
      const jobDate = j.date ? (typeof j.date === 'string' ? new Date(j.date) : j.date) : null;
      if (!jobDate) return false;
      return jobDate >= startDate && jobDate <= endDate && (j.status === 'Applied' || j.status === 'To be Applied');
    });
    
    const recruiters = await dbStore.getRecruiters();
    const clients = await dbStore.getClients();
    
    const report = {
      period: {
        start: startDate.toISOString().split('T')[0],
        end: endDate.toISOString().split('T')[0]
      },
      totalApplications: monthJobs.length,
      byRecruiter: {},
      byClient: {},
      weeklyBreakdown: {}
    };
    
    monthJobs.forEach(job => {
      const recruiter = recruiters.find(r => r.id === job.recruiterId);
      const client = clients.find(c => c.id === job.clientId);
      const date = typeof job.date === 'string' ? new Date(job.date) : job.date;
      const week = Math.floor((date - startDate) / (7 * 24 * 60 * 60 * 1000));
      const weekKey = `Week ${week + 1}`;
      
      if (recruiter) {
        report.byRecruiter[recruiter.name] = (report.byRecruiter[recruiter.name] || 0) + 1;
      }
      if (client) {
        report.byClient[client.name] = (report.byClient[client.name] || 0) + 1;
      }
      report.weeklyBreakdown[weekKey] = (report.weeklyBreakdown[weekKey] || 0) + 1;
    });
    
    res.json(report);
  } catch (error) {
    console.error('Error generating monthly report:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

