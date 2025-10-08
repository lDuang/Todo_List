import { motion, AnimatePresence } from 'framer-motion';
import { Todo } from '@/lib/api';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { CalendarDays, Pencil, Trash } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TodosListProps {
  todos: Todo[];
  onToggleComplete: (id: number, completed: boolean) => void;
  onDelete: (id: number) => void;
  onSelectTodo: (todo: Todo) => void;
}

const containerVariants = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: -12 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, x: -40, transition: { duration: 0.25 } },
};

const formatDueDate = (value?: string) => {
  if (!value) return null;
  try {
    const [year, month, day] = value.split('-').map(Number);
    const date = new Date(year, (month ?? 1) - 1, day ?? 1);
    if (Number.isNaN(date.getTime())) return value;
    return new Intl.DateTimeFormat('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(date);
  } catch {
    return value;
  }
};

export function TodosList({
  todos,
  onToggleComplete,
  onDelete,
  onSelectTodo,
}: TodosListProps) {
  return (
    <motion.ul
      layout
      className="flex flex-col gap-3"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <AnimatePresence>
        {todos.length === 0 ? (
          <motion.li
            key="empty-state"
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="rounded-[16px] border border-dashed border-slate-200/80 bg-white/80 py-10 text-center text-slate-400"
          >
            暂无任务
          </motion.li>
        ) : (
          todos.map((todo) => {
            const hasDescription = Boolean(todo.description?.trim());
            const formattedDueDate = formatDueDate(todo.dueDate);
            const isCompleted = todo.completed;

            return (
              <motion.li
                key={todo.clientId}
                layoutId={todo.clientId}
                variants={itemVariants}
                exit="exit"
                layout="position"
                className={cn(
                  'flex items-start gap-4 rounded-[16px] border border-slate-200 bg-white px-5 py-4 shadow-sm transition hover:border-indigo-200 hover:shadow-md',
                  isCompleted && 'bg-slate-100/90'
                )}
                onClick={() => onSelectTodo(todo)}
              >
                <Checkbox
                  id={`todo-${todo.id}`}
                  checked={todo.completed}
                  onCheckedChange={(checked: boolean) => {
                    onToggleComplete(todo.id, checked);
                  }}
                  onClick={(event) => event.stopPropagation()}
                  className="mt-1 h-5 w-5 rounded-[10px] border-slate-300 data-[state=checked]:border-indigo-400 data-[state=checked]:bg-indigo-400"
                />

                <div className="flex flex-1 flex-col gap-1">
                  <span
                    className={cn(
                      'text-base font-medium transition-colors',
                      isCompleted ? 'text-slate-500 line-through' : 'text-slate-800'
                    )}
                  >
                    {todo.title}
                  </span>
                  {hasDescription ? (
                    <span
                      className={cn(
                        'text-sm leading-relaxed',
                        isCompleted ? 'text-slate-400' : 'text-slate-500'
                      )}
                    >
                      {todo.description}
                    </span>
                  ) : null}
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      'inline-flex min-w-[96px] items-center justify-center gap-1 rounded-full px-3 py-1 text-xs font-medium',
                      formattedDueDate
                        ? 'bg-indigo-50 text-indigo-500'
                        : 'bg-slate-200/60 text-slate-500'
                    )}
                  >
                    <CalendarDays className="h-3.5 w-3.5" />
                    {formattedDueDate ?? '未设置'}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(event) => {
                      event.stopPropagation();
                      onSelectTodo(todo);
                    }}
                    className="h-8 w-8 rounded-[12px] text-slate-400 hover:bg-slate-100 hover:text-indigo-500"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(event) => {
                      event.stopPropagation();
                      onDelete(todo.id);
                    }}
                    className="h-8 w-8 rounded-[12px] text-slate-400 hover:bg-slate-100 hover:text-rose-500"
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </motion.li>
            );
          })
        )}
      </AnimatePresence>
    </motion.ul>
  );
}
