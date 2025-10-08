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
import { Label } from '@/components/ui/label';
import type { Todo, UpdateTodoData } from '../../electron/types';

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

const detailFormSchema = z.object({
  title: z.string().min(1, '标题不能为空'),
  description: z.string().optional().default(''),
  dueDate: z
    .string()
    .optional()
    .refine((value) => {
      if (!value) return true;
      if (!dateRegex.test(value)) return false;
      const [year, month, day] = value.split('-').map(Number);
      const date = new Date(year, month - 1, day);
      return (
        date.getFullYear() === year &&
        date.getMonth() === month - 1 &&
        date.getDate() === day
      );
    }, '请输入一个有效的日期 (YYYY-MM-DD)'),
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

export function TodoDetailModal({
  todo,
  isOpen,
  onClose,
  onSave,
}: TodoDetailModalProps) {
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
      <DialogContent className="max-w-xl rounded-[24px] border border-slate-200/70 bg-white/95 p-8 shadow-[0_40px_110px_-45px_rgba(15,23,42,0.55)]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold text-slate-900">
            编辑任务
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={form.handleSubmit(handleValidSubmit, handleInvalidSubmit)}
          className="mt-6 space-y-5"
        >
          <div className="space-y-2">
            <Label htmlFor="title">任务标题</Label>
            <Input
              id="title"
              placeholder="标题"
              {...form.register('title')}
              className="h-12 rounded-[18px] border border-slate-200 bg-white/90 text-base text-slate-800 shadow-sm focus-visible:border-indigo-400 focus-visible:ring-2 focus-visible:ring-indigo-100 focus-visible:ring-offset-0"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">描述</Label>
            <Textarea
              id="description"
              placeholder="补充细节..."
              {...form.register('description')}
              className="min-h-[140px] resize-none rounded-[18px] border border-slate-200 bg-white/90 p-4 text-base text-slate-700 shadow-sm focus-visible:border-indigo-400 focus-visible:ring-2 focus-visible:ring-indigo-100 focus-visible:ring-offset-0"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dueDate">到期日</Label>
            <Controller
              name="dueDate"
              control={form.control}
              render={({ field }) => (
                <Input
                  id="dueDate"
                  placeholder="YYYY-MM-DD"
                  value={field.value ?? ''}
                  onChange={(event) => {
                    const formattedValue = formatDueDateInput(event.target.value);
                    field.onChange(formattedValue);
                  }}
                  className="h-12 rounded-[18px] border border-slate-200 bg-white/90 text-sm text-slate-700 focus-visible:border-indigo-400 focus-visible:ring-2 focus-visible:ring-indigo-100 focus-visible:ring-offset-0"
                  maxLength={10}
                />
              )}
            />
          </div>

          <DialogFooter className="pt-4">
            <DialogClose asChild>
              <Button
                type="button"
                variant="ghost"
                className="h-11 rounded-[18px] px-6 text-slate-500 hover:bg-slate-100"
              >
                取消
              </Button>
            </DialogClose>
            <Button
              type="submit"
              className="h-11 rounded-[18px] bg-slate-900 px-8 text-sm font-medium text-white hover:bg-slate-800"
            >
              保存
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
