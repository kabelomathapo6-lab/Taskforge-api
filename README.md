# TaskForge API

A task management REST API built with Node.js and Express, developed in four
stages. Tasks are stored in a JSON file and served through a small REST API,
with a static page that displays them.

## Setup

```bash
npm install
npm start
```

The server runs on http://localhost:3000. Open that URL in a browser to see the
static task list, or call the API routes directly.

## Routes

| Method | Route                | Description                          | Success |
| ------ | -------------------- | ------------------------------------ | ------- |
| GET    | /tasks               | List all tasks                       | 200     |
| GET    | /tasks/:id           | Get one task by id                   | 200     |
| POST   | /tasks               | Create a task (body: { title })      | 201     |
| PUT    | /tasks/:id           | Update a task (title and/or completed) | 200   |
| DELETE | /tasks/:id           | Delete a task                        | 204     |
| GET    | /tasks/:id/verify    | Simulated slow (async) verification  | 200     |

Error responses: 400 for invalid input, 404 for a task or route that doesn't
exist. Every error is shaped as `{ "error": "message" }`.

## Project structure

```
server.js                 entry point: middleware, routes, server start
routes/tasks.js           all task routes
middleware/logger.js      logs every request (method, path, timestamp)
middleware/errorHandler.js  single centralized error handler
middleware/httpError.js   helper to create errors with a status code
data/taskStore.js         reads/writes tasks.json with fs.promises
data/tasks.json           the stored tasks
public/index.html         static page that fetches and shows the tasks
```

## How it was built (stages)

1. **Stage 1** — Express server, five task routes, custom logging middleware.
2. **Stage 2** — async `/verify` endpoint using async/await, with error handling
   so a broken task fails gracefully instead of crashing the server.
3. **Stage 3** — moved storage from an in-memory array to `tasks.json` using
   `fs.promises`, added the static page, and corrected REST status codes.
4. **Stage 4** — centralized all error handling into one middleware, so every
   route forwards errors with `next(err)` instead of handling them inline.

## Notes

- `data/tasks.json` includes one deliberately broken task (no title) to
  demonstrate graceful error handling on the `/verify` route.
- Built with Express and nanoid (nanoid pinned to v3 for CommonJS `require`).
