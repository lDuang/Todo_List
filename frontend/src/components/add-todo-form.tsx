import { useForm } from 'react-hook-form';
import * as React from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
// import { Plus } from 'lucide-react';

const todoFormSchema = z.object({
  title: z.preprocess(
    (val) => String(val).trim(),
    z
      .string()
      .min(1, '任务描述不能为空或仅包含空格')
      .max(100, '任务描述不能超过 100 个字符')
  ),
});

type TodoFormValues = z.infer<typeof todoFormSchema>;

interface AddTodoFormProps {
  onSubmit: (values: TodoFormValues, form: any) => void;
  isPending: boolean;
  className?: string;
}

export function AddTodoForm({ onSubmit, isPending, className }: AddTodoFormProps) {
  const inputRef = React.useRef<HTMLInputElement | null>(null);

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
    requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  };

  const handleInvalidSubmit = (errors: any) => {
    if (errors.title) {
      toast.error(errors.title.message);
    }
  };

  return (
    <form
      onSubmit={form.handleSubmit(handleValidSubmit, handleInvalidSubmit)}
      className={cn('relative w-full max-w-2xl', className)}
    >
      {(() => {
        const { ref: registerRef, ...fieldProps } = form.register('title');
        return (
        <Input
            {...fieldProps}
            ref={(element) => {
              registerRef(element);
              inputRef.current = element;
            }}
            placeholder="记录任务..."
            className="h-14 w-full rounded-[18px] border border-slate-200 bg-white/95 px-6 text-base text-slate-800 shadow-sm transition focus-visible:border-indigo-400 focus-visible:ring-2 focus-visible:ring-indigo-100 focus-visible:ring-offset-0"
            disabled={isPending}
          />
        );
      })()}
    </form>
  );
}
