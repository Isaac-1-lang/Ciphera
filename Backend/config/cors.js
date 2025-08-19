export const corsOptions = {
  origin: (origin, cb) => {
    const allowedOrigins = [
      'https://ciphera.onrender.com',"http://localhost:8080"
    ];

    if (!origin) {
      return cb(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return cb(null, true);
    }

    console.log(`❌ CORS blocked request from: ${origin}`);
    return cb(new Error('Not allowed by CORS'));
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
  maxAge: 86400,
  preflightContinue: false,
  optionsSuccessStatus: 204
};

export const devCorsOptions = {
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['Content-Length', 'X-Requested-With'],
  maxAge: 86400
};
