export interface Todo {
  id: number;
  clientId: string;
  title: string;
  completed: boolean;
  createdAt: string;
}

export type CreateTodoData = Pick<Todo, 'title' | 'clientId'>;
export type UpdateTodoData = Partial<Pick<Todo, 'title' | 'completed'>>;

export interface ElectronAPI {
  getTodos: () => Promise<Todo[]>;
  createTodo: (data: CreateTodoData) => Promise<Todo>;
  updateTodo: (id: number, updates: UpdateTodoData) => Promise<Todo>;
  deleteTodo: (id: number) => Promise<void>;
}
