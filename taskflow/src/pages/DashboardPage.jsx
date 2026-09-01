import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getTasks } from '../api/client';
import { useAuthStore } from '../stores/authStore';
import TaskCard from '../components/TaskCard';
import TaskForm from '../components/TaskForm';

const FILTERS = ['all', 'todo', 'in-progress', 'done'];

const DashboardPage = () => {
  const user = useAuthStore((s) => s.user);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState('all');

  const { data: tasks = [], isLoading, error } = useQuery({
    queryKey: ['tasks', filter],
    queryFn: () => getTasks(filter !== 'all' ? { status: filter } : {}).then((r) => r.data),
  });

  // Stats
  const stats = {
    total: tasks.length,
    todo: tasks.filter((t) => t.status === 'todo').length,
    inProgress: tasks.filter((t) => t.status === 'in-progress').length,
    done: tasks.filter((t) => t.status === 'done').length,
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            Good day, {user?.name}! 👋
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            You have <span className="text-violet-400 font-medium">{stats.todo}</span> tasks to do
            and <span className="text-violet-400 font-medium">{stats.inProgress}</span> in progress.
          </p>
        </div>
        <button
          onClick={() => setShowForm((p) => !p)}
          className="bg-violet-500 hover:bg-violet-400 text-white font-bold
                     px-5 py-2.5 rounded-xl transition-colors text-sm shrink-0"
        >
          {showForm ? '✕ Cancel' : '➕ New Task'}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total', value: stats.total, color: 'text-white' },
          { label: 'To Do', value: stats.todo, color: 'text-gray-400' },
          { label: 'In Progress', value: stats.inProgress, color: 'text-violet-400' },
          { label: 'Done', value: stats.done, color: 'text-green-400' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-gray-800 border border-gray-700 rounded-xl p-3 sm:p-4 text-center">
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            <p className="text-gray-500 text-xs mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* New task form */}
      {showForm && <TaskForm onClose={() => setShowForm(false)} />}

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2 mb-5">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-xl text-xs font-medium border capitalize transition-colors ${
              filter === f
                ? 'bg-violet-500 border-violet-500 text-white'
                : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-violet-400'
            }`}
          >
            {f === 'all' ? 'All' : f === 'in-progress' ? 'In Progress' : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Task list */}
      {isLoading && (
        <div className="space-y-3 animate-pulse">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-gray-800 rounded-2xl h-24" />
          ))}
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-2xl p-4 text-sm">
          ⚠️ Failed to load tasks. Is the Laravel server running?
        </div>
      )}

      {!isLoading && tasks.length === 0 && (
        <div className="text-center py-16 text-gray-500">
          <p className="text-4xl mb-3">📭</p>
          <p>No tasks yet. Create your first one!</p>
        </div>
      )}

      {!isLoading && tasks.length > 0 && (
        <div className="space-y-3">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
