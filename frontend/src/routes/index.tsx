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

  const { data: todos, isLoading, isError } = useQuery({
    queryKey: ['todos'],
    queryFn: getTodos,
  });

  const createTodoMutation = useMutation<
    Todo,
    Error,
    { title: string; clientId: string; dueDate: string },
    { previousTodos?: Todo[]; optimisticTodo?: Todo }
  >({
    mutationFn: createTodo,
    onMutate: async ({ title, clientId, dueDate }) => {
      await queryClient.cancelQueries({ queryKey: ['todos'] });
      const previousTodos = queryClient.getQueryData<Todo[]>(['todos']);

      const optimisticTodo: Todo = {
        clientId,
        id: Date.now(),
        title,
        completed: false,
        createdAt: new Date().toISOString(),
        dueDate,
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
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;

    createTodoMutation.mutate(
      {
        title: values.title,
        clientId: nanoid(),
        dueDate: formattedDate,
      },
      {
        onSuccess: () => {
          form.reset();
        },
      }
    );
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
    <div className="min-h-screen bg-[#eef2f7]">
      <div className="mx-auto flex min-h-screen max-w-3xl flex-col items-center px-6 py-16 sm:px-8">
        <header className="w-full text-center">
          <h1 className="text-[40px] font-semibold tracking-tight text-slate-900">
            今日任务
          </h1>
        </header>

        <div className="mt-10 flex w-full flex-col items-center gap-6">
          <AddTodoForm
            onSubmit={onSubmit}
            isPending={createTodoMutation.isPending}
            className="w-full"
          />

          <div className="w-full">
            {isLoading ? (
              <div className="rounded-[18px] border border-slate-200/70 bg-white/80 py-10 text-center text-slate-400">
                加载中
              </div>
            ) : isError ? (
              <div className="rounded-[18px] border border-slate-200/70 bg-white/80 py-10 text-center text-rose-500">
                加载失败
              </div>
            ) : (
              <TodosList
                todos={todos || []}
                onToggleComplete={handleToggleComplete}
                onDelete={handleDelete}
                onSelectTodo={handleOpenEditModal}
              />
            )}
          </div>
        </div>

        <TodoDetailModal
          isOpen={!!editingTodo}
          todo={editingTodo}
          onClose={handleCloseEditModal}
          onSave={handleSaveEdit}
        />
      </div>
    </div>
  );
}
