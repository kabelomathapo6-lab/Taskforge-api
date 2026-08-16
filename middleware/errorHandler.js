// middleware/errorHandler.js
//
// STAGE 4: the single, centralized error handler.
//
// An Express error-handling middleware is special: it takes FOUR
// arguments (err, req, res, next). Express recognises that signature and
// only calls this function when something upstream calls next(err) or an
// async route rejects. Because it lives LAST in the middleware stack in
// server.js, every route can simply hand its errors here instead of
// formatting a response itself.
//
// Each error carries an optional `status` we attach at the point it's
// thrown; if it doesn't have one, we default to 500 (server error).

function errorHandler(err, req, res, next) {
  const status = err.status || 500;

  // Log the real error server-side for debugging...
  console.error(`[error] ${req.method} ${req.originalUrl} -> ${status}: ${err.message}`);

  // ...but only send a clean, safe message to the client. Never leak a
  // raw stack trace to the caller.
  res.status(status).json({
    error: err.message || "Something went wrong",
  });
}

module.exports = errorHandler;
