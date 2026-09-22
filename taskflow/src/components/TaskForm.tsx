import { useState, type FormEvent } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createTask, updateTask } from '../api/client';
import type { TaskInput } from '../api/client';
import type { Task, TaskPriority, TaskStatus } from '../types';
import LoadingSpinner from './LoadingSpinner';
import { inputClass } from './FormField/inputClass';

interface TaskFormState {
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  due_date: string;
}

const buildInitialForm = (task?: Task): TaskFormState => ({
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
  const [form, setForm] = useState<TaskFormState>(buildInitialForm(task));
  const [error, setError] = useState('');
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      onClose();
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Failed to create task');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<TaskInput>) => updateTask(task!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      onClose();
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Failed to update task');
    },
  });

  const mutation = isEditMode ? updateMutation : createMutation;

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form.title.trim()) return setError('Title is required');
    setError('');
    const payload = { ...form, due_date: form.due_date || null };
    if (isEditMode) {
      updateMutation.mutate(payload);
    } else {
      createMutation.mutate(payload);
    }
  };

  return (
    <div className=" relative bg-gray-800 border border-gray-700 rounded-2xl p-5 mb-6">
      {/* + add relative above, + add spinner below */}
      {mutation.isPending && <LoadingSpinner asOverlay />}
      <h2 className="text-white font-bold mb-4">{isEditMode ? '✏️ Edit Task' : '➕ New Task'}</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Title *</label>
          <input name="title" type="text" placeholder="Task title..."
            value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
            className={inputClass()} />
        </div>
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Description</label>
          <textarea name="description" placeholder="Optional description..." rows={2} maxLength={5000}
            value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
            className={`${inputClass()} resize-none`} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Priority</label>
            <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value as TaskPriority })}
              className={inputClass()}>
              <option value="low">🟢 Low</option>
              <option value="medium">🟡 Medium</option>
              <option value="high">🔴 High</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Due Date</label>
            <input type="date" value={form.due_date}
              onChange={(e) => setForm({ ...form, due_date: e.target.value })}
              className={inputClass()} />
          </div>
        </div>
        {error && <p className="text-red-400 text-xs">{error}</p>}
        <div className="flex gap-2 pt-1">
          <button type="submit" disabled={mutation.isPending}
            className="flex-1 bg-violet-500 hover:bg-violet-400 disabled:opacity-50
                       text-white font-bold py-2.5 rounded-xl transition-colors text-sm">
            {mutation.isPending
              ? (isEditMode ? 'Saving...' : 'Creating...')
              : (isEditMode ? 'Save Changes' : 'Create Task')}
          </button>
          <button type="button" onClick={onClose}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-gray-300
                       font-bold py-2.5 rounded-xl transition-colors text-sm">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default TaskForm;
