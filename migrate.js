/**
 * Database Migration Script
 * Migrates data from JSON files to PostgreSQL database
 * 
 * Usage: node database/migrate.js
 */

const { Pool } = require('pg');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'recruitment_app',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

const DATA_DIR = path.join(__dirname, '../server/data');

async function readJSONFile(filename) {
  try {
    const filePath = path.join(DATA_DIR, filename);
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return [];
    }
    throw error;
  }
}

async function migrateRecruiters() {
  console.log('Migrating recruiters...');
  const recruiters = await readJSONFile('recruiters.json');
  
  for (const recruiter of recruiters) {
    await pool.query(
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
  console.log(`✓ Migrated ${recruiters.length} recruiters`);
}

async function migrateClients() {
  console.log('Migrating clients...');
  const clients = await readJSONFile('clients.json');
  
  for (const client of clients) {
    await pool.query(
      `INSERT INTO clients (id, name, email, assigned_recruiter, monthly_target, daily_target, instructions, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT (id) DO UPDATE SET
         name = EXCLUDED.name,
         email = EXCLUDED.email,
         assigned_recruiter = EXCLUDED.assigned_recruiter,
         monthly_target = EXCLUDED.monthly_target,
         daily_target = EXCLUDED.daily_target,
         instructions = EXCLUDED.instructions,
         updated_at = EXCLUDED.updated_at`,
      [
        client.id,
        client.name,
        client.email,
        client.assignedRecruiter || null,
        client.monthlyTarget || 0,
        client.dailyTarget || 0,
        client.instructions || null,
        client.createdAt || new Date().toISOString(),
        client.updatedAt || new Date().toISOString()
      ]
    );
  }
  console.log(`✓ Migrated ${clients.length} clients`);
}

async function migrateJobs() {
  console.log('Migrating jobs...');
  const jobs = await readJSONFile('jobs.json');
  
  for (const job of jobs) {
    await pool.query(
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
  console.log(`✓ Migrated ${jobs.length} jobs`);
}

async function migrateSessions() {
  console.log('Migrating sessions...');
  const sessions = await readJSONFile('sessions.json');
  
  for (const session of sessions) {
    await pool.query(
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
  console.log(`✓ Migrated ${sessions.length} sessions`);
}

async function migrateNotifications() {
  console.log('Migrating notifications...');
  const notifications = await readJSONFile('notifications.json');
  
  for (const notification of notifications) {
    await pool.query(
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
  console.log(`✓ Migrated ${notifications.length} notifications`);
}

async function main() {
  try {
    console.log('🚀 Starting database migration...\n');
    
    // Test connection
    await pool.query('SELECT NOW()');
    console.log('✓ Database connection successful\n');
    
    // Migrate in order (respecting foreign keys)
    await migrateRecruiters();
    await migrateClients();
    await migrateJobs();
    await migrateSessions();
    await migrateNotifications();
    
    console.log('\n✅ Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();

