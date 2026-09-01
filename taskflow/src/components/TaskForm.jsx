import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createTask } from '../api/client';

const defaultForm = { title: '', description: '', priority: 'medium', status: 'todo', due_date: '' };

const TaskForm = ({ onClose }) => {
  const [form, setForm] = useState(defaultForm);
  const [error, setError] = useState('');
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      onClose();
    },
    onError: (err) => {
      setError(err.response?.data?.message || 'Failed to create task');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return setError('Title is required');
    setError('');
    mutation.mutate({ ...form, due_date: form.due_date || null });
  };

  const inputClass = 'w-full bg-gray-900 border border-gray-700 text-white text-sm rounded-xl px-3 py-2.5 outline-none focus:border-violet-400 transition-colors placeholder-gray-600';

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-2xl p-5 mb-6">
      <h2 className="text-white font-bold mb-4">➕ New Task</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Title *</label>
          <input name="title" type="text" placeholder="Task title..."
            value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
            className={inputClass} />
        </div>
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Description</label>
          <textarea name="description" placeholder="Optional description..." rows={2}
            value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
            className={`${inputClass} resize-none`} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Priority</label>
            <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}
              className={inputClass}>
              <option value="low">🟢 Low</option>
              <option value="medium">🟡 Medium</option>
              <option value="high">🔴 High</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Due Date</label>
            <input type="date" value={form.due_date}
              onChange={(e) => setForm({ ...form, due_date: e.target.value })}
              className={inputClass} />
          </div>
        </div>
        {error && <p className="text-red-400 text-xs">{error}</p>}
        <div className="flex gap-2 pt-1">
          <button type="submit" disabled={mutation.isPending}
            className="flex-1 bg-violet-500 hover:bg-violet-400 disabled:opacity-50
                       text-white font-bold py-2.5 rounded-xl transition-colors text-sm">
            {mutation.isPending ? 'Creating...' : 'Create Task'}
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
