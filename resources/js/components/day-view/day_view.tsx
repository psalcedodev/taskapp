import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAsyncValue } from '@/hooks/use_async_value';
import { isToday } from 'date-fns';
import { CheckIcon, Hourglass, ShieldAlert, ThumbsDown, ThumbsUp, XCircle } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { Toaster } from 'sonner';
import './day_view.css';
import { DayViewPresenter } from './day_view_presenter';

interface DayViewProps {
  currentHourRef: React.RefObject<HTMLDivElement | null>;
  currentHour: number;
  selectedDate: Date | null;
  presenter: DayViewPresenter;
}

const DayView: React.FC<DayViewProps> = ({ presenter, currentHourRef, currentHour, selectedDate }) => {
  const tasksForSelectedDate = useAsyncValue(presenter.tasksForSelectedDate);
  const [currentTime, setCurrentTime] = useState(new Date());

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(intervalId);
  }, []);

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

  return (
    <div className="day-view-container">
      <Toaster richColors />
      <div ref={scrollContainerRef} className="day-view-scroll-container" style={{ maxHeight: 'calc(100vh - 110px)' }}>
        <div className="day-view-content">
          {presenter.hours.map((hour, hourIdx) => {
            const currentHour = currentTime.getHours();
            return (
              <div
                key={hourIdx}
                ref={hour === currentHour ? currentHourRef : null}
                className={`hour-row ${selectedDate && isToday(selectedDate) && hour === currentHour ? 'hour-row--current' : ''}`}
              >
                <div className="hour-label">{hour === 0 ? '12 AM' : hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`}</div>
                <div className="hour-tasks-container">
                  {tasksForSelectedDate[hour]?.length > 0 ? (
                    tasksForSelectedDate[hour].map((task, idx) => {
                      const uniqueChildColors = [...new Set(task.children.map((child) => child.color).filter(Boolean))];

                      let backgroundStyle: React.CSSProperties = {
                        backgroundColor: '#f3f4f6', // Default background
                        borderColor: '#e5e7eb', // Default border
                      };

                      if (uniqueChildColors.length === 1) {
                        const color = uniqueChildColors[0];
                        backgroundStyle = {
                          backgroundColor: color,
                          borderColor: `color-mix(in srgb, ${color} 70%, #000)`,
                        };
                      } else if (uniqueChildColors.length > 1) {
                        backgroundStyle = {
                          background: `linear-gradient(to right, ${uniqueChildColors.join(', ')})`,
                          borderColor: '#e5e7eb', // Use default border for gradients
                        };
                      }

                      return (
                        <div
                          key={idx}
                          className="task-item" // Removed getTaskColor class
                          style={backgroundStyle} // Apply dynamic background/border
                        >
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
                            </div>
                            <p className="task-time">
                              {task.available_from_time && task.available_to_time
                                ? `${task.available_from_time} - ${task.available_to_time}`
                                : 'Anytime'}
                            </p>
                          </div>

                          {/* Only show status/button when viewing today */}
                          {selectedDate &&
                            isToday(selectedDate) &&
                            (() => {
                              const displayStatus = task.assignment_status || 'pending';

                              // Calculate isPastDue beforehand for relevant statuses
                              let isPastDue = false;
                              if ((displayStatus === 'pending' || displayStatus === 'in_progress') && task.available_to_time) {
                                const [taskHour, taskMinute] = task.available_to_time.split(':').map(Number);
                                const currentHourFromState = currentTime.getHours();
                                const currentMinuteFromState = currentTime.getMinutes();
                                if (currentHourFromState > taskHour || (currentHourFromState === taskHour && currentMinuteFromState >= taskMinute)) {
                                  isPastDue = true;
                                }
                              }

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
                                  // Now use the pre-calculated isPastDue
                                  if (isPastDue) {
                                    return (
                                      <div className="status-chip status-chip--missed">
                                        <XCircle />
                                        <span>Missed</span>
                                      </div>
                                    );
                                  } else {
                                    // Render the regular complete button container
                                    return (
                                      <div className="complete-button-container">
                                        <button
                                          type="button"
                                          className={`complete-button complete-button--active relative`}
                                          onClick={() => {
                                            const childIds = task.children.map((child) => child.id);
                                            if (childIds.length > 0) {
                                              presenter.markTaskComplete(childIds, task.id);
                                            }
                                          }}
                                          title={'Mark Complete'}
                                        >
                                          <CheckIcon />
                                          <span>Complete!</span>
                                          {task.needs_approval && (
                                            <span title="Requires approval" className="absolute -top-2 -right-1">
                                              <ShieldAlert
                                                style={{
                                                  width: '20px',
                                                  padding: '2px',
                                                  height: '20px',
                                                  borderRadius: '50%',
                                                  backgroundColor: '#22c55e',
                                                  color: 'white',
                                                }}
                                              />
                                            </span>
                                          )}
                                        </button>
                                        {task.needs_approval && <span className="approval-helper-text">Requires approval</span>}
                                      </div>
                                    );
                                  }
                              }
                            })()}
                        </div>
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
      </div>
    </div>
  );
};

export default DayView;
