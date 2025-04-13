// Add missing imports
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Task } from '@/types/task';
// Removed useState import, added useEffect and useMemo
import React, { useEffect, useMemo, useRef } from 'react';
import { DayViewPresenter } from './day_view_presenter'; // Import the presenter
// Add missing icon imports
import { useAsyncValue } from '@/hooks/use_async_value';
import { isToday } from 'date-fns'; // Import isToday
import { CheckIcon, ClockIcon, Hourglass, Play, ThumbsDown, ThumbsUp } from 'lucide-react'; // Add Hourglass, ThumbsUp, ThumbsDown, Play
import { Toaster } from 'sonner';
import { DDDatePickerField } from '../domain_driven/fields/dd_date_picker_field';
import './day_view.css'; // Import the CSS file

interface DayViewProps {
  currentHourRef: React.RefObject<HTMLDivElement | null>;
  currentHour: number;
  tasks: Task[];
  fetchTasks: () => void;
}

// Fixed syntax and logical errors in the DayView component
const DayView: React.FC<DayViewProps> = ({ currentHourRef, currentHour, tasks, fetchTasks }) => {
  const presenter = useMemo(() => new DayViewPresenter(tasks, fetchTasks), [tasks, fetchTasks]);

  const tasksForSelectedDate = useAsyncValue(presenter.tasksForSelectedDate);
  const selectedDate = useAsyncValue(presenter.selectedDate.state).getValue();

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const scrollToCurrentHour = () => {
    if (currentHourRef.current) {
      currentHourRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  };

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;

    const handleInactivity = () => {
      const currentDateInView = presenter.selectedDate.getValue();
      const isViewingToday = currentDateInView && isToday(currentDateInView);

      if (isViewingToday) {
        scrollToCurrentHour();
      } else {
        presenter.selectedDate.setValue(new Date());
        scrollToCurrentHour();
      }
    };

    let inactivityTimeout: NodeJS.Timeout | null = null;

    const resetInactivityTimeout = () => {
      if (inactivityTimeout) {
        clearTimeout(inactivityTimeout);
      }
      inactivityTimeout = setTimeout(handleInactivity, 120000);
    };

    const handleScroll = () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      resetInactivityTimeout();
    };

    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll);
      resetInactivityTimeout();
    }

    return () => {
      if (scrollContainer) {
        scrollContainer.removeEventListener('scroll', handleScroll);
      }
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      if (inactivityTimeout) {
        clearTimeout(inactivityTimeout);
      }
    };
  }, [currentHourRef, selectedDate, presenter]);

  console.log({ tasksForSelectedDate });

  const getTaskColor = (taskType: string) => {
    switch (taskType) {
      case 'routine':
        return 'bg-blue-100 border-blue-200';
      case 'challenge':
        return 'bg-purple-100 border-purple-200';
      default:
        return 'bg-gray-100 border-gray-200';
    }
  };

  return (
    <div className="h-full">
      <Toaster richColors />
      <div className="mb-4">
        <DDDatePickerField domain={presenter.selectedDate} />
      </div>
      <div ref={scrollContainerRef} className="overflow-y-auto rounded-lg border bg-white shadow" style={{ maxHeight: 'calc(100vh - 200px)' }}>
        <div className="p-4">
          <div className="mb-4 flex items-center gap-2">
            <ClockIcon className="h-5 w-5 text-blue-500" />
            <h2 className="text-lg font-semibold">Today's Routine</h2>
          </div>
          <div>
            {presenter.hours.map((hour, hourIdx) => (
              <div
                key={hourIdx}
                ref={hour === currentHour ? currentHourRef : null}
                className={`flex min-h-[50px] items-center border-t border-gray-100 ${selectedDate && isToday(selectedDate) && hour === currentHour ? 'rounded-lg bg-yellow-100 p-1' : ''}`}
              >
                <div className="w-16 pr-4 text-right font-medium">
                  {hour === 0 ? '12 AM' : hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`}
                </div>
                <div className="flex-1">
                  {tasksForSelectedDate[hour]?.length > 0 ? (
                    tasksForSelectedDate[hour].map((task, idx) => (
                      <div key={idx} className={`my-2 flex items-center rounded-lg p-3 ${getTaskColor(task.type)}`}>
                        <div className="flex -space-x-2">
                          {task.assigned_to.map((child, childIdx) => (
                            <Avatar key={childIdx} className="h-8 w-8 border-2 border-white">
                              <AvatarFallback>{child.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                          ))}
                        </div>
                        <div className="ml-3 flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{task.title}</h3>
                          </div>
                          <p className="text-sm text-gray-600">
                            {task.available_from_time && task.available_to_time
                              ? `${task.available_from_time} - ${task.available_to_time}`
                              : 'Anytime'}
                          </p>
                        </div>

                        {/* Status/Button Rendering Logic */}
                        {(() => {
                          const isButtonActive = selectedDate && isToday(selectedDate);

                          switch (task.status) {
                            case 'completed':
                            case 'approved': // Icon: ThumbsUp for Done! - Chip Style
                              return (
                                <div className="status-chip status-chip--completed">
                                  <ThumbsUp /> {/* Icon size handled by CSS */}
                                  <span>Done!</span>
                                </div>
                              );
                            case 'pending_approval': // Icon: Hourglass for Pending Approval - Chip Style
                              return (
                                <div className="status-chip status-chip--pending-approval">
                                  <Hourglass /> {/* Icon size handled by CSS */}
                                  <span>Pending Approval</span>
                                </div>
                              );
                            case 'rejected': // Icon: ThumbsDown for Needs Review - Chip Style
                              return (
                                <div className="status-chip status-chip--rejected">
                                  <ThumbsDown /> {/* Icon size handled by CSS */}
                                  <span>Needs Review</span>
                                </div>
                              );
                            case 'in_progress': // Icon: Play for In Progress (Collaborative) - Chip Style
                              return (
                                <div className="status-chip status-chip--in-progress">
                                  <Play /> {/* Icon size handled by CSS */}
                                  <span>In Progress</span>
                                </div>
                              );
                            case 'pending': // Action Button with CheckIcon
                            default:
                              return (
                                <button
                                  type="button"
                                  className={`complete-button ${isButtonActive ? 'complete-button--active' : 'complete-button--disabled'}`}
                                  onClick={() => {
                                    const childIds = task.assigned_to.map((child) => child.id);
                                    if (childIds.length > 0 && isButtonActive) {
                                      presenter.markTaskComplete(childIds, task.id);
                                    }
                                  }}
                                  disabled={!isButtonActive}
                                >
                                  <CheckIcon /> {/* Icon size handled by CSS */}
                                  <span>Complete!</span>
                                </button>
                              );
                          }
                        })()}
                      </div>
                    ))
                  ) : (
                    <div className="py-2 text-center text-sm text-gray-400">Free Time! ✨</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DayView;
