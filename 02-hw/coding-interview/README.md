# Coding Interview Platform

A real-time collaborative coding interview platform that allows interviewers to create shareable session links for candidates. Features live code synchronization, syntax highlighting for JavaScript and Python, and safe browser-based code execution using WebAssembly.

## Features

- **Real-time Collaboration**: All users in a session see code changes instantly via WebSocket connections
- **Shareable Sessions**: Create unique session links to share with candidates
- **Multi-Language Support**: Syntax highlighting and execution for JavaScript and Python
- **Safe Execution**: Code runs in the browser using WebAssembly (Pyodide for Python)
- **Modern UI**: Clean, VS Code-inspired interface

## Tech Stack

- **Frontend**: React + Vite
- **Backend**: Express.js + Socket.io
- **Real-time Communication**: WebSocket (Socket.io)
- **Code Execution**: Browser-based (JavaScript native, Pyodide for Python)
- **Deployment**: Docker-ready with containerization support

## Project Structure

```
coding-interview/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── server/                # Express backend
│   ├── tests/            # Integration tests
│   ├── index.js          # Main server file
│   └── package.json
├── package.json          # Root workspace config
└── README.md
```

## Installation

Install all dependencies for both client and server:

```bash
npm install
```

This will install dependencies for the root workspace, client, and server using npm workspaces.

## Development

### Start Both Client and Server

The project includes scripts to run the development servers concurrently:

```bash
npm run dev
```

This will start both the backend server (port 3001) and frontend dev server (port 5173) simultaneously.

### Start Individually

Start the backend server (runs on port 3001):

```bash
npm run dev:server
```

Start the frontend development server (runs on port 5173):

```bash
npm run dev:client
```

The frontend will proxy API requests to the backend automatically.

## Testing

Run the integration tests:

```bash
npm test --workspace=server
```

Or from the server directory:

```bash
cd server
npm test
```

The test suite includes:
- REST API endpoint tests (session creation and retrieval)
- WebSocket connection tests
- Real-time code synchronization tests
- Multi-client broadcast tests

## How to Use

1. Start the development servers (see Development section above)
2. Open your browser to `http://localhost:5173`
3. Click "Create New Session" to generate a new interview session
4. Share the session URL with your candidate
5. Both interviewer and candidate can edit code in real-time
6. Select JavaScript or Python from the language dropdown
7. Click "Run Code" to execute and see output

## Production Build

Build the frontend for production:

```bash
npm run build --workspace=client
```

Start the production server:

```bash
NODE_ENV=production npm start --workspace=server
```

## Docker Deployment

Build the Docker image (available after Step 6):

```bash
docker build -t coding-interview .
```

Run the container:

```bash
docker run -p 3001:3001 coding-interview
```

Access the application at `http://localhost:3001`

## Environment Variables

- `PORT` - Server port (default: 3001)
- `NODE_ENV` - Environment mode ('development' or 'production')

## License

MIT
