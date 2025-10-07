import { motion, AnimatePresence } from 'framer-motion';
import { Todo } from '@/lib/api';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Pencil, Trash, FileText } from 'lucide-react';

interface TodosListProps {
  todos: Todo[];
  onToggleComplete: (id: number, completed: boolean) => void;
  onDelete: (id: number) => void;
  onSelectTodo: (todo: Todo) => void;
}

export function TodosList({
  todos,
  onToggleComplete,
  onDelete,
  onSelectTodo,
}: TodosListProps) {

  const containerVariants = {
    hidden: { opacity: 1 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.07,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, x: -50, transition: { duration: 0.3 } },
  };

  return (
    <motion.ul
      layout
      className="space-y-3"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <AnimatePresence>
        {todos.length === 0 ? (
          <motion.li
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="text-center text-gray-500 py-4"
          >
            暂无待办事项。
          </motion.li>
        ) : (
          todos.map((todo) => (
            <motion.li
              key={todo.clientId}
              layoutId={todo.clientId}
              variants={itemVariants}
              exit="exit"
              layout="position"
              className="group flex items-center justify-between p-3 bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200"
            >
              <div
                className="flex items-center gap-3 flex-grow cursor-pointer"
                onClick={() => onSelectTodo(todo)}
              >
                <Checkbox
                  id={`todo-${todo.id}`}
                  checked={todo.completed}
                  onCheckedChange={(checked: boolean) => {
                    // Prevent modal from opening when clicking the checkbox
                    // e.stopPropagation();
                    onToggleComplete(todo.id, checked);
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className="h-5 w-5"
                />
                <span
                  className={`transition-colors ${
                    todo.completed ? 'text-gray-500 line-through' : 'text-gray-800'
                  }`}
                >
                  {todo.title}
                </span>
                {(todo.description || todo.dueDate) && (
                  <FileText className="h-4 w-4 text-gray-400" />
                )}
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent the li's onClick from firing
                    onSelectTodo(todo);
                  }}
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
    </motion.ul>
  );
}
