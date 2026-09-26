import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createTask, updateTask } from '../api/client';
import type { TaskInput } from '../api/client';
import type { Task } from '../types';
import { taskSchema } from '../schemas';
import type { TaskFormValues } from '../schemas';
import LoadingSpinner from './LoadingSpinner';
import FormField from './FormField';
import { inputClass } from './FormField/inputClass';

const buildDefaultValues = (task?: Task): TaskFormValues => ({
  title: task?.title ?? '',
  description: task?.description ?? '',
  priority: task?.priority ?? 'medium',
  status: task?.status ?? 'todo',
  due_date: task?.due_date ? task.due_date.slice(0, 10) : '',
});

interface TaskFormProps {
  task?: Task;
  onClose: () => void;
}

const TaskForm = ({ task, onClose }: TaskFormProps) => {
  const isEditMode = !!task;
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    mode: 'onTouched',
    defaultValues: buildDefaultValues(task),
  });

  const createMutation = useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      onClose();
    },
    onError: (err: any) => {
      setError('root', { message: err.response?.data?.message || 'Failed to create task' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<TaskInput>) => updateTask(task!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      onClose();
    },
    onError: (err: any) => {
      setError('root', { message: err.response?.data?.message || 'Failed to update task' });
    },
  });

  const mutation = isEditMode ? updateMutation : createMutation;

  const onSubmit = (data: TaskFormValues) => {
    const payload = { ...data, due_date: data.due_date || null };
    if (isEditMode) {
      updateMutation.mutate(payload);
    } else {
      createMutation.mutate(payload);
    }
  };

  return (
    <div className=" relative bg-white border border-[#E9E0CF] rounded-2xl p-5 mb-6">
      {/* + add relative above, + add spinner below */}
      {mutation.isPending && <LoadingSpinner asOverlay />}
      <h2 className="text-[#2B2418] font-bold mb-4">{isEditMode ? '✏️ Edit Task' : '➕ New Task'}</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <FormField label="Title *" error={errors.title}>
          <input type="text" placeholder="Task title..." {...register('title')} className={inputClass(!!errors.title)} />
        </FormField>
        <FormField label="Description" error={errors.description}>
          <textarea placeholder="Optional description..." rows={2} maxLength={5000}
            {...register('description')} className={`${inputClass(!!errors.description)} resize-none`} />
        </FormField>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <FormField label="Priority" error={errors.priority}>
            <select {...register('priority')} className={inputClass(!!errors.priority)}>
              <option value="low">🟢 Low</option>
              <option value="medium">🟡 Medium</option>
              <option value="high">🔴 High</option>
            </select>
          </FormField>
          <FormField label="Due Date" error={errors.due_date}>
            <input type="date" {...register('due_date')} className={inputClass(!!errors.due_date)} />
          </FormField>
        </div>
        {errors.root && <p className="text-red-600 text-xs">{errors.root.message}</p>}
        <div className="flex gap-2 pt-1">
          <button type="submit" disabled={isSubmitting || mutation.isPending}
            className="flex-1 bg-[#B8862E] hover:bg-[#9C7226] disabled:opacity-50
                       text-white font-bold py-2.5 rounded-xl transition-colors text-sm">
            {mutation.isPending
              ? (isEditMode ? 'Saving...' : 'Creating...')
              : (isEditMode ? 'Save Changes' : 'Create Task')}
          </button>
          <button type="button" onClick={onClose}
            className="flex-1 bg-[#F0EAD9] hover:bg-[#E9E0CF] text-[#6B5F4A]
                       font-bold py-2.5 rounded-xl transition-colors text-sm">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default TaskForm;
