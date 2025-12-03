# Coding Interview Platform - Build Instructions

## Project Overview
Build a real-time collaborative coding interview platform with the following features:
- Create shareable session links for candidates
- Real-time collaborative code editing (all users see changes instantly)
- Syntax highlighting for JavaScript and Python
- Safe code execution in the browser using WASM
- Containerized deployment

## Tech Stack
- **Frontend**: React + Vite
- **Backend**: Express.js with Socket.io for real-time communication
- **Code Execution**: Pyodide (Python WASM) for browser-based execution
- **Syntax Highlighting**: CodeMirror or Monaco Editor

---

## Step 1: Initial Implementation

Create the full-stack application structure:

### Backend (Express.js + Socket.io)
Create a `server/` directory with:
- Express server on port 3001
- Socket.io for real-time code synchronization
- REST endpoint to create new coding sessions (generates unique session IDs)
- WebSocket handlers for:
  - Joining a session room
  - Broadcasting code changes to all users in the room
  - Syncing cursor positions (optional)

### Frontend (React + Vite)
Create a `client/` directory with:
- Vite + React setup
- Home page to create new sessions
- Session page (`/session/:id`) with:
  - Code editor component
  - Language selector (JavaScript/Python)
  - Run button for code execution
  - Output panel for execution results
- Socket.io client for real-time updates

### Root package.json
Create a root `package.json` with workspaces for client and server.

After creating, commit with message: "feat: initial implementation of coding interview platform"

---

## Step 2: Integration Tests

Create integration tests in `server/tests/` that verify:
- Creating a new session returns a valid session ID
- WebSocket connection to a session works
- Code changes broadcast to all connected clients
- Multiple clients in the same session receive updates

Use Jest and supertest for HTTP tests, and socket.io-client for WebSocket tests.

Create/update `README.md` with:
- Project description
- Installation instructions (`npm install`)
- How to run tests (`npm test`)
- How to start development servers

Commit with message: "test: add integration tests for client-server interaction"

---

## Step 3: Concurrent Development Server

Update root `package.json` to use `concurrently` for running both client and server:
```json
{
  "scripts": {
    "dev": "concurrently \"npm run dev:server\" \"npm run dev:client\"",
    "dev:server": "npm run dev --workspace=server",
    "dev:client": "npm run dev --workspace=client"
  }
}
```

Install concurrently as a dev dependency.

Update README.md with the `npm run dev` command.

Commit with message: "feat: add concurrent dev server script"

---

## Step 4: Syntax Highlighting

Integrate a code editor with syntax highlighting:
- Use **CodeMirror 6** or **Monaco Editor** (prefer CodeMirror for lighter weight)
- Support JavaScript and Python syntax highlighting
- Add language selector dropdown that switches the editor mode

Commit with message: "feat: add syntax highlighting with CodeMirror"

---

## Step 5: Code Execution with WASM

Add browser-based code execution:
- For **Python**: Use **Pyodide** (Python compiled to WebAssembly)
- For **JavaScript**: Use the browser's built-in `eval()` or `Function()` constructor (sandboxed)
- Display output in a results panel below the editor
- Handle errors gracefully and display them to the user

Note: All execution happens in the browser - no server-side code execution for security.

Commit with message: "feat: add WASM-based code execution with Pyodide"

---

## Step 6: Containerization

Create a `Dockerfile` in the project root:
- Use **node:20-alpine** (or similar) as base image
- Multi-stage build:
  1. Build stage: Install dependencies and build the frontend
  2. Production stage: Copy built frontend and server, run Express
- The Express server should serve the built frontend static files
- Expose port 3001

Create `.dockerignore` to exclude node_modules, etc.

Add to README.md:
- Docker build command: `docker build -t coding-interview .`
- Docker run command: `docker run -p 3001:3001 coding-interview`

Commit with message: "feat: add Dockerfile for containerization"

---

## Step 7: Deployment Preparation

Prepare for deployment to a cloud service (Railway, Render, Fly.io, or similar):
- Ensure the app reads PORT from environment variables
- Add a `start` script for production
- Update README.md with deployment instructions

Commit with message: "feat: prepare for cloud deployment"

---

## Git Workflow

After each major step, commit your changes:
```bash
git add .
git commit -m "<commit message>"
```

At the end, push to GitHub:
```bash
git push origin main
```

---

## File Structure Expected
```
coding-interview/
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── CodeEditor.jsx
│   │   │   ├── OutputPanel.jsx
│   │   │   └── LanguageSelector.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   └── Session.jsx
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── server/
│   ├── tests/
│   │   └── integration.test.js
│   ├── index.js
│   └── package.json
├── Dockerfile
├── .dockerignore
├── package.json
├── README.md
└── AGENTS.md
```