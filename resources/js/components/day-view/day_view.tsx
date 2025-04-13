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
import { CheckIcon, ClockIcon } from 'lucide-react';
import { DDDatePickerField } from '../domain_driven/fields/dd_date_picker_field';

interface DayViewProps {
  currentHour: number;
  currentHourRef: React.RefObject<HTMLDivElement | null>;
  getTaskColor: (taskType: string) => string;
  getRandomEmoji: (taskTitle: string) => string;
  tasks: Task[];
  // Updated signature to allow null/undefined
  getTaskHour: (timeString: string | null | undefined) => number;
}

// Fixed syntax and logical errors in the DayView component
const DayView: React.FC<DayViewProps> = ({ currentHour, currentHourRef, getTaskColor, getRandomEmoji, tasks, getTaskHour }) => {
  const presenter = useMemo(() => new DayViewPresenter(tasks, getTaskHour), [tasks, getTaskHour]);

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
        console.log('Inactivity detected: User is viewing today. Scrolling to current hour block.');
        scrollToCurrentHour();
      } else {
        console.log('Inactivity detected: User is not viewing today. Setting selected date to today and scrolling to current hour block.');
        presenter.selectedDate.setValue(new Date()); // Set to today's date
        scrollToCurrentHour();
      }
    };

    let inactivityTimeout: NodeJS.Timeout | null = null;

    const resetInactivityTimeout = () => {
      if (inactivityTimeout) {
        clearTimeout(inactivityTimeout);
      }
      console.log('Resetting inactivity timeout.');
      inactivityTimeout = setTimeout(handleInactivity, 10000); // 10 seconds of inactivity for testing
    };

    const handleScroll = () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      console.log('User scrolled. Resetting inactivity timeout.');
      resetInactivityTimeout();
    };

    if (scrollContainer) {
      console.log('Adding scroll event listener.');
      scrollContainer.addEventListener('scroll', handleScroll);
      resetInactivityTimeout();
    }

    return () => {
      if (scrollContainer) {
        console.log('Removing scroll event listener.');
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
            <ClockIcon className="h-5 w-5 text-blue-500" />
            <h2 className="font-semibold">Daily Routines</h2>
          </div>
          <div className="space-y-4">
            {presenter.hours.map((hour) => (
              <div key={hour} ref={hour === currentHour ? currentHourRef : null} className={`flex ${hour === currentHour ? 'bg-yellow-100' : ''}`}>
                <div className="w-16 pr-4 text-right font-medium">{hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`}</div>
                <div className="flex-1">
                  {tasksForSelectedDate[hour]?.length > 0 ? (
                    tasksForSelectedDate[hour].map((task) => (
                      <div key={task.id} className={`mb-2 flex items-start rounded-lg border p-3 ${getTaskColor(task.type)}`}>
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
                        <Button variant="outline" size="sm" className="ml-auto flex items-center gap-1 rounded-full">
                          <CheckIcon className="h-4 w-4" />
                          <span>Complete</span>
                          <span className="ml-1 rounded-full bg-blue-500 px-2 py-0.5 text-xs text-white">{task.token_amount}</span>
                        </Button>
                      </div>
                    ))
                  ) : (
                    <div className="border-t border-gray-100 py-2 text-center text-sm text-gray-400">No tasks</div>
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
