// server.js
//
// The entry point. This file's only jobs are:
//   1. create the Express app
//   2. register global middleware (JSON parsing + our logger)
//   3. mount the task routes
//   4. start listening on a port
//
// Keeping the actual route logic in routes/tasks.js keeps this file
// short and readable.

const express = require("express");
const path = require("path");
const logger = require("./middleware/logger");
const errorHandler = require("./middleware/errorHandler");
const httpError = require("./middleware/httpError");
const taskRoutes = require("./routes/tasks");

const app = express();
const PORT = 3000;

// Built-in middleware: parse incoming JSON request bodies so that
// req.body is available in our POST and PUT routes.
app.use(express.json());

// Our custom logging middleware, applied globally so it runs on
// EVERY request regardless of method or path.
app.use(logger);

// Serve the static front-end from the public/ folder. Visiting the base
// URL now returns public/index.html, which fetches and displays the tasks.
app.use(express.static(path.join(__dirname, "public")));

// Mount every /tasks route. Anything the router handles is prefixed
// with /tasks, so router.get("/") becomes GET /tasks, and
// router.get("/:id") becomes GET /tasks/:id.
app.use("/tasks", taskRoutes);

// ---- Stage 4: centralized error handling ----
// These MUST come after the routes above.

// Any request that didn't match a route above falls through to here.
app.use((req, res, next) => {
  next(httpError(404, `Route not found: ${req.method} ${req.originalUrl}`));
});

// The single error-handling middleware, registered LAST so every
// next(err) from anywhere in the app ends up here.
app.use(errorHandler);

// Start the server and confirm which port it's on.
app.listen(PORT, () => {
  console.log(`TaskForge API listening on http://localhost:${PORT}`);
});
