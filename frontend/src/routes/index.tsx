import { useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTodos, createTodo, updateTodo, deleteTodo, Todo } from '@/lib/api';
import { TodosList } from '@/components/todos-list';
import { AddTodoForm } from '@/components/add-todo-form';

interface TodoFormValues {
  title: string;
}

export const Route = createFileRoute('/')({
  component: Index,
});

function Index() {
  const queryClient = useQueryClient();

  const { data: todos, isLoading, isError, error: queryError } = useQuery<Todo[]>({
    queryKey: ['todos'],
    queryFn: getTodos,
  });

  const [apiError, setApiError] = useState<string | null>(null);

  const mutationOptions = {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      setApiError(null);
    },
    onError: async (error: unknown) => {
      let errorMessage = '操作失败，请稍后重试。';
      if (error instanceof Response) {
        try {
          const errorData = await error.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (e) {
          // JSON parsing failed
        }
      }
      setApiError(errorMessage);
    },
  };

  const createTodoMutation = useMutation<Todo, Error, string>({
    mutationFn: createTodo,
    ...mutationOptions,
  });

  const updateTodoMutation = useMutation({
    mutationFn: ({ id, updates }: { id: number; updates: Partial<Todo> }) => updateTodo(id, updates),
    ...mutationOptions,
  });

  const deleteTodoMutation = useMutation({
    mutationFn: deleteTodo,
    ...mutationOptions,
  });

  const onSubmit = async (values: TodoFormValues, form: any) => {
    await queryClient.cancelQueries({ queryKey: ['todos'] });

    const previousTodos = queryClient.getQueryData<Todo[]>(['todos']);

    queryClient.setQueryData<Todo[]>(['todos'], (old) => [
      ...(old || []),
      {
        id: Date.now(),
        title: values.title,
        completed: false,
        createdAt: new Date().toISOString(),
      },
    ]);

    form.reset();

    try {
      await createTodoMutation.mutateAsync(values.title);
    } catch (err) {
      queryClient.setQueryData(['todos'], previousTodos);
    }
  };

  const handleToggleComplete = async (id: number, completed: boolean) => {
    await queryClient.cancelQueries({ queryKey: ['todos'] });

    const previousTodos = queryClient.getQueryData<Todo[]>(['todos']);

    queryClient.setQueryData<Todo[]>(['todos'], (old) =>
      old?.map((todo) => (todo.id === id ? { ...todo, completed } : todo))
    );

    try {
      await updateTodoMutation.mutateAsync({ id, updates: { completed } });
    } catch (err) {
      queryClient.setQueryData(['todos'], previousTodos);
    }
  };

  const handleDelete = async (id: number) => {
    await queryClient.cancelQueries({ queryKey: ['todos'] });

    const previousTodos = queryClient.getQueryData<Todo[]>(['todos']);

    queryClient.setQueryData<Todo[]>(['todos'], (old) =>
      old?.filter((todo) => todo.id !== id)
    );

    try {
      await deleteTodoMutation.mutateAsync(id);
    } catch (err) {
      queryClient.setQueryData(['todos'], previousTodos);
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
            
            {apiError && (
                <p className="text-sm text-red-500 mt-4 text-center">{apiError}</p>
            )}
        </div>
    </div>
  );
}
