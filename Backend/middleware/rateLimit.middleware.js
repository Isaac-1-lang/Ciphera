import { logger } from '../utils/logger.js';

// Simple in-memory rate limiting (use Redis in production)
const rateLimitStore = new Map();

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of rateLimitStore.entries()) {
    if (now - data.resetTime > 0) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

export const rateLimit = (options = {}) => {
  const {
    windowMs = 15 * 60 * 1000, // 15 minutes
    max = 100, // limit each IP to 100 requests per windowMs
    message = 'Too many requests from this IP, please try again later.',
    keyGenerator = (req) => req.ip || req.connection.remoteAddress,
    skip = (req) => false,
    handler = (req, res) => {
      res.status(429).json({
        success: false,
        message: message
      });
    }
  } = options;

  return (req, res, next) => {
    if (skip(req)) {
      return next();
    }

    const key = keyGenerator(req);
    const now = Date.now();
    const windowStart = now - windowMs;

    // Get current rate limit data
    const current = rateLimitStore.get(key) || {
      count: 0,
      resetTime: now + windowMs
    };

    // Reset if window has passed
    if (now > current.resetTime) {
      current.count = 1;
      current.resetTime = now + windowMs;
    } else {
      current.count++;
    }

    // Store updated data
    rateLimitStore.set(key, current);

    // Set rate limit headers
    res.set({
      'X-RateLimit-Limit': max,
      'X-RateLimit-Remaining': Math.max(0, max - current.count),
      'X-RateLimit-Reset': new Date(current.resetTime).toISOString()
    });

    // Check if limit exceeded
    if (current.count > max) {
      logger.warn('Rate limit exceeded', {
        ip: key,
        path: req.path,
        count: current.count,
        limit: max
      });
      return handler(req, res);
    }

    next();
  };
};

// Specific rate limiters for different endpoints
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per 15 minutes for auth endpoints
  message: 'Too many authentication attempts, please try again later.',
  keyGenerator: (req) => `auth:${req.ip || req.connection.remoteAddress}`
});

export const strictRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 requests per minute
  message: 'Too many requests, please slow down.',
  keyGenerator: (req) => `strict:${req.ip || req.connection.remoteAddress}`
});
