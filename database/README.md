# Database Setup Guide

## Step 1: Install PostgreSQL

If you don't have PostgreSQL installed:

**macOS:**
```bash
brew install postgresql@17
brew services start postgresql@17
```

**Or use Docker (recommended):**
```bash
docker run --name recruitment-db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=recruitment_app \
  -p 5432:5432 \
  -d postgres:17-alpine
```

## Step 2: Create Database in DBeaver

1. **Open DBeaver**
2. **Create New Connection:**
   - Database: PostgreSQL
   - Host: `localhost`
   - Port: `5432`
   - Database: `recruitment_app`
   - Username: `postgres`
   - Password: `postgres` (or your password)

3. **Create Database:**
   ```sql
   CREATE DATABASE recruitment_app;
   ```

4. **Run Schema:**
   - Open `database/schema.sql` in DBeaver
   - Execute the entire script (Cmd+Enter or F5)
   - This creates all tables and indexes

## Step 3: Configure Environment Variables

Create/update `.env` file in project root:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=recruitment_app
DB_USER=postgres
DB_PASSWORD=postgres

# Keep existing config
PORT=5001
FRONTEND_URL=http://localhost:3000
JWT_SECRET=your-secret-key-here
NODE_ENV=development
```

## Step 4: Install Database Dependencies

```bash
npm install pg
```

## Step 5: Migrate Existing Data (Optional)

If you have existing JSON data:

```bash
node database/migrate.js
```

This will migrate all data from `server/data/*.json` to PostgreSQL.

## Step 6: Update Code

The code will automatically use the database once configured. The `dataStore.js` will be updated to use PostgreSQL instead of JSON files.

## Verification

After setup, verify in DBeaver:

```sql
-- Check tables
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';

-- Check recruiters
SELECT * FROM recruiters;

-- Check indexes
SELECT indexname, tablename FROM pg_indexes 
WHERE schemaname = 'public';
```

## Troubleshooting

**Connection Error:**
- Check PostgreSQL is running: `brew services list` or `docker ps`
- Verify credentials in `.env`
- Check firewall/port 5432

**Permission Error:**
- Make sure user has CREATE/DROP permissions
- Or run as postgres superuser

**Migration Error:**
- Ensure schema.sql ran successfully
- Check foreign key constraints
- Verify JSON files exist in `server/data/`

