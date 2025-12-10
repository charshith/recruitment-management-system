# Database Setup Guide

## The Error You're Seeing

```
ECONNREFUSED ::1:5432
ECONNREFUSED 127.0.0.1:5432
```

This means the app is trying to connect to PostgreSQL, but the database server isn't running.

## Solution Options

### Option 1: Don't Use Database (Easiest - Recommended for Testing)

The app works without PostgreSQL! It will use file-based storage instead.

**Just make sure `USE_DB` is NOT set to `true` in your `.env` file:**

```bash
# In .env file, either:
# 1. Don't have USE_DB at all, OR
# 2. Set it to false:
USE_DB=false
```

Then restart the server - it will work fine without PostgreSQL!

### Option 2: Start PostgreSQL

If you want to use PostgreSQL:

1. **Install PostgreSQL** (if not installed):
   ```bash
   # Mac with Homebrew
   brew install postgresql@14
   brew services start postgresql@14
   
   # Or download from: https://www.postgresql.org/download/
   ```

2. **Create the database:**
   ```bash
   createdb recruitment_app
   ```

3. **Run the schema:**
   ```bash
   psql recruitment_app < database/schema.sql
   ```

4. **Set environment variables in `.env`:**
   ```env
   USE_DB=true
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=recruitment_app
   DB_USER=postgres
   DB_PASSWORD=postgres
   ```

5. **Restart the server**

## Quick Fix for Now

**Just remove or comment out `USE_DB=true` from your `.env` file, and the server will work without PostgreSQL!**

The app is designed to work with or without a database.
