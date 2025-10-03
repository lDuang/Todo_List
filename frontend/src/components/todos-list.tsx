import { Todo } from '@/lib/api';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

interface TodosListProps {
  todos: Todo[];
  onToggleComplete: (id: number, completed: boolean) => void;
  onDelete: (id: number) => void;
}

export function TodosList({ todos, onToggleComplete, onDelete }: TodosListProps) {
  return (
    <div className="space-y-4">
      {todos.length === 0 ? (
        <p className="text-center text-slate-500 text-xl py-6">暂无待办事项，请在上方添加！</p>
      ) : (
        todos.map((todo) => (
               <div
                 key={todo.id}
                 className={`flex items-center py-6 px-8 bg-white rounded-2xl shadow-sm ${
                   todo.completed ? 'opacity-60 text-slate-500' : 'text-slate-800'
                 } transition-all duration-200`}
               >
                 <Checkbox
                   id={`todo-${todo.id}`}
                   checked={todo.completed}
                   onCheckedChange={(checked: boolean) => onToggleComplete(todo.id, checked)}
                   className="mr-6 h-8 w-8 border-slate-400 data-[state=checked]:bg-slate-700 data-[state=checked]:text-white flex-shrink-0"
                 />
                 <label
                   htmlFor={`todo-${todo.id}`}
                   className={`flex-1 text-3xl font-medium break-words ${
                     todo.completed ? 'line-through' : ''
                   }`}
                 >
                   {todo.title}
                 </label>
                 <Button variant="ghost" size="icon" onClick={() => onDelete(todo.id)} className="ml-6 flex-shrink-0">
                   <Trash2 className="h-8 w-8 text-slate-500 hover:text-red-600 transition-colors duration-200" />
                 </Button>
               </div>
        ))
      )}
    </div>
  );
}
