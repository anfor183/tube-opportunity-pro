// Smart Launcher for TubeOpportunity PRO
// Checks if the server is already active on port 5000:
// - If already running, instantly opens the app in your browser
// - If not running, launches the backend and opens the app

const http = require('http');
const { exec, spawn } = require('child_process');
const path = require('path');

const APP_URL = 'http://localhost:5000';
const HEALTH_URL = 'http://localhost:5000/api/health';

function openBrowser() {
  const startCmd = process.platform === 'win32' ? 'start' : (process.platform === 'darwin' ? 'open' : 'xdg-open');
  exec(`${startCmd} ${APP_URL}`);
}

const req = http.get(HEALTH_URL, (res) => {
  if (res.statusCode === 200) {
    // Server is already alive! Just open browser
    console.log('TubeOpportunity PRO is already running. Opening browser...');
    openBrowser();
    process.exit(0);
  } else {
    startServer();
  }
});

req.on('error', () => {
  startServer();
});

function startServer() {
  console.log('Starting TubeOpportunity PRO backend server...');
  const serverPath = path.join(__dirname, 'server/src/server.js');
  
  const serverProcess = spawn('node', [serverPath], {
    detached: true,
    stdio: 'ignore',
    cwd: __dirname
  });
  
  serverProcess.unref();

  // Wait 1.5 seconds for server to bind port 5000, then open browser
  setTimeout(() => {
    openBrowser();
    process.exit(0);
  }, 1500);
}
