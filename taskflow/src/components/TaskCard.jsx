import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateTask, deleteTask } from '../api/client';

const STATUS_COLORS = {
  'todo': 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  'in-progress': 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  'done': 'bg-green-500/10 text-green-400 border-green-500/20',
};

const PRIORITY_COLORS = {
  low: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  medium: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  high: 'bg-red-500/10 text-red-400 border-red-500/20',
};

const STATUS_ICONS = { 'todo': '📋', 'in-progress': '⚡', 'done': '✅' };

const TaskCard = ({ task }) => {
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateTask(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteTask(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  });

  const handleStatusChange = (e) => {
    updateMutation.mutate({ id: task.id, data: { status: e.target.value } });
  };

  return (
    <div className={`bg-gray-800/50 border border-gray-700 rounded-2xl p-4 sm:p-5
                     hover:border-gray-600 transition-all ${task.status === 'done' ? 'opacity-60' : ''}`}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-start gap-2 flex-1 min-w-0">
          <span className="text-lg mt-0.5">{STATUS_ICONS[task.status]}</span>
          <h3 className={`font-semibold text-sm sm:text-base leading-tight ${
            task.status === 'done' ? 'line-through text-gray-500' : 'text-white'
          }`}>
            {task.title}
          </h3>
        </div>
        <button
          onClick={() => deleteMutation.mutate(task.id)}
          disabled={deleteMutation.isPending}
          className="text-gray-600 hover:text-red-400 transition-colors text-xl shrink-0"
        >
          ×
        </button>
      </div>

      {task.description && (
        <p className="text-gray-400 text-xs leading-relaxed mb-3 ml-7">{task.description}</p>
      )}

      {task.due_date && (
        <p className="text-gray-500 text-xs mb-3 ml-7">
          📅 Due: {new Date(task.due_date).toLocaleDateString()}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-2 ml-7">
        <span className={`text-xs px-2 py-1 rounded-lg border font-medium ${PRIORITY_COLORS[task.priority]}`}>
          {task.priority}
        </span>
        <select
          value={task.status}
          onChange={handleStatusChange}
          disabled={updateMutation.isPending}
          className={`text-xs px-2 py-1 rounded-lg border font-medium outline-none
                      cursor-pointer bg-transparent ${STATUS_COLORS[task.status]}`}
        >
          <option value="todo">📋 Todo</option>
          <option value="in-progress">⚡ In Progress</option>
          <option value="done">✅ Done</option>
        </select>
      </div>
    </div>
  );
};

export default TaskCard;
