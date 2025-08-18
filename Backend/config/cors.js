// CORS Configuration
export const corsOptions = {
  origin: (origin, cb) => {
    // In development, allow all origins for easier frontend development
    if (process.env.NODE_ENV === 'development') {
      return cb(null, true);
    }
    
    // Parse multiple frontend URLs from environment variable
    const frontendUrls = process.env.FRONTEND_URL 
      ? process.env.FRONTEND_URL.split(',').map(url => url.trim())
      : ['http://localhost:8080'];
    
    // Common development ports
    const devPorts = [
      'http://localhost:3000',  // React
      'http://localhost:5173',  // Vite
      'http://localhost:4200',  // Angular
      'http://localhost:8080',  // Vue
      'http://localhost:3001',  // Alternative React port
      'http://localhost:5174',  // Alternative Vite port
    ];
    
    // Combine allowed origins
    const allowedOrigins = [...frontendUrls, ...devPorts];
    
    // Allow chrome extensions
    if (origin && origin.startsWith('chrome-extension://')) {
      return cb(null, true);
    }
    
    // Allow requests with no origin (like mobile apps, Postman, or server-to-server)
    if (!origin) {
      return cb(null, true);
    }
    
    // Check if origin is in allowed list
    if (allowedOrigins.includes(origin)) {
      return cb(null, true);
    }
    
    // For production, log blocked origins for debugging
    if (process.env.NODE_ENV === 'production') {
      console.log(`CORS blocked request from: ${origin}`);
      console.log(`Allowed origins: ${allowedOrigins.join(', ')}`);
    }
    
    return cb(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With',
    'Accept',
    'Origin',
    'Access-Control-Request-Method',
    'Access-Control-Request-Headers',
    'X-API-Key',
    'X-Client-Version'
  ],
  exposedHeaders: [
    'Content-Length', 
    'X-Requested-With',
    'X-Total-Count',
    'X-Page-Count'
  ],
  maxAge: 86400, // Cache preflight response for 24 hours
  preflightContinue: false,
  optionsSuccessStatus: 204
};

// Development CORS options (more permissive)
export const devCorsOptions = {
  origin: true, // Allow all origins in development
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With',
    'Accept',
    'Origin',
    'Access-Control-Request-Method',
    'Access-Control-Request-Headers'
  ],
  exposedHeaders: ['Content-Length', 'X-Requested-With'],
  maxAge: 86400
};
