-- Recruitment Application Database Schema
-- PostgreSQL Database Setup
-- Run this in DBeaver or psql to create the database and tables

-- Create database (run this separately if needed)
-- CREATE DATABASE recruitment_app;

-- Connect to the database
-- \c recruitment_app;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- ADMINS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS admins (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'admin',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for email lookups
CREATE INDEX IF NOT EXISTS idx_admins_email ON admins(email);

-- ============================================
-- RECRUITERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS recruiters (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    assigned_clients TEXT[], -- Array of client IDs
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for email lookups
CREATE INDEX IF NOT EXISTS idx_recruiters_email ON recruiters(email);

-- ============================================
-- CLIENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS clients (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255), -- For client login (optional, can be NULL if not needed)
    assigned_recruiter VARCHAR(255) REFERENCES recruiters(id) ON DELETE SET NULL,
    monthly_target INTEGER DEFAULT 0,
    daily_target INTEGER DEFAULT 0,
    instructions TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for recruiter lookups
CREATE INDEX IF NOT EXISTS idx_clients_recruiter ON clients(assigned_recruiter);
CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);

-- ============================================
-- JOBS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS jobs (
    id VARCHAR(255) PRIMARY KEY,
    client_id VARCHAR(255) NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    recruiter_id VARCHAR(255) NOT NULL REFERENCES recruiters(id) ON DELETE CASCADE,
    company_name VARCHAR(255) NOT NULL,
    job_title VARCHAR(255) NOT NULL,
    job_link TEXT NOT NULL,
    location VARCHAR(255),
    status VARCHAR(50) NOT NULL CHECK (status IN ('Applied', 'To be Applied', 'Not Fit', 'Duplicate')),
    notes TEXT,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_jobs_client_id ON jobs(client_id);
CREATE INDEX IF NOT EXISTS idx_jobs_recruiter_id ON jobs(recruiter_id);
CREATE INDEX IF NOT EXISTS idx_jobs_date ON jobs(date DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_client_date ON jobs(client_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_company_title ON jobs(company_name, job_title);

-- ============================================
-- SESSIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS sessions (
    id VARCHAR(255) PRIMARY KEY,
    client_id VARCHAR(255) NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    recruiter_id VARCHAR(255) NOT NULL REFERENCES recruiters(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL CHECK (status IN ('active', 'completed')),
    start_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for session queries
CREATE INDEX IF NOT EXISTS idx_sessions_client_id ON sessions(client_id);
CREATE INDEX IF NOT EXISTS idx_sessions_recruiter_id ON sessions(recruiter_id);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON sessions(status);
CREATE INDEX IF NOT EXISTS idx_sessions_client_status ON sessions(client_id, status);
CREATE INDEX IF NOT EXISTS idx_sessions_end_time ON sessions(end_time DESC);

-- ============================================
-- NOTIFICATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR(255) PRIMARY KEY,
    client_id VARCHAR(255) NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for notifications
CREATE INDEX IF NOT EXISTS idx_notifications_client_id ON notifications(client_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- ============================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to all tables with updated_at
-- Drop triggers if they exist first (PostgreSQL doesn't support IF NOT EXISTS for triggers)
DROP TRIGGER IF EXISTS update_recruiters_updated_at ON recruiters;
CREATE TRIGGER update_recruiters_updated_at BEFORE UPDATE ON recruiters
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_clients_updated_at ON clients;
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_jobs_updated_at ON jobs;
CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON jobs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_sessions_updated_at ON sessions;
CREATE TRIGGER update_sessions_updated_at BEFORE UPDATE ON sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_admins_updated_at ON admins;
CREATE TRIGGER update_admins_updated_at BEFORE UPDATE ON admins
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- AUTO-SYNC RECRUITER ASSIGNED_CLIENTS ARRAY
-- ============================================
-- This trigger automatically maintains recruiters.assigned_clients array
-- whenever clients.assigned_recruiter changes
CREATE OR REPLACE FUNCTION sync_recruiter_assigned_clients()
RETURNS TRIGGER AS $$
DECLARE
    old_recruiter_id VARCHAR(255);
    new_recruiter_id VARCHAR(255);
BEGIN
    -- Get old and new recruiter IDs (handle INSERT case where OLD is NULL)
    old_recruiter_id := CASE WHEN TG_OP = 'UPDATE' THEN OLD.assigned_recruiter ELSE NULL END;
    new_recruiter_id := NEW.assigned_recruiter;
    
    -- If recruiter changed (or this is an INSERT), update recruiter's arrays
    IF old_recruiter_id IS DISTINCT FROM new_recruiter_id THEN
        -- Update old recruiter: remove this client from their array (only on UPDATE)
        IF old_recruiter_id IS NOT NULL AND TG_OP = 'UPDATE' THEN
            UPDATE recruiters 
            SET assigned_clients = array_remove(assigned_clients, NEW.id),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = old_recruiter_id;
        END IF;
        
        -- Update new recruiter: add this client to their array
        IF new_recruiter_id IS NOT NULL THEN
            UPDATE recruiters 
            SET assigned_clients = CASE 
                WHEN NEW.id = ANY(COALESCE(assigned_clients, ARRAY[]::TEXT[])) THEN assigned_clients
                ELSE COALESCE(assigned_clients, ARRAY[]::TEXT[]) || ARRAY[NEW.id]
            END,
            updated_at = CURRENT_TIMESTAMP
            WHERE id = new_recruiter_id;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger on INSERT or UPDATE of clients.assigned_recruiter
DROP TRIGGER IF EXISTS sync_recruiter_clients_on_client_update ON clients;
CREATE TRIGGER sync_recruiter_clients_on_client_update
    AFTER INSERT OR UPDATE OF assigned_recruiter ON clients
    FOR EACH ROW
    EXECUTE FUNCTION sync_recruiter_assigned_clients();

-- Trigger on DELETE of client
CREATE OR REPLACE FUNCTION remove_client_from_recruiter_on_delete()
RETURNS TRIGGER AS $$
BEGIN
    -- Remove client from recruiter's array when client is deleted
    IF OLD.assigned_recruiter IS NOT NULL THEN
        UPDATE recruiters 
        SET assigned_clients = array_remove(assigned_clients, OLD.id),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = OLD.assigned_recruiter;
    END IF;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS remove_client_from_recruiter_on_delete_trigger ON clients;
CREATE TRIGGER remove_client_from_recruiter_on_delete_trigger
    BEFORE DELETE ON clients
    FOR EACH ROW
    EXECUTE FUNCTION remove_client_from_recruiter_on_delete();

-- ============================================
-- INITIAL DATA (Optional - for testing)
-- ============================================
-- Note: Password is 'password123' hashed with bcrypt
-- You can insert this after running the migration script

