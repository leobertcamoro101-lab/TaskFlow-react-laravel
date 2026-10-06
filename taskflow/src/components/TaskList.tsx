import type { Task } from '../types';
import TaskCard from './TaskCard';

interface TaskListProps {
  tasks: Task[];
  error: unknown;
}

const TaskList = ({ tasks, error }: TaskListProps) => {
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-600 rounded-2xl p-4 text-sm">
        ⚠️ Failed to load tasks. Is the Laravel server running?
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-16 text-[#857A64]">
        <p className="text-4xl mb-3">📭</p>
        <p>No tasks yet. Create your first one!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <TaskCard key={task.id} task={task} />
      ))}
    </div>
  );
};

export default TaskList;
