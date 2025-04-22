/**
 * Development server for Phoenixfall game
 */
const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const port = process.env.PORT || 3000;

// Set proper MIME types for JavaScript modules
app.use((req, res, next) => {
  const ext = path.extname(req.path);
  if (ext === '.js') {
    res.type('application/javascript');
  }
  next();
});

// Serve static files from the root directory
app.use(express.static(__dirname, {
  setHeaders: (res, filePath) => {
    if (path.extname(filePath) === '.js') {
      // Ensure JS files are served with the correct content type
      res.setHeader('Content-Type', 'application/javascript');
    }
  }
}));

// Explicitly serve favicon from public directory
app.get('/favicon.ico', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'favicon.ico'));
});

// Fallback route for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  console.log(`Open http://localhost:${port} in your browser`);
}); 