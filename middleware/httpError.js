// middleware/httpError.js
//
// A tiny helper to build an Error that also carries an HTTP status code.
// This lets a route do `throw httpError(404, "Task not found")` and have
// the centralized errorHandler read err.status to send the right code.

function httpError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}

module.exports = httpError;
