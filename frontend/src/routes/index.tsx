import { createFileRoute } from '@tanstack/react-router';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTodos, createTodo, updateTodo, deleteTodo, Todo } from '@/lib/api';
import { TodosList } from '@/components/todos-list';
import { AddTodoForm } from '@/components/add-todo-form';
import { nanoid } from 'nanoid';

// Create a client-side specific type that includes our stable clientId
export type ClientTodo = Todo & { clientId: string };

interface TodoFormValues {
  title: string;
}

export const Route = createFileRoute('/')({
  component: Index,
});

function Index() {
  const queryClient = useQueryClient();

  const { data: todos, isLoading, isError, error: queryError } = useQuery({
    queryKey: ['todos'],
    queryFn: getTodos,
    // Use the select option to transform the server data and add a clientId
    select: (data): ClientTodo[] => data.map(todo => ({ ...todo, clientId: nanoid() })),
  });

  const createTodoMutation = useMutation<Todo, Error, string, { previousTodos?: ClientTodo[] }>({
    mutationFn: createTodo,
    onMutate: async (title) => {
      await queryClient.cancelQueries({ queryKey: ['todos'] });
      const previousTodos = queryClient.getQueryData<ClientTodo[]>(['todos']);

      const optimisticTodo: ClientTodo = {
        clientId: nanoid(),
        id: Date.now(), // Still use a temp numeric ID for now, but it won't be the key
        title,
        completed: false,
        createdAt: new Date().toISOString(),
      };

      queryClient.setQueryData<ClientTodo[]>(['todos'], (old) => [
        optimisticTodo,
        ...(old || []),
      ]);

      return { previousTodos };
    },
    onSuccess: (newTodo, variables, context) => {
      queryClient.setQueryData<ClientTodo[]>(['todos'], (old) => {
        return old?.map((todo) => {
          // Find the optimistic todo by its clientId and replace it with the real data from the server
          if (context && 'optimisticTodo' in context && todo.clientId === (context.optimisticTodo as any).clientId) {
            return { ...newTodo, clientId: (context.optimisticTodo as any).clientId };
          }
          return todo;
        }) ?? [];
      });
    },
    onError: (err, variables, context) => {
      if (context?.previousTodos) {
        queryClient.setQueryData<ClientTodo[]>(['todos'], context.previousTodos);
      }
      toast.error(`创建任务 "${variables}" 失败: ${err.message}`);
    },
  });

  const mutationOptions = {
    onError: (error: unknown) => {
      let errorMessage = '操作失败，请稍后重试。';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      toast.error(errorMessage);
    },
  };

  const updateTodoMutation = useMutation({
    mutationFn: ({ id, updates }: { id: number; updates: Partial<Todo> }) => updateTodo(id, updates),
    ...mutationOptions,
  });

  const deleteTodoMutation = useMutation({
    mutationFn: deleteTodo,
    ...mutationOptions,
  });

  const onSubmit = (values: TodoFormValues, form: any) => {
    createTodoMutation.mutate(values.title);
    form.reset();
  };

  const handleToggleComplete = async (id: number, completed: boolean) => {
    await queryClient.cancelQueries({ queryKey: ['todos'] });

    const previousTodos = queryClient.getQueryData<ClientTodo[]>(['todos']);

    queryClient.setQueryData<ClientTodo[]>(['todos'], (old) =>
      old?.map((todo) => (todo.id === id ? { ...todo, completed } : todo))
    );

    try {
      await updateTodoMutation.mutateAsync({ id, updates: { completed } });
    } catch (err) {
      queryClient.setQueryData<ClientTodo[]>(['todos'], previousTodos);
      const todoTitle = previousTodos?.find(t => t.id === id)?.title || '';
      if (err instanceof Error) {
        toast.error(`更新任务 "${todoTitle}" 失败: ${err.message}`);
      } else {
        toast.error(`更新任务 "${todoTitle}" 失败`);
      }
    }
  };

  const handleDelete = async (id: number) => {
    await queryClient.cancelQueries({ queryKey: ['todos'] });

    const previousTodos = queryClient.getQueryData<ClientTodo[]>(['todos']);

    queryClient.setQueryData<ClientTodo[]>(['todos'], (old) =>
      old?.filter((todo) => todo.id !== id)
    );

    try {
      await deleteTodoMutation.mutateAsync(id);
    } catch (err) {
      queryClient.setQueryData<ClientTodo[]>(['todos'], previousTodos);
      const todoTitle = previousTodos?.find(t => t.id === id)?.title || '';
      if (err instanceof Error) {
        toast.error(`删除任务 "${todoTitle}" 失败: ${err.message}`);
      } else {
        toast.error(`删除任务 "${todoTitle}" 失败`);
      }
    }
  };

  const handleEdit = (id: number, newTitle: string) => {
    updateTodoMutation.mutate({ id, updates: { title: newTitle } });
  };

  return (
    <div className="container mx-auto max-w-5xl px-4 py-12">
        <h1 className="text-4xl font-bold text-gray-800 text-center mb-8">今日任务</h1>

        <div className="max-w-2xl mx-auto">
            <AddTodoForm onSubmit={onSubmit} isPending={createTodoMutation.isPending} />

            {isLoading ? (
                <div className="text-center text-gray-500 py-4">加载中...</div>
            ) : isError ? (
                <div className="text-center text-red-500 py-4">加载任务失败: {queryError?.message}</div>
            ) : (
                <TodosList
                todos={todos || []}
                onToggleComplete={handleToggleComplete}
                onDelete={handleDelete}
                onEdit={handleEdit}
                />
            )}
            
        </div>
    </div>
  );
}
