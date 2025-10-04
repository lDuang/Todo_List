import { z } from 'zod';

const todoSchema = z.object({
  id: z.number(),
  title: z.string(),
  completed: z.boolean(),
  createdAt: z.string(),
});

export type Todo = z.infer<typeof todoSchema>;

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api`;

export async function getTodos(): Promise<Todo[]> {
  const response = await fetch(`${API_BASE_URL}/todos`);
  if (!response.ok) {
    throw new Error('获取待办事项失败');
  }
  const data = await response.json();
  return z.array(todoSchema).parse(data);
}

export async function createTodo(title: string): Promise<Todo> {
  const response = await fetch(`${API_BASE_URL}/todos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title }),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || errorData.error || '创建待办事项失败');
  }
  const data = await response.json();
  return todoSchema.parse(data);
}

export async function updateTodo(id: number, updates: Partial<Omit<Todo, 'id' | 'createdAt'>>): Promise<Todo> {
  const response = await fetch(`${API_BASE_URL}/todos/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || errorData.error || '更新待办事项失败');
  }
  const data = await response.json();
  return todoSchema.parse(data);
}

export async function deleteTodo(id: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/todos/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || errorData.error || '删除待办事项失败');
  }
}
