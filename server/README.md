# Server Directory

## Running the Server

### Option 1: From Server Directory
```bash
cd server
npm start        # Production mode
npm run dev      # Development mode with nodemon
```

### Option 2: From Root Directory
```bash
# From project root
npm run server   # Development mode with nodemon
npm run dev      # Run both server and frontend
```

## Notes

- Server runs on port 5001 by default
- Set `USE_DB=true` in `.env` to use PostgreSQL
- Health check: `http://localhost:5001/api/health`
