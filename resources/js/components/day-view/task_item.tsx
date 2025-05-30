import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAsyncStatus } from '@/hooks/use_async_status';
import { useConfetti } from '@/hooks/use_confetti';
import { CheckIcon, ChevronDown, ChevronUp, Coins, Hourglass, ShieldAlert, ThumbsDown, ThumbsUp } from 'lucide-react';
import React from 'react';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { DayViewPresenter } from './day_view_presenter';
import { FormattedTask } from './types';

interface TaskItemProps {
  task: FormattedTask;
  presenter: DayViewPresenter;
  isTodayView: boolean;
  currentTime: Date;
  isExpanded: boolean;
  onToggleExpansion: (taskId: number) => void;
  isTasksPending: boolean;
  getFamilyChildren: () => void;
}

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();
};

export const TaskItem: React.FC<TaskItemProps> = ({
  task,
  presenter,
  isTodayView,
  currentTime,
  isExpanded,
  onToggleExpansion,
  isTasksPending,
  getFamilyChildren,
}) => {
  const { triggerConfetti } = useConfetti();
  const hasReward = task.children.some((c) => c.token_reward > 0);
  const { isPending: isMarkCompletePending } = useAsyncStatus(presenter.markCompleteRunner);

  const backgroundStyle: React.CSSProperties = { backgroundColor: '#ffffff', borderColor: '#e5e7eb' };

  const displayStatus = task.assignment_status || 'pending';
  let isPastDue = false;

  if (isTodayView && (displayStatus === 'pending' || displayStatus === 'in_progress') && task.available_to_time_raw) {
    try {
      const [taskHour, taskMinute] = task.available_to_time_raw.split(':').map(Number);
      const currentHourFromState = currentTime.getHours();
      const currentMinuteFromState = currentTime.getMinutes();

      if (!isNaN(taskHour) && !isNaN(taskMinute)) {
        if (currentHourFromState > taskHour || (currentHourFromState === taskHour && currentMinuteFromState >= taskMinute)) {
          isPastDue = true;
        }
      } else {
        console.warn('Failed to parse available_to_time_raw:', task.available_to_time_raw);
      }
    } catch (error) {
      console.error('Error parsing available_to_time_raw:', task.available_to_time_raw, error);
    }
  }

  const handleCompleteClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    const childIds = task.children.map((child) => child.id);
    if (childIds.length > 0) {
      presenter.markTaskComplete(childIds, task.id, () => {
        triggerConfetti();
        getFamilyChildren(); // Get children for now
      });
    }
  };

  const handleToggleExpansion = (e: React.MouseEvent<HTMLDivElement | HTMLButtonElement>) => {
    e.stopPropagation();
    onToggleExpansion(task.id);
  };

  // Utility to get badge classes based on status
  const getBadgeClasses = (status: typeof displayStatus): string => {
    switch (status) {
      case 'completed':
      case 'approved':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'pending_approval':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'rejected':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const isMissed = task.is_mandatory && isPastDue && displayStatus === 'in_progress';
  const renderStatusIndicator = () => {
    // if (!isTodayView) return null;
    const baseClasses = 'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium border';

    if (isMissed) {
      return (
        <Badge variant="outline" className={baseClasses + ' ' + getBadgeClasses('')}>
          <Hourglass className="h-3.5 w-3.5" />
          <span>Missed</span>
        </Badge>
      );
    }
    switch (displayStatus) {
      case 'future':
        return (
          <Badge variant="outline" className={baseClasses + ' ' + getBadgeClasses(displayStatus)}>
            <span>Not Available</span>
          </Badge>
        );
      case 'completed':
      case 'approved':
        return (
          <Badge variant="outline" className={baseClasses + ' ' + getBadgeClasses(displayStatus)}>
            <ThumbsUp className="h-3.5 w-3.5" />
            <span>Done!</span>
          </Badge>
        );
      case 'pending_approval':
        return (
          <Badge variant="outline" className={baseClasses + ' ' + getBadgeClasses(displayStatus) + ' animate-[pulse-border_2s_infinite]'}>
            <Hourglass className="h-3.5 w-3.5" />
            <span>Pending Approval</span>
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="outline" className={baseClasses + ' ' + getBadgeClasses(displayStatus)}>
            <ThumbsDown className="h-3.5 w-3.5" />
            <span>Rejected</span>
          </Badge>
        );
      case 'in_progress':
        return (
          <div className="flex flex-col items-end">
            <Button
              variant="default"
              size="sm"
              className={
                'relative inline-flex w-full items-center gap-1 text-sm shadow-sm md:w-auto ' +
                'bg-green-500 text-white hover:bg-green-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600'
              }
              onClick={handleCompleteClick}
              title={'Mark Complete'}
              disabled={isTasksPending || isMarkCompletePending}
            >
              <CheckIcon className="-ml-0.5 h-5 w-5" />
              <span>Complete!</span>
              {task.needs_approval && (
                <span title="Requires approval" className="absolute -top-1.5 -right-1.5">
                  <ShieldAlert
                    style={{
                      width: '20px',
                      padding: '2px',
                      height: '20px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--color-green-600)',
                      color: 'white',
                    }}
                  />
                </span>
              )}
            </Button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Card
      key={task.id}
      className="cursor-pointer gap-0 overflow-hidden py-0 transition-shadow duration-200 ease-in-out hover:shadow-md"
      style={{ ...backgroundStyle, borderWidth: '1px' }}
      onClick={handleToggleExpansion}
    >
      <div className="relative flex flex-row p-3 md:items-center">
        <div className="flex w-full min-w-0 grow flex-col gap-2 md:flex-row md:items-center">
          <div className="min-w-0 grow">
            <div className="mb-0.5 flex items-center gap-1.5">
              <h3 className="truncate text-base font-semibold" style={{ color: '#333333' }}>
                {task.title}
              </h3>
              {hasReward && <Coins size={14} className="inline-block align-middle" style={{ color: '#fbbf24' }} />}
            </div>
            <p className="text-sm leading-tight" style={{ color: '#5f6368' }}>
              {task.available_from_time && task.available_to_time ? `${task.available_from_time} - ${task.available_to_time}` : 'Anytime'}
            </p>
          </div>
          <div className="mr-3 flex flex-shrink-0 -space-x-2">
            {task.children.map((child, childIdx) => (
              <Avatar
                key={childIdx}
                className="h-8 w-8 overflow-hidden rounded-full border-2 shadow-sm"
                style={{
                  backgroundColor: '#e0e0e0',
                  borderColor: child.color || '#d1d4db',
                }}
              >
                <AvatarFallback className="text-xs font-medium" style={{ color: '#4f4f4f' }}>
                  {getInitials(child.name)}
                </AvatarFallback>
              </Avatar>
            ))}
          </div>
          <div className="md:m-3 md:pr-3">{hasReward && renderStatusIndicator()}</div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-1.5 right-1.5 h-7 w-7 rounded-full md:top-6.5"
          style={{ color: '#6b7280' }}
          onClick={handleToggleExpansion}
          aria-label={isExpanded ? 'Collapse task details' : 'Expand task details'}
        >
          {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </Button>
      </div>
      <div className={`transition-max-height w-full overflow-hidden duration-300 ease-in-out ${isExpanded ? 'max-h-[500px]' : 'max-h-0'}`}>
        <div className="px-3 pt-0 pb-3">
          <hr className="my-2 border-t" style={{ borderColor: '#e5e7eb' }} />
          {task.description && (
            <p className="mb-3 text-sm" style={{ color: '#4b5563' }}>
              {task.description}
            </p>
          )}
          {hasReward && (
            <div className="text-sm" style={{ color: '#4b5563' }}>
              <strong className="font-semibold" style={{ color: '#374151' }}>
                Token Rewards:
              </strong>
              <ul className="mt-1 list-disc space-y-0.5 pl-5">
                {task.children.map((child) => (
                  <li key={child.id}>
                    {child.name}: {child.token_reward} tokens
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};
