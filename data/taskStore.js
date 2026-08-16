// data/taskStore.js
//
// Stage 3: the data now lives in tasks.json instead of an in-memory
// array, so it survives server restarts. All file access goes through
// fs.promises with async/await, and lives here in one place so the route
// handlers don't each have to know how the file is read or written.

const fs = require("fs/promises");
const path = require("path");

const FILE = path.join(__dirname, "tasks.json");

// Read the whole task list from disk and parse it into a JS array.
async function readTasks() {
  const raw = await fs.readFile(FILE, "utf-8");
  return JSON.parse(raw);
}

// Write the whole task list back to disk, nicely formatted.
async function writeTasks(tasks) {
  await fs.writeFile(FILE, JSON.stringify(tasks, null, 2), "utf-8");
}

module.exports = { readTasks, writeTasks };
