# NotesApp

A minimal, full-stack notes application with JWT authentication, built with React and Express.

![Landing Page](screenshots/landing.png)

## Screenshots

| Login | Dashboard |
|-------|-----------|
| ![Login](screenshots/login.png) | ![Dashboard](screenshots/dashboard.png) |

## Tech Stack

**Frontend**
- React 18 + Vite
- NextUI + TailwindCSS
- Framer Motion
- Axios with JWT interceptors

**Backend**
- Node.js + Express
- PostgreSQL (Neon)
- bcrypt password hashing
- JSON Web Tokens (JWT)

**Deployment**
- Vercel (frontend + backend serverless)

## Features

- Secure authentication (signup / login) with hashed passwords
- JWT-based session management
- Create, edit, and delete notes with confirmation dialog
- Search notes (real-time, debounced)
- Pin/unpin important notes to top
- Color-coded notes (6 color options)
- Keyboard shortcut: `Cmd+K` / `Ctrl+K` to create a new note
- Character count in note editor
- Responsive dark UI with glassmorphism design
- Staggered fade-in animations
- Auto-logout on token expiry
- Input validation (client + server)

## Project Structure

```
notesapp/
├── backend/
│   ├── api/index.js          # Vercel serverless entry point
│   ├── index.js              # Express app (routes, auth, CRUD)
│   ├── db.js                 # PostgreSQL connection + table setup
│   ├── vercel.json           # Vercel deployment config
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── api.js            # Axios instance with auth interceptor
│   │   ├── authentication/
│   │   │   └── AuthContext.jsx
│   │   ├── components/
│   │   │   ├── Nav.jsx
│   │   │   ├── NoteCard.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Signup.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── vercel.json
│   └── package.json
└── screenshots/
```

## Getting Started

### Prerequisites

- Node.js >= 18
- PostgreSQL database (or a [Neon](https://neon.tech) free tier account)

### Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file (see `.env.example`):

```env
DATABASE_URL=postgres://user:password@host:5432/dbname?sslmode=require
JWT_SECRET=your-secret-key-here
FRONTEND_URL=http://localhost:5173
PORT=2000
```

Start the server:

```bash
npm run dev     # development (with nodemon)
npm start       # production
```

### Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env` file (see `.env.example`):

```env
VITE_API_URL=http://localhost:2000
```

Start the dev server:

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Deployment (Vercel)

This app is designed to be deployed as **two separate Vercel projects** from the same repo.

### Backend

1. Create a new Vercel project, set the **Root Directory** to `backend`
2. Add environment variables in Vercel project settings:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `FRONTEND_URL` (your frontend Vercel URL)
3. Deploy

### Frontend

1. Create a new Vercel project, set the **Root Directory** to `frontend`
2. Add environment variable:
   - `VITE_API_URL` (your backend Vercel URL)
3. Deploy

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/addusers` | No | Sign up |
| POST | `/login` | No | Log in |
| GET | `/notes?search=` | Yes | Get user's notes (with optional search) |
| POST | `/notes` | Yes | Create a note |
| PUT | `/notes/:id` | Yes | Update a note |
| PATCH | `/notes/:id/pin` | Yes | Toggle pin/unpin |
| DELETE | `/notes/:id` | Yes | Delete a note |

## License

[MIT](LICENSE)
