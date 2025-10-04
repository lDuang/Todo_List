import { pgTable, serial, boolean, timestamp, varchar, bigserial } from 'drizzle-orm/pg-core';

// 定义 todos 表
export const todos = pgTable('todos', {
  // id 自增,主键约束
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  // clientId 唯一ID，用于前端 optimistic UI
  clientId: varchar('client_id', { length: 21 }).notNull().unique(),
  // title 文本 不为空(notNull) 唯一(unique)
  title: varchar('title', { length: 64 }).notNull().unique(),
  // completed 布尔值 默认 false 不为空
  completed: boolean('completed').default(false).notNull(),
  // created_at 时间 默认当前时间 不为空 
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
