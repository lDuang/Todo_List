import { createFileRoute } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTodos, createTodo, updateTodo, deleteTodo, Todo } from '@/lib/api';
import { TodosList } from '@/components/todos-list';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const todoFormSchema = z.object({
  title: z.string().min(1, '标题不能为空'),
});

type TodoFormValues = z.infer<typeof todoFormSchema>;

export const Route = createFileRoute('/')({
  component: Index,
});

function Index() {
  const queryClient = useQueryClient();

  const { data: todos, isLoading, isError } = useQuery<Todo[]>({
    queryKey: ['todos'],
    queryFn: getTodos,
  });

  const createTodoMutation = useMutation({
    mutationFn: createTodo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      form.reset();
    },
  });

  const updateTodoMutation = useMutation({
    mutationFn: ({ id, updates }: { id: number; updates: Partial<Todo> }) => updateTodo(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });

  const deleteTodoMutation = useMutation({
    mutationFn: deleteTodo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });

  const form = useForm<TodoFormValues>({
    resolver: zodResolver(todoFormSchema),
    defaultValues: {
      title: '',
    },
  });

  const onSubmit = (values: TodoFormValues) => {
    createTodoMutation.mutate(values.title);
  };

  const handleToggleComplete = (id: number, completed: boolean) => {
    updateTodoMutation.mutate({ id, updates: { completed } });
  };

  const handleDelete = (id: number) => {
    deleteTodoMutation.mutate(id);
  };

  if (isLoading) return <div className="text-center p-4 text-2xl font-semibold text-gray-700">加载待办事项中...</div>;
  if (isError) return <div className="text-center p-4 text-2xl font-semibold text-red-600">加载待办事项失败。</div>;

  return (
    <div className="flex flex-col items-center w-full">
      <div className="w-full mb-20">
             <h1 className="text-8xl font-extrabold text-center text-slate-800 tracking-tight leading-none mb-20">
               待办事项清单
             </h1>
           </div>
           <div className="w-full mb-24 flex flex-col items-center">
             <form onSubmit={form.handleSubmit(onSubmit)} className="flex w-2/3 space-x-6">
               <Input
                 {...form.register('title')}
                 placeholder="添加新的待办事项..."
                 className="flex-1 border-slate-300 focus:ring-2 focus:ring-slate-400 text-slate-700 text-3xl py-6 px-8 rounded-2xl shadow-sm"
                 disabled={createTodoMutation.isPending}
               />
               <Button
                 type="submit"
                 disabled={createTodoMutation.isPending}
                 className="bg-slate-800 hover:bg-slate-900 text-white font-bold text-3xl py-6 px-12 rounded-2xl transition-transform transform hover:scale-105 shadow-sm"
               >
                 {createTodoMutation.isPending ? '添加中...' : '添加'}
               </Button>
             </form>
             {form.formState.errors.title && (
               <p className="text-red-500 text-2xl mt-8 text-center">{form.formState.errors.title.message}</p>
             )}
           </div>
           <div className="w-2/3">
             <TodosList
               todos={todos || []}
               onToggleComplete={handleToggleComplete}
               onDelete={handleDelete}
             />
           </div>
         </div>
  );
}
