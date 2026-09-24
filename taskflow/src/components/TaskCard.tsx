import  { useState, useEffect, useRef, type ChangeEvent } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateTask, deleteTask } from '../api/client';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import type { Task, TaskStatus, TaskPriority } from '../types';
import TaskForm from './TaskForm';

const STATUS_COLORS: Record<TaskStatus, string> = {
  'todo': 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  'in-progress': 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  'done': 'bg-green-500/10 text-green-400 border-green-500/20',
};

const PRIORITY_COLORS: Record<TaskPriority, string> = {
  low: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  medium: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  high: 'bg-red-500/10 text-red-400 border-red-500/20',
};

const STATUS_ICONS: Record<TaskStatus, string> = { 'todo': '📋', 'in-progress': '⚡', 'done': '✅' };

interface TaskCardProps {
  task: Task;
}

const TaskCard = ({ task }: TaskCardProps) => {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Task> }) => updateTask(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteTask(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  });

  const handleStatusChange = (e: ChangeEvent<HTMLSelectElement>) => {
    updateMutation.mutate({ id: task.id, data: { status: e.target.value as TaskStatus } });
  };

  if (isEditing) {
  return <TaskForm task={task} onClose={() => setIsEditing(false)} />;
}

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
        <div className='relative' ref={menuRef}>
          <button
            onClick={() => setMenuOpen((open) => !open)}
            className="p-2 rounded-full hover:bg-gray-100 text-gray-600"
            aria-label="Task options"
          >
            <MoreHorizontal size={20} />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
              <button
                onClick={() => {setMenuOpen(false); setIsEditing(true)}}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 bg-transparent border-0 rounded-none m-0 justify-start"
                aria-label="Edit task"
              >
                <Pencil size={16} /> Edit
              </button>
              <button
                onClick={() => { setMenuOpen(false); deleteMutation.mutate(task.id)}}
                disabled={deleteMutation.isPending}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <Trash2 size={16} /> Delete
              </button>
            </div>
          )}
        </div>
        {/* <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={() => setIsEditing(true)}
          className="text-gray-600 hover:text-violet-400 transition-colors text-sm"
          aria-label="Edit task"
        >
          ✏️
        </button>
        <button
          onClick={() => deleteMutation.mutate(task.id)}
          disabled={deleteMutation.isPending}
          className="text-gray-600 hover:text-red-400 transition-colors text-xl shrink-0"
        >
          ×
        </button>
        </div> */}
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
          id={`task-status-${task.id}`}
          name="status"
          aria-label="Task status"
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
