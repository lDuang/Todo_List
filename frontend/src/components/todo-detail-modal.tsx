import * as React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { Todo, UpdateTodoData } from '../../electron/types';

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

const detailFormSchema = z.object({
  title: z.string().min(1, '标题不能为空'),
  description: z.string().optional().default(''),
  dueDate: z.string()
    .optional()
    .refine((val) => {
      if (!val) return true; // Allow empty string
      if (!dateRegex.test(val)) return false; // Test format first
      const [year, month, day] = val.split('-').map(Number);
      const date = new Date(year, month - 1, day);
      // Check if the created date is valid and matches the input
      return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
    }, {
      message: "请输入一个有效的日期 (YYYY-MM-DD)",
    }),
});

type DetailFormValues = z.infer<typeof detailFormSchema>;

const formatDueDateInput = (value: string) => {
  const digitsOnly = value.replace(/\D/g, '').slice(0, 8);
  const year = digitsOnly.slice(0, 4);
  const month = digitsOnly.slice(4, 6);
  const day = digitsOnly.slice(6, 8);

  return [year, month, day].filter(Boolean).join('-');
};

interface TodoDetailModalProps {
  todo: Todo | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: number, data: UpdateTodoData) => void;
}

export function TodoDetailModal({ todo, isOpen, onClose, onSave }: TodoDetailModalProps) {
  const form = useForm<DetailFormValues>({
    resolver: zodResolver(detailFormSchema),
  });

  React.useEffect(() => {
    if (todo) {
      form.reset({
        title: todo.title,
        description: todo.description || '',
        dueDate: todo.dueDate || '',
      });
    }
  }, [todo, form]);

  const handleValidSubmit = (values: DetailFormValues) => {
    if (todo) {
      const dataToSave: UpdateTodoData = {
        ...values,
        dueDate: values.dueDate || undefined,
      };
      onSave(todo.id, dataToSave);
    }
  };

  const handleInvalidSubmit = (errors: any) => {
    Object.values(errors).forEach((error: any) => {
      if (error.message) {
        toast.error(error.message);
      }
    });
  };

  if (!todo) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-1/3 min-w-[512px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">编辑任务</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(handleValidSubmit, handleInvalidSubmit)} className="space-y-4">
          <div>
              <Input
                id="title"
                placeholder="任务标题"
                {...form.register('title')}
                className="p-4 text-base focus-visible:ring-0 focus-visible:ring-offset-0"
              />
          </div>
          <div>
              <Textarea
                id="description"
                placeholder="添加描述..."
                {...form.register('description')}
                className="min-h-[120px] resize-none p-4 text-base focus-visible:ring-0 focus-visible:ring-offset-0"
              />
          </div>
          <div>
              <Controller
                name="dueDate"
                control={form.control}
                render={({ field }) => (
                  <Input
                    id="dueDate"
                    placeholder="到期日 (YYYY-MM-DD)"
                    value={field.value ?? ''}
                    onChange={(event) => {
                      const formattedValue = formatDueDateInput(event.target.value);
                      field.onChange(formattedValue);
                    }}
                    className="p-4 text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
                    maxLength={10}
                  />
                )}
              />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="ghost">取消</Button>
            </DialogClose>
            <Button type="submit">保存</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
