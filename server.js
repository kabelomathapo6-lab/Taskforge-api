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
const logger = require("./middleware/logger");
const taskRoutes = require("./routes/tasks");

const app = express();
const PORT = 3000;

// Built-in middleware: parse incoming JSON request bodies so that
// req.body is available in our POST and PUT routes.
app.use(express.json());

// Our custom logging middleware, applied globally so it runs on
// EVERY request regardless of method or path.
app.use(logger);

// Mount every /tasks route. Anything the router handles is prefixed
// with /tasks, so router.get("/") becomes GET /tasks, and
// router.get("/:id") becomes GET /tasks/:id.
app.use("/tasks", taskRoutes);

// A tiny root route so visiting the base URL isn't a 404.
app.get("/", (req, res) => {
  res.json({ message: "TaskForge API is running. Try GET /tasks" });
});

// Start the server and confirm which port it's on.
app.listen(PORT, () => {
  console.log(`TaskForge API listening on http://localhost:${PORT}`);
});
