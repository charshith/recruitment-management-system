// Simple in-memory rate limiter (for production, use Redis)
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS = 200; // Increased from 100 to 200 per window

const rateLimiter = (req, res, next) => {
  // Skip rate limiting for health checks
  if (req.path === '/health' || req.path === '/api/health') {
    return next();
  }

  // Get IP address - handle various proxy scenarios
  const key = req.ip || 
              req.headers['x-forwarded-for']?.split(',')[0]?.trim() || 
              req.connection?.remoteAddress || 
              req.socket?.remoteAddress ||
              'unknown';
  
  const now = Date.now();

  if (!rateLimitMap.has(key)) {
    rateLimitMap.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return next();
  }

  const limit = rateLimitMap.get(key);

  if (now > limit.resetTime) {
    limit.count = 1;
    limit.resetTime = now + RATE_LIMIT_WINDOW;
    return next();
  }

  if (limit.count >= MAX_REQUESTS) {
    return res.status(429).json({
      error: 'Too many requests, please try again later',
      retryAfter: Math.ceil((limit.resetTime - now) / 1000)
    });
  }

  limit.count++;
  next();
};

// Cleanup old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitMap.entries()) {
    if (now > value.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}, RATE_LIMIT_WINDOW);

module.exports = rateLimiter;

