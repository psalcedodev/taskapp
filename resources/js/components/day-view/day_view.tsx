import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAsyncStatus } from '@/hooks/use_async_status';
import { useAsyncValue } from '@/hooks/use_async_value';
import { useConfetti } from '@/hooks/use_confetti';
import { isToday } from 'date-fns';
import { Activity, CheckIcon, ChevronDown, ChevronUp, Coins, Hourglass, ShieldAlert, ThumbsDown, ThumbsUp, XCircle } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Toaster } from 'sonner';
import './day_view.css';
import { DayViewPresenter, FormattedTask } from './day_view_presenter';

interface DayViewProps {
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
  currentHourRef: React.RefObject<HTMLDivElement | null>;
  presenter: DayViewPresenter;
  selectedDate: Date;
  currentHour: number;
}

// --- Reusable TaskItem Component --- START
interface TaskItemProps {
  task: FormattedTask;
  presenter: DayViewPresenter;
  isTodayView: boolean;
  currentTime: Date;
  isExpanded: boolean;
  onToggleExpansion: (taskId: number) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, presenter, isTodayView, currentTime, isExpanded, onToggleExpansion }) => {
  const { triggerConfetti } = useConfetti();
  const uniqueChildColors = [...new Set(task.children.map((child) => child.color).filter(Boolean))];
  const hasReward = task.children.some((c) => c.token_reward > 0);

  let backgroundStyle: React.CSSProperties = { backgroundColor: '#f3f4f6', borderColor: '#e5e7eb' };
  if (uniqueChildColors.length === 1) {
    backgroundStyle = { backgroundColor: uniqueChildColors[0], borderColor: `color-mix(in srgb, ${uniqueChildColors[0]} 70%, #000)` };
  } else if (uniqueChildColors.length > 1) {
    backgroundStyle = { background: `linear-gradient(to right, ${uniqueChildColors.join(', ')})`, borderColor: '#e5e7eb' };
  }

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

  // Stop propagation on button click to prevent expansion toggle
  const handleButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    const childIds = task.children.map((child) => child.id);
    if (childIds.length > 0) {
      presenter.markTaskComplete(childIds, task.id, () => triggerConfetti());
    }
  };

  return (
    <div
      key={task.id} // Use task.id directly as key
      className="task-item task-item--expandable"
      style={backgroundStyle}
      onClick={() => onToggleExpansion(task.id)} // Use passed toggle function
    >
      <div className="task-item-main-content">
        <div className="avatar-stack">
          {task.children.map((child, childIdx) => (
            <Avatar key={childIdx} className="avatar">
              <AvatarFallback className="avatar-fallback">{child.name.charAt(0)}</AvatarFallback>
            </Avatar>
          ))}
        </div>
        <div className="task-details">
          <div className="task-title-container">
            <h3 className="task-title">{task.title}</h3>
            {hasReward && <Coins size={16} className="task-reward-icon" />}
          </div>
          <p className="task-time">
            {task.available_from_time && task.available_to_time ? `${task.available_from_time} - ${task.available_to_time}` : 'Anytime'}
          </p>
        </div>

        {/* Status/Button Logic */}
        {isTodayView &&
          (() => {
            switch (displayStatus) {
              case 'completed':
              case 'approved':
                return (
                  <div className="status-chip status-chip--completed">
                    <ThumbsUp />
                    <span>Done!</span>
                  </div>
                );
              case 'pending_approval':
                return (
                  <div className="status-chip status-chip--pending-approval">
                    <Hourglass />
                    <span>Pending Approval</span>
                  </div>
                );
              case 'rejected':
                return (
                  <div className="status-chip status-chip--rejected">
                    <ThumbsDown />
                    <span>Needs Review</span>
                  </div>
                );
              case 'in_progress':
              case 'pending':
              default:
                return isPastDue ? (
                  <div className="status-chip status-chip--missed">
                    <XCircle />
                    <span>Missed</span>
                  </div>
                ) : (
                  <div className="complete-button-container">
                    <button
                      type="button"
                      className={`complete-button complete-button--active relative`}
                      onClick={handleButtonClick}
                      title={'Mark Complete'}
                    >
                      <CheckIcon />
                      <span>Complete!</span>
                      {task.needs_approval && (
                        <span title="Requires approval" className="absolute -top-2 -right-1">
                          <ShieldAlert
                            style={{ width: '20px', padding: '2px', height: '20px', borderRadius: '50%', backgroundColor: '#22c55e', color: 'white' }}
                          />
                        </span>
                      )}
                    </button>
                    {task.needs_approval && <span className="approval-helper-text">Requires approval</span>}
                  </div>
                );
            }
          })()}
      </div>{' '}
      {/* End Main Task Content Wrapper */}
      {/* Expansion Indicator Icon */}
      <div className="task-expansion-indicator">{isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}</div>
      {/* Conditionally Rendered Details Section */}
      {isExpanded && (
        <div className="task-item-details-expanded">
          <hr className="details-divider" />
          {task.description && <p className="details-description">{task.description}</p>}
          <div className="details-rewards">
            <strong>Token Rewards:</strong>
            <ul>
              {task.children.map((child) => (
                <li key={child.id}>
                  {child.name}: {child.token_reward} tokens
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
// --- Reusable TaskItem Component --- END

const DayView: React.FC<DayViewProps> = ({ presenter, currentHourRef, scrollContainerRef, selectedDate, currentHour }) => {
  const tasksForSelectedDate = useAsyncValue(presenter.tasksForDateRunner);
  const [currentTime, setCurrentTime] = useState(new Date());
  const { isPending: isTasksPending } = useAsyncStatus(presenter.tasksForDateRunner);
  const { triggerConfetti } = useConfetti();
  // State to track the *single* expanded anytime task ID (or null)
  const [expandedAnytimeTaskId, setExpandedAnytimeTaskId] = useState<number | null>(null);
  // State to track the *single* expanded hourly task ID (or null)
  const [expandedHourlyTaskId, setExpandedHourlyTaskId] = useState<number | null>(null);
  console.log({ isTasksPending });

  // --- Mock Anytime Tasks --- START
  const mockAnytimeTasks: FormattedTask[] = [
    {
      id: 9991,
      title: 'Read for 30 minutes',
      description: 'Catch up on your favorite book.',
      type: 'routine',
      needs_approval: false,
      is_mandatory: false,
      available_from_time: null,
      available_to_time: null,
      assignment_status: 'pending',
      children: [
        { id: 1, name: 'Maida', color: '#FDFFB6', avatar: null, token_reward: 0 },
        { id: 2, name: 'Nia', color: '#CAFFBF', avatar: null, token_reward: 0 },
      ],
    },
    {
      id: 9992,
      title: 'Tidy up your room',
      description: null,
      type: 'routine',
      needs_approval: true,
      is_mandatory: true,
      available_from_time: null,
      available_to_time: null,
      assignment_status: 'pending_approval',
      children: [{ id: 1, name: 'Maida', color: '#FDFFB6', avatar: null, token_reward: 0 }],
    },
    {
      id: 9993,
      title: 'Practice piano',
      description: 'Work on the new piece.',
      type: 'challenge',
      needs_approval: false,
      is_mandatory: false,
      available_from_time: null,
      available_to_time: null,
      assignment_status: 'completed',
      children: [{ id: 2, name: 'Nia', color: '#CAFFBF', avatar: null, token_reward: 0 }],
    },
  ];
  // --- Mock Anytime Tasks --- END

  const isTodayView = selectedDate && isToday(selectedDate);

  // Function to toggle expansion state for anytime tasks
  const toggleAnytimeTaskExpansion = (taskId: number) => {
    setExpandedAnytimeTaskId((currentlyExpandedId) => {
      // If the clicked task is already open, close it (set to null)
      // Otherwise, open the clicked task (set to its ID)
      return currentlyExpandedId === taskId ? null : taskId;
    });
  };

  // Function to toggle expansion state for hourly tasks
  const toggleHourlyTaskExpansion = (taskId: number) => {
    setExpandedHourlyTaskId((currentlyExpandedId) => {
      return currentlyExpandedId === taskId ? null : taskId;
    });
  };

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="day-view-container">
      <Toaster richColors />
      <div ref={scrollContainerRef} className="day-view-scroll-container relative h-full">
        {isTasksPending ? (
          <div className="bg-opacity-75 absolute inset-0 z-10 flex items-center justify-center bg-white">
            {/* Use the Loader component if available, otherwise keep text */}
            <svg className="h-8 w-8 animate-spin text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </div>
        ) : (
          <div className="day-view-content">
            {/* Anytime Tasks Section - Using Mock Data */}
            {mockAnytimeTasks.length > 0 && (
              <div className="anytime-tasks-section">
                <h3 className="section-title">
                  <Activity size={18} /> {/* Icon */}
                  <span>Anytime Today</span>
                </h3>
                <div className="tasks-list">
                  {mockAnytimeTasks.map((task) => {
                    // Check if the current task's ID matches the expanded ID
                    const isExpanded = expandedAnytimeTaskId === task.id;
                    // --- Replicated Task Rendering Logic (Simplified) --- START
                    const uniqueChildColors = [...new Set(task.children.map((child) => child.color).filter(Boolean))];
                    let backgroundStyle: React.CSSProperties = { backgroundColor: '#f3f4f6', borderColor: '#e5e7eb' };
                    if (uniqueChildColors.length === 1) {
                      backgroundStyle = {
                        backgroundColor: uniqueChildColors[0],
                        borderColor: `color-mix(in srgb, ${uniqueChildColors[0]} 70%, #000)`,
                      };
                    } else if (uniqueChildColors.length > 1) {
                      backgroundStyle = { background: `linear-gradient(to right, ${uniqueChildColors.join(', ')})`, borderColor: '#e5e7eb' };
                    }
                    const displayStatus = task.assignment_status || 'pending';
                    const isPastDue = false;
                    const hasReward = task.children.some((c) => c.token_reward > 0);
                    // --- Replicated Task Rendering Logic --- END

                    return (
                      <TaskItem
                        key={task.id}
                        task={task}
                        presenter={presenter}
                        isTodayView={isTodayView}
                        currentTime={currentTime}
                        isExpanded={isExpanded}
                        onToggleExpansion={toggleAnytimeTaskExpansion}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {/* Hourly Tasks Section */}
            {presenter.hours.map((hour, hourIdx) => {
              return (
                <div
                  key={hourIdx}
                  ref={hour === currentHour ? currentHourRef : null}
                  className={`hour-row ${selectedDate && isToday(selectedDate) && hour === currentHour ? 'hour-row--current' : ''}`}
                >
                  <div className="hour-label">{hour === 0 ? '12 AM' : hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`}</div>
                  <div className="hour-tasks-container">
                    {tasksForSelectedDate[hour]?.length > 0 ? (
                      tasksForSelectedDate[hour].map((task: FormattedTask) => {
                        // Calculate if THIS task is the currently expanded hourly one
                        const isExpanded = expandedHourlyTaskId === task.id;
                        return (
                          <TaskItem
                            key={task.id} // Use task.id for key
                            task={task}
                            presenter={presenter}
                            isTodayView={isTodayView}
                            currentTime={currentTime}
                            isExpanded={isExpanded} // Pass the calculated expansion state
                            onToggleExpansion={toggleHourlyTaskExpansion} // Pass the hourly toggle function
                          />
                        );
                      })
                    ) : (
                      <div className="empty-slot">Free Time! ✨</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default DayView;
