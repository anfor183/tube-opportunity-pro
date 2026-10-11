const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const { getDb } = require('./db');
const { seedDatabase } = require('./db/seeds/realistic-seeds');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Database & Seeds
const db = getDb();
seedDatabase();

// API Routes
app.use('/api', apiRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'YouTube Evergreen Keyword & Virality Opportunity Intelligence Engine'
  });
});

// Serve frontend in production if built
const clientDistPath = path.join(__dirname, '../../client/dist');
app.use(express.static(clientDistPath));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(clientDistPath, 'index.html'), (err) => {
    if (err) {
      res.status(200).send('API Server running. Start Vite dev server for frontend UI.');
    }
  });
});

app.listen(PORT, () => {
  console.log(`================================================================`);
  console.log(`YouTube Intelligence Platform Backend running on http://localhost:${PORT}`);
  console.log(`SQLite WAL Database connected`);
  console.log(`Official YouTube Data API v3 integration active (with Quota Manager)`);
  console.log(`================================================================`);
});

module.exports = app;
