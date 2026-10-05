import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateTask, deleteTask } from '../api/client';
import type { Task, TaskStatus } from '../types';

export function useTaskActions() {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['tasks'] });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Task> }) => updateTask(id, data),
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteTask(id),
    onSuccess: invalidate,
  });

  const changeStatus = (id: number, status: TaskStatus) =>
    updateMutation.mutate({ id, data: { status } });

  return { updateMutation, deleteMutation, changeStatus };
}
