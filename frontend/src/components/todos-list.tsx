import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Todo } from '@/lib/api';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Pencil, Trash } from 'lucide-react';

interface TodosListProps {
  todos: Todo[];
  onToggleComplete: (id: number, completed: boolean) => void;
  onDelete: (id: number) => void;
  onEdit: (id: number, newTitle: string) => void;
}

export function TodosList({ todos, onToggleComplete, onDelete, onEdit }: TodosListProps) {
  const [editingTodoId, setEditingTodoId] = useState<number | null>(null);
  const [editingTitle, setEditingTitle] = useState<string>('');

  const handleEditClick = (todo: Todo) => {
    setEditingTodoId(todo.id);
    setEditingTitle(todo.title);
  };

  const handleSaveEdit = (id: number) => {
    if (editingTitle.trim() !== '') {
      onEdit(id, editingTitle);
    }
    setEditingTodoId(null);
    setEditingTitle('');
  };

  const handleCancelEdit = () => {
    setEditingTodoId(null);
    setEditingTitle('');
  };

  return (
    <ul className="space-y-3">
      <AnimatePresence>
        {todos.length === 0 ? (
          <motion.li
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-center text-gray-500 py-4"
          >
            暂无待办事项。
          </motion.li>
        ) : (
          todos.map((todo) => (
            <motion.li
              key={todo.id}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -50, transition: { duration: 0.3 } }}
              layout
              className="group flex items-center justify-between p-3 bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex items-center gap-3">
                <Checkbox
                  id={`todo-${todo.id}`}
                  checked={todo.completed}
                  onCheckedChange={(checked: boolean) => onToggleComplete(todo.id, checked)}
                  className="h-5 w-5"
                />
                {editingTodoId === todo.id ? (
                  <Input
                    value={editingTitle}
                    onChange={(e) => setEditingTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveEdit(todo.id);
                      if (e.key === 'Escape') handleCancelEdit();
                    }}
                    onBlur={() => handleSaveEdit(todo.id)}
                    className="p-0 border-none focus:ring-0 bg-transparent h-auto text-base"
                    autoFocus
                  />
                ) : (
                  <label
                    htmlFor={`todo-${todo.id}`}
                    className={`cursor-pointer transition-colors ${
                      todo.completed ? 'text-gray-500 line-through' : 'text-gray-800'
                    }`}
                  >
                    {todo.title}
                  </label>
                )}
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleEditClick(todo)}
                  className="h-8 w-8 text-gray-400 hover:text-blue-500 hover:bg-blue-50"
                >
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(todo.id)}
                  className="h-8 w-8 text-gray-400 hover:text-red-500 hover:bg-red-50"
                >
                  <Trash className="w-4 h-4" />
                </Button>
              </div>
            </motion.li>
          ))
        )}
      </AnimatePresence>
    </ul>
  );
}
