import { app } from 'electron';
import path from 'path';
import sqlite3 from 'sqlite3';
import type { Database as SQLite3Database, RunResult as SQLite3RunResult } from 'sqlite3'
import type { CreateTodoData, Todo, UpdateTodoData } from './types.js'

// Define the interface for our custom promisified database methods
interface CustomDatabase {
  run(sql: string, ...params: any[]): Promise<SQLite3RunResult>;
  get<T>(sql: string, ...params: any[]): Promise<T | undefined>;
  all<T>(sql: string, ...params: any[]): Promise<T[]>;
  exec(sql: string): Promise<void>;
  close(): Promise<void>;
}

let db: CustomDatabase;

export async function initializeDatabase(): Promise<void> {
  return new Promise((resolve, reject) => {
    const dbPath = path.join(app.getPath('userData'), 'todos.db');
    const sqliteInstance = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('打开数据库失败', err);
        return reject(err);
      }
      console.log('数据库已打开');

      // Create a custom database object with promisified methods
      db = {
        run: (sql: string, ...params: any[]) =>
          new Promise<SQLite3RunResult>((innerResolve, innerReject) => {
            sqliteInstance.run(sql, params, function (this: SQLite3RunResult, err: Error | null) {
              if (err) innerReject(err);
              else innerResolve(this);
            });
          }),
        get: <T>(sql: string, ...params: any[]) =>
          new Promise<T | undefined>((innerResolve, innerReject) => {
            sqliteInstance.get(sql, params, (err: Error | null, row: T) => {
              if (err) innerReject(err);
              else innerResolve(row);
            });
          }),
        all: <T>(sql: string, ...params: any[]) =>
          new Promise<T[]>((innerResolve, innerReject) => {
            sqliteInstance.all(sql, params, (err: Error | null, rows: T[]) => {
              if (err) innerReject(err);
              else innerResolve(rows);
            });
          }),
        exec: (sql: string) =>
          new Promise<void>((innerResolve, innerReject) => {
            sqliteInstance.exec(sql, (err: Error | null) => {
              if (err) innerReject(err);
              else innerResolve();
            });
          }),
        close: () =>
          new Promise<void>((innerResolve, innerReject) => {
            sqliteInstance.close((err: Error | null) => {
              if (err) innerReject(err);
              else innerResolve();
            });
          }),
      };

      db.exec(`
        DROP TABLE IF EXISTS todos;
      `).then(() => {
        return db.exec(`
          CREATE TABLE todos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            clientId TEXT UNIQUE,
            title TEXT NOT NULL UNIQUE,
            completed INTEGER NOT NULL DEFAULT 0,
            createdAt TEXT NOT NULL
          );
        `);
      })
      .then(() => {
          console.log('待办事项表已初始化。');
          resolve();
        })
        .catch((execErr) => {
          console.error('创建待办事项表失败', execErr);
          reject(execErr);
        });
    });
  });
}

export async function getTodos(): Promise<Todo[]> {
  const todos = await db.all<Todo>('SELECT * FROM todos ORDER BY createdAt DESC')
  return todos.map((todo) => ({ ...todo, completed: !!todo.completed }))
}

export async function createTodo(data: CreateTodoData): Promise<Todo> {
  const { title, clientId } = data
  const createdAt = new Date().toISOString()
  try {
    const result: SQLite3RunResult = await db.run(
      'INSERT INTO todos (clientId, title, completed, createdAt) VALUES (?, ?, ?, ?)',
      clientId,
      title,
      0,
      createdAt,
    )
    const newTodo = await db.get<Todo>('SELECT * FROM todos WHERE id = ?', result.lastID)
    if (!newTodo) {
      throw new Error('创建待办事项后未能检索到新创建的待办事项')
    }
    return { ...newTodo, completed: !!newTodo.completed }
  } catch (error: any) {
    if (error.code === 'SQLITE_CONSTRAINT') {
      throw new Error(`待办事项 "${title}" 已存在。`)
    }
    throw error
  }
}

export async function updateTodo(id: number, updates: UpdateTodoData): Promise<Todo> {
  const fields = Object.keys(updates)
    .map((key) => `${key} = ?`)
    .join(', ');
  const values = Object.values(updates);
  await db.run(`UPDATE todos SET ${fields} WHERE id = ?`, ...values, id);
  const updatedTodo = await db.get<Todo>('SELECT * FROM todos WHERE id = ?', id);
  if (!updatedTodo) {
    throw new Error(`更新待办事项 ${id} 后未能检索到更新后的待办事项`);
  }
  return updatedTodo;
}

export async function deleteTodo(id: number): Promise<void> {
  await db.run('DELETE FROM todos WHERE id = ?', id);
}
