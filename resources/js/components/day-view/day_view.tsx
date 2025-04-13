// Add missing imports
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Task } from '@/types/task';
// Removed useState import, added useEffect and useMemo
import React, { useEffect, useMemo, useRef } from 'react';
import { DayViewPresenter } from './day_view_presenter'; // Import the presenter
// Add missing icon imports
import { useAsyncValue } from '@/hooks/use_async_value';
import { isToday } from 'date-fns'; // Import isToday
import { CheckIcon, ClockIcon, Coins } from 'lucide-react';
import { DDDatePickerField } from '../domain_driven/fields/dd_date_picker_field';

interface DayViewProps {
  currentHourRef: React.RefObject<HTMLDivElement | null>;
  getTaskColor: (taskType: string) => string;
  getRandomEmoji: (taskTitle: string) => string;
  tasks: Task[];
  // Updated signature to allow null/undefined
  getTaskHour: (timeString: string | null | undefined) => number;
}

// Fixed syntax and logical errors in the DayView component
const DayView: React.FC<DayViewProps> = ({ currentHourRef, getTaskColor, getRandomEmoji, tasks, getTaskHour }) => {
  const presenter = useMemo(() => new DayViewPresenter(tasks, getTaskHour), [tasks, getTaskHour]);

  const tasksForSelectedDate = useAsyncValue(presenter.tasksForSelectedDate);
  const selectedDate = useAsyncValue(presenter.selectedDate.state).getValue();
  const currentHour = useMemo(() => new Date().getHours(), []);

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

      inactivityTimeout = setTimeout(handleInactivity, 300000); // 5 minutes in milliseconds
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
  }, [currentHourRef, selectedDate]);

  return (
    <div className="h-full">
      <div className="mb-4">
        <DDDatePickerField domain={presenter.selectedDate} />
      </div>
      <div ref={scrollContainerRef} className="overflow-y-auto rounded-lg border bg-white shadow" style={{ maxHeight: 'calc(100vh - 200px)' }}>
        <div className="p-4">
          <div className="mb-4 flex items-center gap-2">
            {/* Consider a more playful icon */}
            <ClockIcon className="h-5 w-5 text-blue-500" />
            {/* Changed title */}
            <h2 className="text-lg font-semibold">Today's Routine</h2>
          </div>
          <div>
            {presenter.hours.map((hour) => (
              <div
                key={hour}
                ref={hour === currentHour ? currentHourRef : null}
                className={`flex min-h-[50px] items-center border-t border-gray-100 ${selectedDate && isToday(selectedDate) && hour === currentHour ? 'rounded-lg bg-yellow-100 p-1' : ''}`}
              >
                <div className="w-16 pr-4 text-right font-medium">
                  {hour === 0 ? '12 AM' : hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`}
                </div>
                <div className="flex-1">
                  {tasksForSelectedDate[hour]?.length > 0 ? (
                    tasksForSelectedDate[hour].map((task) => (
                      <div key={task.id} className={`my-2 flex items-center rounded-lg p-3 ${getTaskColor(task.type)}`}>
                        <div className="flex -space-x-2">
                          {task.assigned_to.map((child) => (
                            <Avatar key={child.id} className="h-8 w-8 border-2 border-white">
                              <AvatarFallback>{child.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                          ))}
                        </div>
                        <div className="ml-3 flex-1">
                          <div className="flex items-center gap-2">
                            <span>{getRandomEmoji(task.title)}</span>
                            <h3 className="font-medium">{task.title}</h3>
                          </div>
                          <p className="text-sm text-gray-600">
                            {task.available_from_time && task.available_to_time
                              ? `${task.available_from_time} - ${task.available_to_time}`
                              : 'Anytime'}
                          </p>
                        </div>
                        <Button
                          variant="default"
                          size="sm"
                          className="ml-auto flex items-center gap-1 rounded-full bg-green-500 font-bold text-white hover:bg-green-600"
                        >
                          <CheckIcon className="h-4 w-4" />
                          <span>Complete!</span>
                          <span className="ml-1 flex gap-1 rounded-full bg-yellow-400 px-2 py-0.5 text-xs text-black">
                            <Coins className="h-4 w-4" />
                            {task.token_amount}
                          </span>
                        </Button>
                      </div>
                    ))
                  ) : (
                    // Changed "No tasks" text
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
