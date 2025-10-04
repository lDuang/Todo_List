import { serve } from '@hono/node-server';  // hono_server
import { Hono } from 'hono';  // hono主体
import { logger } from 'hono/logger'; // 中间件
if (process.env.NODE_ENV !== 'production') {
  const dotenv = await import('dotenv');
  dotenv.config();
}
import { cors } from 'hono/cors'; // 跨域中间件
import { zValidator } from '@hono/zod-validator'; // 数据验证中间件
import { z } from 'zod';  // zod 数据校验
import { db } from './db/index.js'; // 数据库迁移
import { todos } from './db/schema.js'; // 数据库规范
import { eq } from 'drizzle-orm'; // orm库

const app = new Hono();  // 实例化 Hono 应用
app.use(logger()); // 应用日志中间件
app.use(cors());   // 应用跨域中间件

const createTodoSchema = z.object({
  title: z.string().min(1, 'Title cannot be empty'),
});

// optional() 非强制的 (可选)
const updateTodoSchema = z.object({
  title: z.string().min(1, 'Title cannot be empty').optional(),
  completed: z.boolean().optional(),
});

// 定义一个 GET 请求 获取 todo-list
app.get('/api/todos', async (c) => {
  try {
    // 通过 drizzle-orm 库的实例 db 获取 todos 表内容
    const allTodos = await db.select().from(todos);
    // 通过Context 返回 Json 序列化后 todos表 内容
    return c.json(allTodos);
    // 捕获error
  } catch (error) {
    // 终端打印
    console.error('Error fetching todos:', error);
    // 获取错误消息
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    // 服务器内部错误 - 500
    return c.json({ error: 'Failed to fetch todos', details: errorMessage }, 500);
  }
});

// 定义 POST 请求-新建 todo
// 中间件 zValidator 验证 createTodoSchema 规则
// 通过后则添加valid字段到上下文中请求体，名称为 json
app.post('/api/todos', zValidator('json', createTodoSchema), async (c) => {
  // 从上下文中 valid 字段中 json 取出 title (指定需要的参数)
  const { title } = c.req.valid('json');
  // 插入方法 insert(指定表) 插入数据 { title }
  // returning 传出新插入的数据  (列表)
  const newTodo = await db.insert(todos).values({ title }).returning();
  // 返回 列表中第一个 ，因为我们只插入了一个数据
  return c.json(newTodo[0], 201);
});

// 定义 PUT 请求-更改todo
//  中间件zValidator验证 updateTodoSchema 规则
app.put('/api/todos/:id', zValidator('json', updateTodoSchema), async (c) => {
  // 从路由参数中获取 id
  const id = Number(c.req.param('id'));
  // 从上下文中 valid 字段中 json 取出数据
  const data = c.req.valid('json');

  // 判断数字
  if (isNaN(id)) {
    // 如果不是数字
    return c.json({ error: 'Invalid ID' }, 400);
  }

  // 更新 todos 表中 todos.id == id 的数据列，将 data 作为新数据
  const updatedTodo = await db.update(todos).set(data).where(eq(todos.id, id)).returning();

  // 如果更新的数据长度为 0 
  if (updatedTodo.length === 0) {
    // 返回 404
    return c.json({ error: 'Todo not found' }, 404);
  }

  // 一切正常返回 returning 返回的列表中第一个
  return c.json(updatedTodo[0]);
});

// 定义请求 DELETE
app.delete('/api/todos/:id', async (c) => {
  // 接收路由参数 id
  const id = Number(c.req.param('id'));

  // 判断数字
  if (isNaN(id)) {
    return c.json({ error: 'Invalid ID' }, 400);
  }

  // 通过 eq 比对 todos.id == id 的列进行删除
  const deletedTodo = await db.delete(todos).where(eq(todos.id, id)).returning();

  // 判断删除的数据长度
  if (deletedTodo.length === 0) {
    return c.json({ error: 'Todo not found' }, 404);
  }

  // 返回删除成功.
  return c.json({ message: 'Todo deleted successfully' });
});

// 定义端口 环境变量(转换10进制) 或 默认8000
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 8000;

// server 函数
// 传入 hono 启动参数
serve({
  fetch: app.fetch,
  port: port
}, (info) => { // 启动成功打印
  console.log(`Server is running on http://localhost:${info.port}`);
});
