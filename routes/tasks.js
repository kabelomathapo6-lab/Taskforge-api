// routes/tasks.js
//
// STAGE 3: every route now reads and writes tasks.json through the
// taskStore helper (fs.promises + async/await), so data persists across
// restarts. Status codes have been corrected to follow REST conventions:
//   200 OK              - successful GET / PUT
//   201 Created         - successful POST
//   204 No Content      - successful DELETE (nothing to return)
//   400 Bad Request     - invalid input (e.g. missing title)
//   404 Not Found       - no task with that id

const express = require("express");
const { nanoid } = require("nanoid");
const { readTasks, writeTasks } = require("../data/taskStore");

const router = express.Router();

// Simulates a slow external check for the /verify endpoint (Stage 2).
function slowCheck(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// GET /tasks — return the whole list.
router.get("/", async (req, res) => {
  const tasks = await readTasks();
  res.status(200).json(tasks);
});

// GET /tasks/:id/verify — Stage 2, simulated slow verification.
router.get("/:id/verify", async (req, res) => {
  try {
    const tasks = await readTasks();
    const task = tasks.find((t) => t.id === req.params.id);

    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    await slowCheck(1500);

    if (!task.title || task.title.trim() === "") {
      throw new Error("Task failed verification: it has no title");
    }

    res.status(200).json({ verified: true, task, message: "Task verified successfully" });
  } catch (err) {
    res.status(400).json({ verified: false, error: err.message });
  }
});

// GET /tasks/:id — return a single task.
router.get("/:id", async (req, res) => {
  const tasks = await readTasks();
  const task = tasks.find((t) => t.id === req.params.id);
  if (!task) {
    return res.status(404).json({ error: "Task not found" });
  }
  res.status(200).json(task);
});

// POST /tasks — create a new task. 201 on success, 400 on bad input.
router.post("/", async (req, res) => {
  const { title } = req.body;
  if (!title || title.trim() === "") {
    return res.status(400).json({ error: "A title is required" });
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
});

// PUT /tasks/:id — update a task. 200 on success, 404 if missing.
router.put("/:id", async (req, res) => {
  const tasks = await readTasks();
  const task = tasks.find((t) => t.id === req.params.id);
  if (!task) {
    return res.status(404).json({ error: "Task not found" });
  }

  const { title, completed } = req.body;
  if (title !== undefined) {
    if (title.trim() === "") {
      return res.status(400).json({ error: "Title cannot be empty" });
    }
    task.title = title.trim();
  }
  if (completed !== undefined) {
    task.completed = Boolean(completed);
  }

  await writeTasks(tasks);
  res.status(200).json(task);
});

// DELETE /tasks/:id — remove a task. 204 No Content on success.
router.delete("/:id", async (req, res) => {
  const tasks = await readTasks();
  const index = tasks.findIndex((t) => t.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: "Task not found" });
  }

  tasks.splice(index, 1);
  await writeTasks(tasks);

  // 204 means "success, but there's nothing to send back".
  res.status(204).end();
});

module.exports = router;
