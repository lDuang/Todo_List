export interface Todo {
  id: number;
  clientId: string;
  title: string;
  completed: boolean;
  createdAt: string;
  description?: string;
  dueDate?: string;
}

export type CreateTodoData = Pick<Todo, 'title' | 'clientId'> & { dueDate?: string };
export type UpdateTodoData = Partial<Pick<Todo, 'title' | 'completed' | 'description' | 'dueDate'>>;

export interface ElectronAPI {
  getTodos: () => Promise<Todo[]>;
  createTodo: (data: CreateTodoData) => Promise<Todo>;
  updateTodo: (id: number, updates: UpdateTodoData) => Promise<Todo>;
  deleteTodo: (id: number) => Promise<void>;
}
