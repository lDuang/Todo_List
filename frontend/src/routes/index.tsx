import { createFileRoute } from '@tanstack/react-router';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { getTodos, createTodo, updateTodo, deleteTodo, Todo, UpdateTodoData } from '@/lib/api';
import { TodosList } from '@/components/todos-list';
import { AddTodoForm } from '@/components/add-todo-form';
import { TodoDetailModal } from '@/components/todo-detail-modal';
import { nanoid } from 'nanoid';

interface TodoFormValues {
  title: string;
}

export const Route = createFileRoute('/')({
  component: Index,
});

function Index() {
  const queryClient = useQueryClient();
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);

  const { data: todos, isLoading, isError, error: queryError } = useQuery({
    queryKey: ['todos'],
    queryFn: getTodos,
  });

  const createTodoMutation = useMutation<
    Todo,
    Error,
    { title: string; clientId: string },
    { previousTodos?: Todo[]; optimisticTodo?: Todo }
  >({
    mutationFn: createTodo,
    onMutate: async ({ title, clientId }) => {
      await queryClient.cancelQueries({ queryKey: ['todos'] });
      const previousTodos = queryClient.getQueryData<Todo[]>(['todos']);

      const optimisticTodo: Todo = {
        clientId,
        id: Date.now(), // Temporary ID, won't be used for mutations
        title,
        completed: false,
        createdAt: new Date().toISOString(),
      };

      queryClient.setQueryData<Todo[]>(['todos'], (old) => [
        optimisticTodo,
        ...(old || []),
      ]);

      return { previousTodos, optimisticTodo };
    },
    onSuccess: (newTodo, _variables, context) => {
      queryClient.setQueryData<Todo[]>(
        ['todos'],
        (old) =>
          old?.map((todo) =>
            todo.clientId === context?.optimisticTodo?.clientId
              ? newTodo
              : todo
          ) ?? []
      );
    },
    onError: (err, variables, context) => {
      if (context?.previousTodos) {
        queryClient.setQueryData<Todo[]>(['todos'], context.previousTodos);
      }
      toast.error(`创建任务 "${variables.title}" 失败: ${err.message}`);
    },
  });

  const updateTodoMutation = useMutation<
    Todo,
    Error,
    { id: number; updates: Partial<Todo> },
    { previousTodos?: Todo[] }
  >({
    mutationFn: ({ id, updates }) => updateTodo(id, updates),
    onMutate: async ({ id, updates }) => {
      await queryClient.cancelQueries({ queryKey: ['todos'] });
      const previousTodos = queryClient.getQueryData<Todo[]>(['todos']);
      queryClient.setQueryData<Todo[]>(['todos'], (old) =>
        old?.map((todo) =>
          todo.id === id ? { ...todo, ...updates } : todo
        ) ?? []
      );
      return { previousTodos };
    },
    onError: (err, variables, context) => {
      if (context?.previousTodos) {
        queryClient.setQueryData<Todo[]>(['todos'], context.previousTodos);
      }
      const action = variables.updates.title ? '更新' : '切换';
      toast.error(`${action}任务失败: ${err.message}`);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });

  const deleteTodoMutation = useMutation<
    void,
    Error,
    number,
    { previousTodos?: Todo[] }
  >({
    mutationFn: deleteTodo,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['todos'] });
      const previousTodos = queryClient.getQueryData<Todo[]>(['todos']);
      queryClient.setQueryData<Todo[]>(['todos'], (old) =>
        old?.filter((todo) => todo.id !== id) ?? []
      );
      return { previousTodos };
    },
    onError: (err, _variables, context) => {
      if (context?.previousTodos) {
        queryClient.setQueryData<Todo[]>(['todos'], context.previousTodos);
      }
      toast.error(`删除任务失败: ${err.message}`);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });

  const onSubmit = (values: TodoFormValues, form: any) => {
    createTodoMutation.mutate({ title: values.title, clientId: nanoid() });
    form.reset();
  };

  const handleToggleComplete = (id: number, completed: boolean) => {
    updateTodoMutation.mutate({ id, updates: { completed } });
  };

  const handleDelete = (id: number) => {
    deleteTodoMutation.mutate(id);
  };

  const handleOpenEditModal = (todo: Todo) => {
    setEditingTodo(todo);
  };

  const handleCloseEditModal = () => {
    setEditingTodo(null);
  };

  const handleSaveEdit = (id: number, updates: UpdateTodoData) => {
    updateTodoMutation.mutate({ id, updates });
    handleCloseEditModal();
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
                onSelectTodo={handleOpenEditModal}
                />
            )}
            
        </div>

        <TodoDetailModal
          isOpen={!!editingTodo}
          todo={editingTodo}
          onClose={handleCloseEditModal}
          onSave={handleSaveEdit}
        />
    </div>
  );
}
