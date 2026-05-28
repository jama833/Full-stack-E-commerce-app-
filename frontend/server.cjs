const express = require('express');
const path = require('path');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = process.env.PORT || 3000;

// Get backend URL from environment or use default
const BACKEND_URL = process.env.BACKEND_URL || 'http://ecommerceproject-env.eba-kesmjpp4.eu-north-1.elasticbeanstalk.com';

// Proxy API calls to the backend
app.use('/api', createProxyMiddleware({
  target: BACKEND_URL,
  changeOrigin: true,
  pathRewrite: {
    '^/api': '/api'
  }
}));

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, 'dist')));

// Handle routing - serve index.html for all routes (catch-all middleware)
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Frontend server running on port ${PORT}`);
  console.log(`Backend API proxied to: ${BACKEND_URL}`);
});
