import type {
  ElectronAPI,
  Todo as ElectronTodo,
  CreateTodoData as ElectronCreateTodoData,
  UpdateTodoData as ElectronUpdateTodoData,
} from '../../electron/types'

// Re-export the types for the rest of the app to use under local names
export type Todo = ElectronTodo
export type CreateTodoData = ElectronCreateTodoData
export type UpdateTodoData = ElectronUpdateTodoData

// Since the preload script exposes the API on window, we need to declare it here
declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}

// Create a typed proxy for the electronAPI
const electronAPI = window.electronAPI

export function getTodos(): Promise<Todo[]> {
  return electronAPI.getTodos()
}

export function createTodo(data: CreateTodoData): Promise<Todo> {
  return electronAPI.createTodo(data)
}

export function updateTodo(
  id: number,
  updates: UpdateTodoData,
): Promise<Todo> {
  return electronAPI.updateTodo(id, updates)
}

export function deleteTodo(id: number): Promise<void> {
  return electronAPI.deleteTodo(id)
}
