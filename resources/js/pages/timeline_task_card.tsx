import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { GroupAvatar } from '@/components/ui/group_avatar';
import { Icon } from '@/components/ui/icon';
import { CheckCircle, CheckIcon, Clock, CoinsIcon } from 'lucide-react';
import React from 'react';
import { Task } from '../types/task';
import { User } from '../types/user';

interface TimelineTaskCardProps {
  task: Task;
  users: User[];
  zIndex?: number;
  onComplete: () => void;
}

export const TimelineTaskCard: React.FC<TimelineTaskCardProps> = ({ task, users, zIndex = 1, onComplete }) => {
  // Get background color based on task type or user
  const getBgColor = () => {
    if (task.isGroupTask) {
      return 'bg-secondary-100';
    }

    if (users.length === 0) return 'bg-default-100';

    // For individual tasks, use the user's color
    const user = users[0];
    switch (user.color) {
      case 'primary':
        return 'bg-primary-100';
      case 'secondary':
        return 'bg-secondary-100';
      case 'success':
        return 'bg-success-100';
      case 'warning':
        return 'bg-warning-100';
      case 'danger':
        return 'bg-danger-100';
      default:
        return 'bg-default-100';
    }
  };

  // Get border color based on task type or user
  const getBorderColor = () => {
    if (task.isGroupTask) {
      return 'border-secondary-300';
    }

    if (users.length === 0) return 'border-default-300';

    // For individual tasks, use the user's color
    const user = users[0];
    switch (user.color) {
      case 'primary':
        return 'border-primary-300';
      case 'secondary':
        return 'border-secondary-300';
      case 'success':
        return 'border-success-300';
      case 'warning':
        return 'border-warning-300';
      case 'danger':
        return 'border-danger-300';
      default:
        return 'border-default-300';
    }
  };

  // Task card for timeline view
  return (
    <div
      className={`relative rounded-md border px-3 py-2 transition-all hover:shadow-md ${getBgColor()} ${getBorderColor()} ${task.status === 'completed' ? 'opacity-60' : ''} w-full`}
      style={{ zIndex: zIndex }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 overflow-hidden">
          {/* User avatar */}
          {users.length > 0 && <GroupAvatar users={users} maxDisplayed={2} />}

          {/* Task title and time */}
          <div className="overflow-hidden">
            <h3 className={`truncate text-base font-medium ${task.status === 'completed' ? 'text-default-400 line-through' : ''}`}>{task.title}</h3>
            <div className="text-default-500 mt-0.5 flex items-center gap-1 text-xs">
              <Icon iconNode={Clock} className="h-3 w-3" />
              <span>
                {task.visibleTime.start} - {task.visibleTime.end}
              </span>
            </div>
          </div>
        </div>

        {/* Complete button or status */}
        {task.status === 'pending' ? (
          <Button color="primary" size="sm" onClick={onComplete} className="min-w-[100px] justify-between">
            <CheckIcon />
            Complete
            <span className="flex items-center gap-1">
              <CoinsIcon className="text-warning-500" />
              {task.tokens}
            </span>
          </Button>
        ) : (
          <Badge color={task.status === 'completed' ? 'success' : 'warning'}>
            {task.status === 'completed' ? <CheckCircle className="text-success-500" /> : <Clock className="text-warning-500" />}
            {task.status === 'completed' ? 'Done' : 'Waiting'}
          </Badge>
        )}
      </div>

      {/* Approval indicator */}
      {task.requiresApproval && task.status === 'pending' && <div className="bg-warning-500 absolute -top-1 -right-1 h-2 w-2 rounded-full"></div>}
    </div>
  );
};
