/**
 * Database Store - PostgreSQL implementation
 * Replaces file-based storage with PostgreSQL database
 */

// Lazy load database to avoid circular dependencies
const getDbFunctions = () => {
  try {
    const db = require('../config/database');
    return { query: db.query, getClient: db.getClient };
  } catch (error) {
    throw new Error('Database not available');
  }
};

const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

// Initialize default data if database is empty
const initializeDefaultData = async () => {
  try {
    const { query: dbQuery } = getDbFunctions();
    
    // Check if admins table has any data
    const adminResult = await dbQuery('SELECT COUNT(*) as count FROM admins');
    if (parseInt(adminResult.rows[0].count) === 0) {
      // Create default admin
      const adminPassword = await bcrypt.hash('admin123', 10);
      await dbQuery(
        `INSERT INTO admins (id, name, email, password, role, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          'admin1',
          'Admin User',
          'admin@example.com',
          adminPassword,
          'admin',
          new Date().toISOString(),
          new Date().toISOString()
        ]
      );
    }
    
    // Check if recruiters table has any data
    const result = await dbQuery('SELECT COUNT(*) as count FROM recruiters');
    if (parseInt(result.rows[0].count) === 0) {
      // Create default recruiter
      const defaultPassword = await bcrypt.hash('password123', 10);
      await dbQuery(
        `INSERT INTO recruiters (id, name, email, password, assigned_clients, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          'rec1',
          'John Recruiter',
          'recruiter@example.com',
          defaultPassword,
          ['client1'],
          new Date().toISOString(),
          new Date().toISOString()
        ]
      );

      // Create default client
      await dbQuery(
        `INSERT INTO clients (id, name, email, assigned_recruiter, monthly_target, daily_target, instructions, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          'client1',
          'Tech Corp',
          'client@example.com',
          'rec1',
          200,
          30,
          'Focus on remote positions in software development. Salary range: $80k-$150k.',
          new Date().toISOString(),
          new Date().toISOString()
        ]
      );

    }
  } catch (error) {
    console.error('Error initializing default data:', error);
  }
};

// Initialize on module load (but don't block if DB isn't ready)
// Only initialize if database is actually enabled and available
if (process.env.USE_DB === 'true' || process.env.USE_DB === '1') {
  // Delay initialization to allow server to start first
  setTimeout(() => {
    initializeDefaultData().catch(err => {
      // Silently fail - database might not be set up yet
      // This is expected if PostgreSQL isn't running
    });
  }, 1000);
}

// ============================================
// ADMINS
// ============================================
const getAdmins = async () => {
  try {
    const { query: dbQuery } = getDbFunctions();
    const result = await dbQuery('SELECT * FROM admins ORDER BY created_at ASC');
    return result.rows.map(row => ({
      id: row.id,
      name: row.name,
      email: row.email,
      password: row.password,
      role: row.role || 'admin',
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));
  } catch (error) {
    console.error('Error in getAdmins:', error);
    throw error;
  }
};

const getAdminById = async (id) => {
  const { query: dbQuery } = getDbFunctions();
  const result = await dbQuery('SELECT * FROM admins WHERE id = $1', [id]);
  if (result.rows.length === 0) return null;
  const row = result.rows[0];
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    password: row.password,
    role: row.role || 'admin',
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
};

const getAdminByEmail = async (email) => {
  const { query: dbQuery } = getDbFunctions();
  const result = await dbQuery('SELECT * FROM admins WHERE email = $1', [email]);
  if (result.rows.length === 0) return null;
  const row = result.rows[0];
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    password: row.password,
    role: row.role || 'admin',
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
};

const addAdmin = async (admin) => {
  const { query: dbQuery } = getDbFunctions();
  const result = await dbQuery(
    `INSERT INTO admins (id, name, email, password, role, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [
      admin.id,
      admin.name,
      admin.email,
      admin.password,
      admin.role || 'admin',
      admin.createdAt || new Date().toISOString(),
      admin.updatedAt || new Date().toISOString()
    ]
  );
  const row = result.rows[0];
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    password: row.password,
    role: row.role || 'admin',
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
};

const updateAdmin = async (id, updates) => {
  const { query: dbQuery } = getDbFunctions();
  const fields = [];
  const values = [];
  let paramIndex = 1;

  if (updates.name !== undefined) {
    fields.push(`name = $${paramIndex}`);
    values.push(updates.name);
    paramIndex++;
  }
  if (updates.email !== undefined) {
    fields.push(`email = $${paramIndex}`);
    values.push(updates.email);
    paramIndex++;
  }
  if (updates.password !== undefined) {
    fields.push(`password = $${paramIndex}`);
    values.push(updates.password);
    paramIndex++;
  }

  fields.push(`updated_at = $${paramIndex}`);
  values.push(new Date().toISOString());
  paramIndex++;

  values.push(id);
  const whereParamIndex = paramIndex;

  await dbQuery(
    `UPDATE admins SET ${fields.join(', ')} WHERE id = $${whereParamIndex}`,
    values
  );
  return await getAdminById(id);
};

const deleteAdmin = async (id) => {
  const { query: dbQuery } = getDbFunctions();
  await dbQuery('DELETE FROM admins WHERE id = $1', [id]);
};

// ============================================
// RECRUITERS
// ============================================
const getRecruiters = async () => {
  try {
    const { query: dbQuery } = getDbFunctions();
    const result = await dbQuery('SELECT * FROM recruiters ORDER BY created_at ASC');
    return result.rows.map(row => ({
      id: row.id,
      name: row.name,
      email: row.email,
      password: row.password,
      assignedClients: row.assigned_clients || []
    }));
  } catch (error) {
    console.error('Error in getRecruiters:', error);
    throw error;
  }
};

const getRecruiterById = async (id) => {
  const { query: dbQuery } = getDbFunctions();
  if (!id) {
    return null;
  }
  
  // Ensure ID is a string and trim whitespace
  const recruiterId = String(id).trim();
  
  const result = await dbQuery('SELECT * FROM recruiters WHERE id = $1', [recruiterId]);
  
  if (result.rows.length === 0) {
    return null;
  }
  
  const row = result.rows[0];
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    password: row.password,
    assignedClients: row.assigned_clients || []
  };
};

const getRecruiterByEmail = async (email) => {
  const { query: dbQuery } = getDbFunctions();
  const result = await dbQuery('SELECT * FROM recruiters WHERE email = $1', [email]);
  if (result.rows.length === 0) return null;
  const row = result.rows[0];
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    password: row.password,
    assignedClients: row.assigned_clients || []
  };
};

const saveRecruiters = async (recruiters) => {
  const { getClient: dbGetClient } = getDbFunctions();
  // For bulk operations, use transaction
  const client = await dbGetClient();
  try {
    await client.query('BEGIN');
    for (const recruiter of recruiters) {
      await client.query(
        `INSERT INTO recruiters (id, name, email, password, assigned_clients, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (id) DO UPDATE SET
           name = EXCLUDED.name,
           email = EXCLUDED.email,
           password = EXCLUDED.password,
           assigned_clients = EXCLUDED.assigned_clients,
           updated_at = EXCLUDED.updated_at`,
        [
          recruiter.id,
          recruiter.name,
          recruiter.email,
          recruiter.password,
          recruiter.assignedClients || [],
          recruiter.createdAt || new Date().toISOString(),
          recruiter.updatedAt || new Date().toISOString()
        ]
      );
    }
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

const deleteRecruiter = async (id) => {
  const { query: dbQuery } = getDbFunctions();
  // First, unassign all clients from this recruiter
  await dbQuery('UPDATE clients SET assigned_recruiter = NULL WHERE assigned_recruiter = $1', [id]);
  // Then delete the recruiter
  await dbQuery('DELETE FROM recruiters WHERE id = $1', [id]);
};

// ============================================
// CLIENTS
// ============================================
const getClients = async () => {
  try {
    const { query: dbQuery } = getDbFunctions();
    const result = await dbQuery('SELECT * FROM clients ORDER BY created_at ASC');
    return result.rows.map(row => ({
      id: row.id,
      name: row.name,
      email: row.email,
      password: row.password || null,
      assignedRecruiter: row.assigned_recruiter,
      monthlyTarget: row.monthly_target || 0,
      dailyTarget: row.daily_target || 0,
      instructions: row.instructions || null,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));
  } catch (error) {
    console.error('Error in getClients:', error);
    throw error;
  }
};

const getClientById = async (id) => {
  const { query: dbQuery } = getDbFunctions();
  const result = await dbQuery('SELECT * FROM clients WHERE id = $1', [id]);
  if (result.rows.length === 0) return null;
  const row = result.rows[0];
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    password: row.password || null,
    assignedRecruiter: row.assigned_recruiter,
    monthlyTarget: row.monthly_target || 0,
    dailyTarget: row.daily_target || 0,
    instructions: row.instructions || null,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
};

const getClientByEmail = async (email) => {
  const { query: dbQuery } = getDbFunctions();
  const result = await dbQuery('SELECT * FROM clients WHERE email = $1', [email]);
  if (result.rows.length === 0) return null;
  const row = result.rows[0];
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    password: row.password || null,
    assignedRecruiter: row.assigned_recruiter,
    monthlyTarget: row.monthly_target || 0,
    dailyTarget: row.daily_target || 0,
    instructions: row.instructions || null,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
};

const saveClients = async (clients) => {
  const { getClient: dbGetClient } = getDbFunctions();
  const client = await dbGetClient();
  try {
    await client.query('BEGIN');
    for (const cl of clients) {
      await client.query(
        `INSERT INTO clients (id, name, email, password, assigned_recruiter, monthly_target, daily_target, instructions, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         ON CONFLICT (id) DO UPDATE SET
           name = EXCLUDED.name,
           email = EXCLUDED.email,
           password = EXCLUDED.password,
           assigned_recruiter = EXCLUDED.assigned_recruiter,
           monthly_target = EXCLUDED.monthly_target,
           daily_target = EXCLUDED.daily_target,
           instructions = EXCLUDED.instructions,
           updated_at = EXCLUDED.updated_at`,
        [
          cl.id,
          cl.name,
          cl.email,
          cl.password || null,
          cl.assignedRecruiter || null,
          cl.monthlyTarget || 0,
          cl.dailyTarget || 0,
          cl.instructions || null,
          cl.createdAt || new Date().toISOString(),
          cl.updatedAt || new Date().toISOString()
        ]
      );
    }
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

const updateClientInstructions = async (clientId, instructions) => {
  const { query: dbQuery } = getDbFunctions();
  await dbQuery(
    'UPDATE clients SET instructions = $1, updated_at = $2 WHERE id = $3',
    [instructions.trim(), new Date().toISOString(), clientId]
  );
  return getClientById(clientId);
};

const deleteClient = async (id) => {
  const { query: dbQuery } = getDbFunctions();
  // Database trigger will automatically remove from recruiter's assigned_clients array
  await dbQuery('DELETE FROM clients WHERE id = $1', [id]);
};

// ============================================
// JOBS
// ============================================
const getJobs = async (filters = {}) => {
  try {
    const { query: dbQuery } = getDbFunctions();
    let sql = 'SELECT * FROM jobs WHERE 1=1';
    const params = [];
    let paramIndex = 1;

  if (filters.clientId) {
    sql += ` AND client_id = $${paramIndex}`;
    params.push(filters.clientId);
    paramIndex++;
  }

  if (filters.recruiterId) {
    sql += ` AND recruiter_id = $${paramIndex}`;
    params.push(filters.recruiterId);
    paramIndex++;
  }

  if (filters.status) {
    sql += ` AND status = $${paramIndex}`;
    params.push(filters.status);
    paramIndex++;
  }

  if (filters.search) {
    sql += ` AND (
      LOWER(company_name) LIKE $${paramIndex} OR
      LOWER(job_title) LIKE $${paramIndex} OR
      LOWER(location) LIKE $${paramIndex}
    )`;
    params.push(`%${filters.search.toLowerCase()}%`);
    paramIndex++;
  }

  sql += ' ORDER BY date DESC, created_at DESC';

  // Pagination
  if (filters.limit) {
    sql += ` LIMIT $${paramIndex}`;
    params.push(filters.limit);
    paramIndex++;
    if (filters.offset) {
      sql += ` OFFSET $${paramIndex}`;
      params.push(filters.offset);
    }
  }

    const result = await dbQuery(sql, params);
    return result.rows.map(row => ({
      id: row.id,
      clientId: row.client_id,
      recruiterId: row.recruiter_id,
      companyName: row.company_name,
      jobTitle: row.job_title,
      jobLink: row.job_link,
      location: row.location,
      status: row.status,
      notes: row.notes,
      // Convert date to string format YYYY-MM-DD (PostgreSQL DATE returns as string, but ensure consistency)
      date: row.date ? (typeof row.date === 'string' ? row.date : row.date.toISOString().split('T')[0]) : null,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));
  } catch (error) {
    console.error('Error in getJobs:', error);
    throw error;
  }
};

const getJobCount = async (filters = {}) => {
  const { query: dbQuery } = getDbFunctions();
  let sql = 'SELECT COUNT(*) as count FROM jobs WHERE 1=1';
  const params = [];
  let paramIndex = 1;

  if (filters.clientId) {
    sql += ` AND client_id = $${paramIndex}`;
    params.push(filters.clientId);
    paramIndex++;
  }

  if (filters.recruiterId) {
    sql += ` AND recruiter_id = $${paramIndex}`;
    params.push(filters.recruiterId);
    paramIndex++;
  }

  if (filters.status) {
    sql += ` AND status = $${paramIndex}`;
    params.push(filters.status);
    paramIndex++;
  }

  if (filters.search) {
    sql += ` AND (
      LOWER(company_name) LIKE $${paramIndex} OR
      LOWER(job_title) LIKE $${paramIndex} OR
      LOWER(location) LIKE $${paramIndex}
    )`;
    params.push(`%${filters.search.toLowerCase()}%`);
  }

  const result = await dbQuery(sql, params);
  return parseInt(result.rows[0].count);
};

const getJobById = async (id) => {
  const { query: dbQuery } = getDbFunctions();
  const result = await dbQuery('SELECT * FROM jobs WHERE id = $1', [id]);
  if (result.rows.length === 0) return null;
  const row = result.rows[0];
  return {
    id: row.id,
    clientId: row.client_id,
    recruiterId: row.recruiter_id,
    companyName: row.company_name,
    jobTitle: row.job_title,
    jobLink: row.job_link,
    location: row.location,
    status: row.status,
    notes: row.notes,
    date: row.date,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
};

const saveJobs = async (jobs) => {
  const { getClient: dbGetClient } = getDbFunctions();
  const client = await dbGetClient();
  try {
    await client.query('BEGIN');
    for (const job of jobs) {
      await client.query(
        `INSERT INTO jobs (id, client_id, recruiter_id, company_name, job_title, job_link, location, status, notes, date, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
         ON CONFLICT (id) DO UPDATE SET
           company_name = EXCLUDED.company_name,
           job_title = EXCLUDED.job_title,
           job_link = EXCLUDED.job_link,
           location = EXCLUDED.location,
           status = EXCLUDED.status,
           notes = EXCLUDED.notes,
           date = EXCLUDED.date,
           updated_at = EXCLUDED.updated_at`,
        [
          job.id,
          job.clientId,
          job.recruiterId,
          job.companyName,
          job.jobTitle,
          job.jobLink,
          job.location || null,
          job.status,
          job.notes || null,
          job.date,
          job.createdAt || new Date().toISOString(),
          job.updatedAt || new Date().toISOString()
        ]
      );
    }
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

const addJob = async (job) => {
  const { query: dbQuery } = getDbFunctions();
  const jobId = job.id || uuidv4();
  await dbQuery(
    `INSERT INTO jobs (id, client_id, recruiter_id, company_name, job_title, job_link, location, status, notes, date, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
     RETURNING *`,
    [
      jobId,
      job.clientId,
      job.recruiterId,
      job.companyName,
      job.jobTitle,
      job.jobLink,
      job.location || null,
      job.status,
      job.notes || null,
      job.date || new Date().toISOString().split('T')[0],
      new Date().toISOString(),
      new Date().toISOString()
    ]
  );
  return getJobById(jobId);
};

const updateJob = async (id, updates) => {
  const { query: dbQuery } = getDbFunctions();
  const fields = [];
  const values = [];
  let paramIndex = 1;

  if (updates.companyName !== undefined) {
    fields.push(`company_name = $${paramIndex}`);
    values.push(updates.companyName);
    paramIndex++;
  }
  if (updates.jobTitle !== undefined) {
    fields.push(`job_title = $${paramIndex}`);
    values.push(updates.jobTitle);
    paramIndex++;
  }
  if (updates.jobLink !== undefined) {
    fields.push(`job_link = $${paramIndex}`);
    values.push(updates.jobLink);
    paramIndex++;
  }
  if (updates.location !== undefined) {
    fields.push(`location = $${paramIndex}`);
    values.push(updates.location);
    paramIndex++;
  }
  if (updates.status !== undefined) {
    fields.push(`status = $${paramIndex}`);
    values.push(updates.status);
    paramIndex++;
  }
  if (updates.notes !== undefined) {
    fields.push(`notes = $${paramIndex}`);
    values.push(updates.notes);
    paramIndex++;
  }

  fields.push(`updated_at = $${paramIndex}`);
  values.push(new Date().toISOString());
  values.push(id);

  await dbQuery(
    `UPDATE jobs SET ${fields.join(', ')} WHERE id = $${paramIndex}`,
    values
  );
  return getJobById(id);
};

const deleteJob = async (id) => {
  const { query: dbQuery } = getDbFunctions();
  await dbQuery('DELETE FROM jobs WHERE id = $1', [id]);
};

// ============================================
// SESSIONS
// ============================================
const getSessions = async (filters = {}) => {
  const { query: dbQuery } = getDbFunctions();
  let sql = 'SELECT * FROM sessions WHERE 1=1';
  const params = [];
  let paramIndex = 1;

  if (filters.clientId) {
    sql += ` AND client_id = $${paramIndex}`;
    params.push(filters.clientId);
    paramIndex++;
  }

  if (filters.recruiterId) {
    sql += ` AND recruiter_id = $${paramIndex}`;
    params.push(filters.recruiterId);
    paramIndex++;
  }

  if (filters.status) {
    sql += ` AND status = $${paramIndex}`;
    params.push(filters.status);
    paramIndex++;
  }

  sql += ' ORDER BY start_time DESC';

  if (filters.limit) {
    sql += ` LIMIT $${paramIndex}`;
    params.push(filters.limit);
  }

  const result = await dbQuery(sql, params);
  return result.rows.map(row => ({
    id: row.id,
    clientId: row.client_id,
    recruiterId: row.recruiter_id,
    status: row.status,
    startTime: row.start_time,
    endTime: row.end_time,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }));
};

const saveSessions = async (sessions) => {
  const { getClient: dbGetClient } = getDbFunctions();
  const client = await dbGetClient();
  try {
    await client.query('BEGIN');
    for (const session of sessions) {
      await client.query(
        `INSERT INTO sessions (id, client_id, recruiter_id, status, start_time, end_time, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (id) DO UPDATE SET
           status = EXCLUDED.status,
           start_time = EXCLUDED.start_time,
           end_time = EXCLUDED.end_time,
           updated_at = EXCLUDED.updated_at`,
        [
          session.id,
          session.clientId,
          session.recruiterId,
          session.status,
          session.startTime,
          session.endTime || null,
          session.createdAt || new Date().toISOString(),
          session.updatedAt || new Date().toISOString()
        ]
      );
    }
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

const updateSession = async (id, updates) => {
  const { query: dbQuery } = getDbFunctions();
  const fields = [];
  const values = [];
  let paramIndex = 1;

  if (updates.status !== undefined) {
    fields.push(`status = $${paramIndex}`);
    values.push(updates.status);
    paramIndex++;
  }
  if (updates.endTime !== undefined) {
    fields.push(`end_time = $${paramIndex}`);
    values.push(updates.endTime);
    paramIndex++;
  }

  fields.push(`updated_at = $${paramIndex}`);
  values.push(new Date().toISOString());
  paramIndex++;
  
  // Add id for WHERE clause
  values.push(id);
  const whereParamIndex = paramIndex;
  await dbQuery(
    `UPDATE sessions SET ${fields.join(', ')} WHERE id = $${whereParamIndex}`,
    values
  );
  const result = await dbQuery('SELECT * FROM sessions WHERE id = $1', [id]);
  if (result.rows.length === 0) return null;
  const row = result.rows[0];
  return {
    id: row.id,
    clientId: row.client_id,
    recruiterId: row.recruiter_id,
    status: row.status,
    startTime: row.start_time,
    endTime: row.end_time,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
};

// ============================================
// NOTIFICATIONS
// ============================================
const getNotifications = async (filters = {}) => {
  const { query: dbQuery } = getDbFunctions();
  let sql = 'SELECT * FROM notifications WHERE 1=1';
  const params = [];
  let paramIndex = 1;

  if (filters.clientId) {
    sql += ` AND client_id = $${paramIndex}`;
    params.push(filters.clientId);
    paramIndex++;
  }

  if (filters.read !== undefined) {
    sql += ` AND read = $${paramIndex}`;
    params.push(filters.read);
    paramIndex++;
  }

  sql += ' ORDER BY created_at DESC';

  if (filters.limit) {
    sql += ` LIMIT $${paramIndex}`;
    params.push(filters.limit);
  }

  const result = await dbQuery(sql, params);
  return result.rows.map(row => ({
    id: row.id,
    clientId: row.client_id,
    type: row.type,
    message: row.message,
    read: row.read,
    createdAt: row.created_at
  }));
};

const saveNotifications = async (notifications) => {
  const { getClient: dbGetClient } = getDbFunctions();
  const client = await dbGetClient();
  try {
    await client.query('BEGIN');
    for (const notification of notifications) {
      await client.query(
        `INSERT INTO notifications (id, client_id, type, message, read, created_at)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (id) DO UPDATE SET
           read = EXCLUDED.read`,
        [
          notification.id,
          notification.clientId,
          notification.type,
          notification.message,
          notification.read || false,
          notification.createdAt || new Date().toISOString()
        ]
      );
    }
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

const addNotification = async (notification) => {
  const { query: dbQuery } = getDbFunctions();
  const notifId = notification.id || uuidv4();
  await dbQuery(
    `INSERT INTO notifications (id, client_id, type, message, read, created_at)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [
      notifId,
      notification.clientId,
      notification.type,
      notification.message,
      notification.read || false,
      notification.createdAt || new Date().toISOString()
    ]
  );
  return getNotifications({ id: notifId })[0];
};

// ============================================
// ADMINS (duplicate section removed - functions already defined above at line 94)
// ============================================

module.exports = {
  // Admins
  getAdmins,
  getAdminById,
  getAdminByEmail,
  addAdmin,
  updateAdmin,
  deleteAdmin,
  
  // Recruiters
  getRecruiters,
  getRecruiterById,
  getRecruiterByEmail,
  saveRecruiters,
  deleteRecruiter,
  
  // Clients
  getClients,
  getClientById,
  getClientByEmail,
  saveClients,
  updateClientInstructions,
  deleteClient,
  
  // Jobs
  getJobs,
  getJobCount,
  getJobById,
  saveJobs,
  addJob,
  updateJob,
  deleteJob,
  
  // Sessions
  getSessions,
  saveSessions,
  updateSession,
  
  // Notifications
  getNotifications,
  saveNotifications,
  addNotification
};

