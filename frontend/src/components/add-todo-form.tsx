import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';

const todoFormSchema = z.object({
  title: z.string().min(1, '任务描述不能为空。'),
});

type TodoFormValues = z.infer<typeof todoFormSchema>;

interface AddTodoFormProps {
  onSubmit: (values: TodoFormValues, form: any) => void;
  isPending: boolean;
}

export function AddTodoForm({ onSubmit, isPending }: AddTodoFormProps) {
  const form = useForm<TodoFormValues>({
    resolver: zodResolver(todoFormSchema),
    defaultValues: {
      title: '',
    },
  });

  const handleSubmit = (values: TodoFormValues) => {
    onSubmit(values, form);
  };

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="mb-6">
      <Input
        {...form.register('title')}
        placeholder="添加新任务，按回车键确认"
        className="h-12 text-lg"
        disabled={isPending}
      />
      {form.formState.errors.title && (
        <p className="text-sm text-red-500 mt-1">{form.formState.errors.title.message}</p>
      )}
    </form>
  );
}
