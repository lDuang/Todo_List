import { useForm } from 'react-hook-form';
import * as React from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const todoFormSchema = z.object({
  title: z.preprocess(
    (val) => String(val).trim(),
    z
      .string()
      .min(1, '任务描述不能为空或仅包含空格。')
      .max(100, '任务描述不能超过100个字符。')
  ),
});

type TodoFormValues = z.infer<typeof todoFormSchema>;

interface AddTodoFormProps {
  onSubmit: (values: TodoFormValues, form: any) => void;
  isPending: boolean;
}

export function AddTodoForm({ onSubmit }: AddTodoFormProps) {
  const form = useForm<TodoFormValues>({
    resolver: zodResolver(todoFormSchema),
    defaultValues: {
      title: '',
    },
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
  });

  const titleValue = form.watch('title');

  React.useEffect(() => {
    if (titleValue === '' && form.formState.errors.title) {
      form.clearErrors('title');
    }
  }, [titleValue, form.formState.errors.title, form]);


  const handleValidSubmit = (values: TodoFormValues) => {
    onSubmit(values, form);
  };

  const handleInvalidSubmit = (errors: any) => {
    if (errors.title) {
      toast.error(errors.title.message);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(handleValidSubmit, handleInvalidSubmit)} className="mb-6">
      <Input
        {...form.register('title')}
        placeholder="添加新任务，按回车键确认"
        className="h-12 text-lg focus-visible:ring-0 focus-visible:ring-offset-0"
      />
    </form>
  );
}
