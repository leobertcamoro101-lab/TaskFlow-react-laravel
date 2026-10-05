import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { UseFormSetError } from 'react-hook-form';
import { createTask, updateTask } from '../api/client';
import type { TaskInput } from '../api/client';
import type { Task } from '../types';
import type { TaskFormValues } from '../schemas';

export function useTaskMutation(
  task: Task | undefined,
  onClose: () => void,
  setError: UseFormSetError<TaskFormValues>
) {
  const isEditMode = !!task;
  const queryClient = useQueryClient();

  const onSettled = () => queryClient.invalidateQueries({ queryKey: ['tasks'] });

  const createMutation = useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      onSettled();
      onClose();
    },
    onError: (err: any) => {
      setError('root', { message: err.response?.data?.message || 'Failed to create task' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<TaskInput>) => updateTask(task!.id, data),
    onSuccess: () => {
      onSettled();
      onClose();
    },
    onError: (err: any) => {
      setError('root', { message: err.response?.data?.message || 'Failed to update task' });
    },
  });

  const mutation = isEditMode ? updateMutation : createMutation;

  const submit = (data: TaskFormValues) => {
    const payload = { ...data, due_date: data.due_date || null };
    mutation.mutate(payload);
  };

  return { mutation, submit, isEditMode };
}
