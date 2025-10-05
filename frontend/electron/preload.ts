import { contextBridge, ipcRenderer } from 'electron'
import type { CreateTodoData, UpdateTodoData } from './types'

contextBridge.exposeInMainWorld('electronAPI', {
  getTodos: () => ipcRenderer.invoke('get-todos'),
  createTodo: (data: CreateTodoData) => ipcRenderer.invoke('create-todo', data),
  updateTodo: (id: number, updates: UpdateTodoData) =>
    ipcRenderer.invoke('update-todo', id, updates),
  deleteTodo: (id: number) => ipcRenderer.invoke('delete-todo', id),
})
