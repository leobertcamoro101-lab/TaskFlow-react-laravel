import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getTasks } from '../../api/client';
import { useAuthStore } from '../../stores/authStore';
import type { TaskStatus } from '../../types';
import TaskList from '../../components/TaskList';
import TaskForm from '../../components/TaskForm';
import LoadingSpinner from '../../components/LoadingSpinner';

const FILTERS: (TaskStatus | 'all')[] = ['all', 'todo', 'in-progress', 'done'];

const DashboardPage = () => {
  const user = useAuthStore((s) => s.user);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<TaskStatus | 'all'>('all');

  const { data: tasks = [], isLoading, isFetching, error } = useQuery({
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

  if (isLoading)
    return (
      <div className="h-screen flex items-center justify-center bg-[#FAF6EF]">
        {" "}
        <LoadingSpinner />{" "}
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 bg-[#FAF6EF] min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#2B2418]">
            Good day, {user?.name}! 👋
          </h1>
          <p className="text-[#857A64] text-sm mt-1">
            You have <span className="text-[#B8862E] font-medium">{stats.todo}</span> tasks to do
            and <span className="text-[#B8862E] font-medium">{stats.inProgress}</span> in progress.
          </p>
        </div>
        <button
          onClick={() => setShowForm((p) => !p)}
          className="bg-[#B8862E] hover:bg-[#9C7226] text-white font-bold
                     px-5 py-2.5 rounded-xl transition-colors text-sm shrink-0"
        >
          {showForm ? '✕ Cancel' : '➕ New Task'}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total', value: stats.total, color: 'text-[#2B2418]' },
          { label: 'To Do', value: stats.todo, color: 'text-[#857A64]' },
          { label: 'In Progress', value: stats.inProgress, color: 'text-[#B8862E]' },
          { label: 'Done', value: stats.done, color: 'text-emerald-600' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white border border-[#E9E0CF] rounded-xl p-3 sm:p-4 text-center">
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            <p className="text-[#857A64] text-xs mt-1">{label}</p>
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
                ? 'bg-[#B8862E] border-[#B8862E] text-white'
                : 'bg-white border-[#E9E0CF] text-[#857A64] hover:border-[#B8862E]'
            }`}
          >
            {f === 'all' ? 'All' : f === 'in-progress' ? 'In Progress' : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Task list */}
      {isFetching ? (
        <div className="space-y-3 animate-pulse">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-[#F0EAD9] rounded-2xl h-24" />
          ))}
        </div>
      ) : (
        <TaskList tasks={tasks} error={error} />
      )}
    </div>
  );
};

export default DashboardPage;
