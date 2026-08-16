// middleware/logger.js
//
// Custom logging middleware.
// Express calls this on EVERY incoming request because we register it
// globally in server.js with app.use(logger). It logs the method, path
// and a timestamp, then calls next() to hand control to the next
// middleware or route. If we forgot next(), the request would hang forever.

function logger(req, res, next) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.originalUrl}`);
  next();
}

module.exports = logger;
