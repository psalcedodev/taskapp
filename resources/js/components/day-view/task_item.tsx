import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useConfetti } from '@/hooks/use_confetti';
import { CheckIcon, ChevronDown, ChevronUp, Coins, Hourglass, ShieldAlert, ThumbsDown, ThumbsUp, XCircle } from 'lucide-react';
import React from 'react';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { DayViewPresenter } from './day_view_presenter';
import { FormattedTask } from './types';

// --- Reusable TaskItem Component --- START
interface TaskItemProps {
  task: FormattedTask;
  presenter: DayViewPresenter;
  isTodayView: boolean;
  currentTime: Date;
  isExpanded: boolean;
  onToggleExpansion: (taskId: number) => void;
  isTasksPending: boolean;
}

// Helper function for initials (if not already globally available)
const getInitials = (name: string) => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();
};

export const TaskItem: React.FC<TaskItemProps> = ({ task, presenter, isTodayView, currentTime, isExpanded, onToggleExpansion, isTasksPending }) => {
  const { triggerConfetti } = useConfetti();
  const hasReward = task.children.some((c) => c.token_reward > 0);

  // --- Use Neutral Background Style ---
  // Set a standard background (e.g., white) and border
  const backgroundStyle: React.CSSProperties = { backgroundColor: '#ffffff', borderColor: '#e5e7eb' }; // bg-white, border-gray-200

  const displayStatus = task.assignment_status || 'pending';
  let isPastDue = false;
  if (isTodayView && (displayStatus === 'pending' || displayStatus === 'in_progress') && task.available_to_time) {
    const [taskHour, taskMinute] = task.available_to_time.split(':').map(Number);
    const currentHourFromState = currentTime.getHours();
    const currentMinuteFromState = currentTime.getMinutes();
    if (currentHourFromState > taskHour || (currentHourFromState === taskHour && currentMinuteFromState >= taskMinute)) {
      isPastDue = true;
    }
  }

  const handleCompleteClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    const childIds = task.children.map((child) => child.id);
    if (childIds.length > 0) {
      presenter.markTaskComplete(childIds, task.id, () => triggerConfetti());
    }
  };

  const handleToggleExpansion = (e: React.MouseEvent<HTMLDivElement | HTMLButtonElement>) => {
    e.stopPropagation();
    onToggleExpansion(task.id);
  };

  // Define styles for badges based on status with updated "modern" hex codes
  const getBadgeStyle = (status: typeof displayStatus): React.CSSProperties => {
    switch (status) {
      case 'completed':
      case 'approved':
        // Using a soft green palette
        return { backgroundColor: '#ecfdf5', color: '#065f46', borderColor: '#a7f3d0', borderWidth: '1px' }; // ~Tailwind green 50/800/300
      case 'pending_approval':
        // Using a soft amber/yellow palette
        return { backgroundColor: '#fffbeb', color: '#b45309', borderColor: '#fde68a', borderWidth: '1px' }; // ~Tailwind amber 50/700/200
      case 'rejected':
        // Using a soft red palette
        return { backgroundColor: '#fee2e2', color: '#b91c1c', borderColor: '#fecaca', borderWidth: '1px' }; // ~Tailwind red 50/700/200
      default: // 'pending', 'in_progress' (missed) - Use a neutral gray
        return { backgroundColor: '#f3f4f6', color: '#4b5563', borderColor: '#e5e7eb', borderWidth: '1px' }; // ~Tailwind gray 100/600/200
    }
  };

  const renderStatusIndicator = () => {
    if (!isTodayView) return null;

    const baseClasses = 'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium border'; // Added border class back

    switch (displayStatus) {
      case 'completed':
      case 'approved':
        return (
          <Badge variant="outline" className={baseClasses} style={getBadgeStyle(displayStatus)}>
            <ThumbsUp className="h-3.5 w-3.5" />
            <span>Done!</span>
          </Badge>
        );
      case 'pending_approval':
        return (
          <Badge variant="outline" className={`${baseClasses} animate-[pulse-border_2s_infinite]`} style={getBadgeStyle(displayStatus)}>
            <Hourglass className="h-3.5 w-3.5" />
            <span>Pending Approval</span>
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="outline" className={baseClasses} style={getBadgeStyle(displayStatus)}>
            <ThumbsDown className="h-3.5 w-3.5" />
            <span>Needs Review</span>
          </Badge>
        );
      case 'in_progress':
        if (isPastDue) {
          // Changed condition logic to match previous behaviour (Show Missed when past due)
          return (
            <Badge variant="outline" className={baseClasses} style={getBadgeStyle(displayStatus)}>
              <XCircle className="h-3.5 w-3.5" />
              <span>Missed</span>
            </Badge>
          );
        } else {
          // Show complete button for 'in_progress' tasks that are NOT past due
          return (
            <div className="flex flex-col items-end">
              <Button
                variant="default" // Use Shadcn default variant structure
                size="sm"
                // Apply modern green color via style override
                style={{ backgroundColor: '#22c55e', color: '#ffffff' }} // ~Tailwind green-500
                // Define hover and focus using classes for simplicity with Shadcn structure
                className="relative inline-flex items-center gap-1 text-sm shadow-sm hover:bg-[#16a34a] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#16a34a]" // ~Tailwind green-600 for hover/focus
                onClick={handleCompleteClick}
                title={'Mark Complete'}
                disabled={isTasksPending}
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
                        // Use the hover green for the shield background for consistency
                        backgroundColor: '#16a34a',
                        color: 'white',
                      }}
                    />
                  </span>
                )}
              </Button>
              {task.needs_approval && (
                <span className="mt-0.5 text-right text-xs" style={{ color: '#5f6368' }}>
                  {' '}
                  {/* text-gray-600 */}
                  Requires approval
                </span>
              )}
            </div>
          );
        }
      default: // 'pending'
        return null; // No indicator needed for pending tasks before they are past due or in progress
    }
  };

  return (
    <Card
      key={task.id}
      className="cursor-pointer gap-0 overflow-hidden py-0 transition-shadow duration-200 ease-in-out hover:shadow-md"
      style={{ ...backgroundStyle, borderWidth: '1px' }}
      onClick={handleToggleExpansion}
    >
      <div className="relative flex flex-wrap items-start p-3">
        <div className="mr-1 flex w-full min-w-0 grow items-center pr-10">
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
          <div className="mr-2 min-w-0 grow">
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
          <div className="ml-auto flex-shrink-0 self-center">{renderStatusIndicator()}</div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-1.5 right-1.5 h-7 w-7 rounded-full"
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
        </div>
      </div>
    </Card>
  );
};
// --- Reusable TaskItem Component --- END
