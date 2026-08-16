// routes/tasks.js
//
// All five task routes live here, split out from server.js so the
// server file stays small and each concern has its own home (the brief
// grades code organisation).
//
// STAGE 1: tasks live in a plain in-memory array. That means they reset
// every time the server restarts. In Stage 3 we swap this array for a
// tasks.json file so the data actually persists, but the route logic
// stays almost identical.

const express = require("express");
const { nanoid } = require("nanoid");

const router = express.Router();

// Our in-memory "database" for Stage 1: just an array of task objects.
let tasks = [
  {
    id: nanoid(),
    title: "Set up the Express server",
    completed: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: nanoid(),
    title: "Build the five task routes",
    completed: false,
    createdAt: new Date().toISOString(),
  },
];

// GET /tasks — return the whole list of tasks.
router.get("/", (req, res) => {
  res.json(tasks);
});

// GET /tasks/:id — return a single task by its id.
router.get("/:id", (req, res) => {
  const task = tasks.find((t) => t.id === req.params.id);
  if (!task) {
    return res.status(404).json({ error: "Task not found" });
  }
  res.json(task);
});

// POST /tasks — create a new task.
// The client sends a title; we generate everything else.
router.post("/", (req, res) => {
  const { title } = req.body;

  // title is required — reject anything missing or blank.
  if (!title || title.trim() === "") {
    return res.status(400).json({ error: "A title is required" });
  }

  const newTask = {
    id: nanoid(),
    title: title.trim(),
    completed: false, // defaults to false
    createdAt: new Date().toISOString(), // set automatically
  };

  tasks.push(newTask);
  res.status(201).json(newTask);
});

// PUT /tasks/:id — update an existing task (title and/or completed).
router.put("/:id", (req, res) => {
  const task = tasks.find((t) => t.id === req.params.id);
  if (!task) {
    return res.status(404).json({ error: "Task not found" });
  }

  const { title, completed } = req.body;

  // Only change the fields the client actually sent.
  if (title !== undefined) {
    if (title.trim() === "") {
      return res.status(400).json({ error: "Title cannot be empty" });
    }
    task.title = title.trim();
  }
  if (completed !== undefined) {
    task.completed = Boolean(completed);
  }

  res.json(task);
});

// DELETE /tasks/:id — remove a task.
router.delete("/:id", (req, res) => {
  const index = tasks.findIndex((t) => t.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: "Task not found" });
  }

  const [removed] = tasks.splice(index, 1);
  res.json({ message: "Task deleted", task: removed });
});

module.exports = router;
