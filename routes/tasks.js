// routes/tasks.js
//
// STAGE 4: error handling is now centralized. Notice there are no more
// try/catch blocks or inline error responses in the routes. Instead:
//
//   * asyncHandler() wraps each async route so that if it throws (or a
//     promise rejects), the error is automatically forwarded to Express
//     with next(err) no repetitive try/catch in every handler.
//   * When a route hits a problem (missing task, bad input), it simply
//     THROWS an httpError with the right status. That error travels to the
//     single errorHandler middleware registered last in server.js.
//
// The result: every route routes its errors through next(err), and one
// function decides the response.

const express = require("express");
const { nanoid } = require("nanoid");
const { readTasks, writeTasks } = require("../data/taskStore");
const httpError = require("../middleware/httpError");

const router = express.Router();

// Wraps an async route handler so any rejected promise is passed to
// next() automatically. This is what lets us throw errors freely inside
// async routes and have them reach the central error handler.
function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

function slowCheck(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// GET /tasks — return the whole list.
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const tasks = await readTasks();
    res.status(200).json(tasks);
  })
);

// GET /tasks/:id/verify — simulated slow verification.
router.get(
  "/:id/verify",
  asyncHandler(async (req, res) => {
    const tasks = await readTasks();
    const task = tasks.find((t) => t.id === req.params.id);
    if (!task) {
      throw httpError(404, "Task not found");
    }

    await slowCheck(1500);

    if (!task.title || task.title.trim() === "") {
      // A broken task is bad data 400. This throw travels to the central
      // handler instead of crashing the server.
      throw httpError(400, "Task failed verification: it has no title");
    }

    res.status(200).json({ verified: true, task, message: "Task verified successfully" });
  })
);

// GET /tasks/:id single task.
router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const tasks = await readTasks();
    const task = tasks.find((t) => t.id === req.params.id);
    if (!task) {
      throw httpError(404, "Task not found");
    }
    res.status(200).json(task);
  })
);

// POST /tasks — create.
router.post(
  "/",
  asyncHandler(async (req, res) => {
    const { title } = req.body;
    if (!title || title.trim() === "") {
      throw httpError(400, "A title is required");
    }

    const tasks = await readTasks();
    const newTask = {
      id: nanoid(),
      title: title.trim(),
      completed: false,
      createdAt: new Date().toISOString(),
    };
    tasks.push(newTask);
    await writeTasks(tasks);

    res.status(201).json(newTask);
  })
);

// PUT /tasks/:id update.
router.put(
  "/:id",
  asyncHandler(async (req, res) => {
    const tasks = await readTasks();
    const task = tasks.find((t) => t.id === req.params.id);
    if (!task) {
      throw httpError(404, "Task not found");
    }

    const { title, completed } = req.body;
    if (title !== undefined) {
      if (title.trim() === "") {
        throw httpError(400, "Title cannot be empty");
      }
      task.title = title.trim();
    }
    if (completed !== undefined) {
      task.completed = Boolean(completed);
    }

    await writeTasks(tasks);
    res.status(200).json(task);
  })
);

// DELETE /tasks/:id remove. 204 No Content on success.
router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const tasks = await readTasks();
    const index = tasks.findIndex((t) => t.id === req.params.id);
    if (index === -1) {
      throw httpError(404, "Task not found");
    }

    tasks.splice(index, 1);
    await writeTasks(tasks);
    res.status(204).end();
  })
);

module.exports = router;
