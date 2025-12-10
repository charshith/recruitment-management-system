# Recruitment Application

A comprehensive recruitment management system with three main components:
- **Recruiter Dashboard** (Web) - ✅ Complete
- **Client Dashboard** (Web) - ✅ Complete
- **Admin Dashboard** (Web) - ✅ Complete

## Project Structure

Following the zyprova architecture pattern:

```
cons_app/
├── server/              # Backend API (Express + Node.js)
│   ├── routes/         # API route handlers
│   ├── utils/          # Utilities and data store
│   └── data/           # JSON data files (auto-generated)
└── frontend/           # Frontend (Vue 3 + Vite)
    ├── src/
    │   ├── views/      # Page components
    │   ├── layouts/    # Layout components
    │   ├── stores/     # Pinia state management
    │   ├── services/   # API services
    │   └── router/     # Vue Router config
```

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Install server dependencies:
```bash
npm install
```

2. Install frontend dependencies:
```bash
cd frontend && npm install
```

Or use the convenience script:
```bash
npm run install-all
```

### Running the Application

Start both server and client in development mode:
```bash
npm run dev
```

This will start:
- **Backend API**: http://localhost:5000
- **Frontend**: http://localhost:3000

Or run separately:
- Server: `npm run server` (port 5000)
- Client: `npm run client` (port 3000)

## Default Credentials

**Recruiter:**
- Email: `recruiter@example.com`
- Password: `password123`

## Features Implemented

### ✅ Recruiter App

1. **Recruiter Login**
   - Email + Password authentication
   - JWT token-based session management
   - View assigned clients after login

2. **Recruiter Dashboard**
   - List of assigned clients
   - Daily application target display
   - Today's completion count
   - Weekly and monthly statistics
   - Quick access to client details

3. **Client Details Page**
   - "Start Session" / "End Session" buttons
   - Client instructions display
   - Job logging form
   - Complete job log table

4. **Job Logging**
   - Company Name
   - Job Title / Role
   - Job Link
   - Location (optional)
   - Status (Applied / Not Fit / Duplicate)
   - Notes (optional)
   - Automatic client notification on job addition

5. **Session Management**
   - Start/End session with timestamps
   - Active session indicator
   - Client notifications on session start/end
   - Automatic daily summary updates

6. **Notifications**
   - Client notified when recruiter starts applying
   - Client notified when job is added
   - Client notified when session ends

## API Endpoints

### Authentication
- `POST /api/auth/recruiter/login` - Recruiter login

### Recruiters
- `GET /api/recruiters/me/clients` - Get assigned clients
- `GET /api/recruiters/me/dashboard` - Get dashboard stats

### Clients
- `GET /api/clients/:clientId` - Get client details with jobs

### Jobs
- `POST /api/jobs` - Add new job application
- `GET /api/jobs/client/:clientId` - Get jobs for a client

### Sessions
- `POST /api/sessions/start` - Start application session
- `POST /api/sessions/end` - End application session
- `GET /api/sessions/client/:clientId/active` - Get active session

## Technology Stack

### Backend
- Node.js + Express
- JWT for authentication
- bcryptjs for password hashing
- JSON file-based storage (easily migratable to database)

### Frontend
- Vue 3 (Composition API)
- Vite
- Vue Router
- Pinia (state management)
- Tailwind CSS
- Axios

## Features Implemented

### ✅ Admin Dashboard
- Complete admin management system
- Client management (create, edit, delete)
- Recruiter management (create, edit, delete)
- Job management and oversight
- Session management
- Activity overview and reports
- Admin profile management

### ✅ Client Dashboard
- Client login and authentication
- View assigned recruiter
- View job applications
- Session status with live timer
- Session history
- Daily target progress tracking

## Next Steps

- [ ] Mobile app (React Native/Flutter)
- [ ] Real-time notifications (WebSocket)
- [ ] Email notifications
- [ ] Advanced reporting and analytics
- [ ] Export functionality (CSV/Excel)

## Development Notes

- Data is stored in JSON files in `server/data/` directory
- Default data is auto-generated on first run
- All API routes require authentication except login
- CORS is enabled for development
