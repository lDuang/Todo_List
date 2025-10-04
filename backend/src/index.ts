import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { logger } from 'hono/logger';
if (process.env.NODE_ENV !== 'production') {
  const dotenv = await import('dotenv');
  dotenv.config();
}
import { cors } from 'hono/cors';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { db } from './db/index.js';
import { todos } from './db/schema.js';
import { eq } from 'drizzle-orm';

const app = new Hono();

app.use('*', logger());
app.use('/api/*', cors());

// Zod schema for validation
const createTodoSchema = z.object({
  title: z.string().min(1, 'Title cannot be empty'),
});

const updateTodoSchema = z.object({
  title: z.string().min(1, 'Title cannot be empty').optional(),
  completed: z.boolean().optional(),
});

// Routes
app.get('/api/todos', async (c) => {
  try {
    const allTodos = await db.select().from(todos);
    return c.json(allTodos);
  } catch (error) {
    console.error('Error fetching todos:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return c.json({ error: 'Failed to fetch todos', details: errorMessage }, 500);
  }
});

app.post('/api/todos', zValidator('json', createTodoSchema), async (c) => {
  const { title } = c.req.valid('json');
  const newTodo = await db.insert(todos).values({ title }).returning();
  return c.json(newTodo[0], 201);
});

app.put('/api/todos/:id', zValidator('json', updateTodoSchema), async (c) => {
  const id = Number(c.req.param('id'));
  const data = c.req.valid('json');

  if (isNaN(id)) {
    return c.json({ error: 'Invalid ID' }, 400);
  }

  const updatedTodo = await db.update(todos).set(data).where(eq(todos.id, id)).returning();

  if (updatedTodo.length === 0) {
    return c.json({ error: 'Todo not found' }, 404);
  }

  return c.json(updatedTodo[0]);
});

app.delete('/api/todos/:id', async (c) => {
  const id = Number(c.req.param('id'));

  if (isNaN(id)) {
    return c.json({ error: 'Invalid ID' }, 400);
  }

  const deletedTodo = await db.delete(todos).where(eq(todos.id, id)).returning();

  if (deletedTodo.length === 0) {
    return c.json({ error: 'Todo not found' }, 404);
  }

  return c.json({ message: 'Todo deleted successfully' });
});

const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 8000;

serve({
  fetch: app.fetch,
  port: port
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`);
});
