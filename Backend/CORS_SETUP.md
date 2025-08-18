# CORS Configuration Guide

This guide explains how CORS is configured in your Ciphera Backend and how to set it up for your frontend.

## What is CORS?

CORS (Cross-Origin Resource Sharing) is a security feature that controls which websites can access your API. It prevents malicious websites from making requests to your API on behalf of users.

## Current Configuration

Your CORS is configured to be **development-friendly** while maintaining security in production:

### Development Mode (`NODE_ENV=development`)
- ✅ **All origins allowed** - Your frontend can run on any port
- ✅ **All common development ports pre-approved**
- ✅ **Easy testing** with Postman, browser dev tools, etc.

### Production Mode (`NODE_ENV=production`)
- 🔒 **Only specified origins allowed**
- 🔒 **Strict origin checking**
- 🔒 **Logging of blocked requests**

## Allowed Origins

### Development Ports (Automatically Allowed)
- `http://localhost:3000` - React default
- `http://localhost:5173` - Vite default  
- `http://localhost:4200` - Angular default
- `http://localhost:8080` - Vue default
- `http://localhost:3001` - Alternative React port
- `http://localhost:5174` - Alternative Vite port

### Custom Frontend URLs
Set these in your `.env` file:

```bash
# Single URL
FRONTEND_URL=http://localhost:3000

# Multiple URLs (comma-separated)
FRONTEND_URL=http://localhost:3000,http://localhost:5173,https://myapp.com
```

## Setup Instructions

### 1. Environment Configuration

Create or update your `.env` file:

```bash
# Development (permissive CORS)
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Production (restrictive CORS)  
NODE_ENV=production
FRONTEND_URL=https://yourdomain.com,https://www.yourdomain.com
```

### 2. Frontend Configuration

#### React/Axios Example
```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3560',
  withCredentials: true, // Important for cookies/auth
  headers: {
    'Content-Type': 'application/json',
  }
});

// Make API calls
const response = await api.get('/api/auth/profile');
```

#### Fetch API Example
```javascript
const response = await fetch('http://localhost:3560/api/auth/login', {
  method: 'POST',
  credentials: 'include', // Important for cookies/auth
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password'
  })
});
```

### 3. Testing CORS

Run the CORS test script:

```bash
# Test with default API URL
node scripts/test-cors.js

# Test with custom API URL
API_URL=http://localhost:3560 node scripts/test-cors.js
```

## Common Issues & Solutions

### Issue: "CORS policy: No 'Access-Control-Allow-Origin' header"
**Solution**: 
- Check if `NODE_ENV=development` in your `.env`
- Verify your frontend URL is in the allowed list
- Restart your backend server

### Issue: "CORS policy: Request header field authorization is not allowed"
**Solution**: 
- The `Authorization` header is already allowed in the config
- Make sure you're using the correct header name (case-sensitive)

### Issue: "CORS policy: The request client is not a secure context"
**Solution**: 
- Use `https://` in production
- For local development, use `http://localhost`

## Security Considerations

### Development
- ✅ All origins allowed for easy testing
- ✅ Chrome extensions supported
- ✅ Postman and other tools work

### Production  
- 🔒 Only specified domains allowed
- 🔒 Strict origin validation
- 🔒 Request logging for blocked origins
- 🔒 HTTPS required for production domains

## Customization

### Adding New Origins
Edit `config/cors.js`:

```javascript
const devPorts = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:4200',
  'http://localhost:8080',
  'http://localhost:3001',
  'http://localhost:5174',
  'http://localhost:4000', // Add your custom port
];
```

### Adding New Headers
Edit `config/cors.js`:

```javascript
allowedHeaders: [
  'Content-Type', 
  'Authorization', 
  'X-Requested-With',
  'Accept',
  'Origin',
  'X-Custom-Header', // Add your custom header
],
```

## Testing Your Frontend

1. **Start your backend**: `npm run dev`
2. **Start your frontend** on an allowed port (e.g., 3000)
3. **Make a test request** to your API
4. **Check browser console** for CORS errors
5. **Check backend logs** for CORS information

## Need Help?

- Check the browser's Network tab for CORS headers
- Look at your backend console for CORS logs
- Run the CORS test script: `node scripts/test-cors.js`
- Verify your environment variables are set correctly
