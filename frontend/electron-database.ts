import path from 'node:path';
import Database from 'better-sqlite3';

const dbPath = path.join(process.env.APPDATA || (process.platform == 'darwin' ? process.env.HOME + '/Library/Application Support' : process.env.HOME + '/.config'), 'TodoApp', 'todo.db');
const db = new Database(dbPath);

// Ensure the todos table exists
db.exec(`
  CREATE TABLE IF NOT EXISTS todos (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    completed INTEGER NOT NULL DEFAULT 0,
    createdAt INTEGER NOT NULL
  );
`);

export function getTodos() {
  return db.prepare('SELECT * FROM todos ORDER BY createdAt DESC').all();
}

export function addTodo(todo: { id: string; title: string; completed: boolean; createdAt: number }) {
  const stmt = db.prepare('INSERT INTO todos (id, title, completed, createdAt) VALUES (?, ?, ?, ?)');
  stmt.run(todo.id, todo.title, todo.completed ? 1 : 0, todo.createdAt);
  return todo;
}

export function updateTodo(id: string, updates: { title?: string; completed?: boolean }) {
  let setClauses: string[] = [];
  const params: any[] = [];

  if (updates.title !== undefined) {
    setClauses.push('title = ?');
    params.push(updates.title);
  }
  if (updates.completed !== undefined) {
    setClauses.push('completed = ?');
    params.push(updates.completed ? 1 : 0);
  }

  if (setClauses.length === 0) {
    return null; // No updates provided
  }

  const stmt = db.prepare(`UPDATE todos SET ${setClauses.join(', ')} WHERE id = ?`);
  stmt.run(...params, id);
  return { id, ...updates };
}

export function deleteTodo(id: string) {
  const stmt = db.prepare('DELETE FROM todos WHERE id = ?');
  stmt.run(id);
  return { id };
}
