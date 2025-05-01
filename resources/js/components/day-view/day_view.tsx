/**
 * Day View Component
 *
 * A daily schedule view that displays tasks in an hourly timeline format.
 * Provides real-time tracking of current hour, task completion status,
 * and interactive task management.
 */

import { useAsyncStatus } from '@/hooks/use_async_status';
import { useAsyncValue } from '@/hooks/use_async_value';
import { isToday } from 'date-fns';
import React, { useEffect, useState } from 'react';
import { DayViewPresenter } from './day_view_presenter';
import { TaskItem } from './task_item';
import { FormattedTask } from './types';

interface DayViewProps {
  /** Reference to the scroll container for programmatic scrolling */
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
  /** Reference to track the current hour's DOM element */
  currentHourRef: React.RefObject<HTMLDivElement | null>;
  /** Presenter instance managing the day view logic and state */
  presenter: DayViewPresenter;
  /** Currently selected date to display tasks for */
  selectedDate: Date;
  /** Current hour of the day (0-23) */
  currentHour: number;
  /** Callback to refresh family children data */
  getFamilyChildren: () => void;
}

/**
 * DayView Component
 *
 * Features:
 * - 24-hour timeline display
 * - Real-time current hour highlighting
 * - Expandable task details
 * - Task completion tracking
 * - Empty hour indicators
 * - Automatic scrolling to current hour
 */
export const DayView: React.FC<DayViewProps> = ({ presenter, currentHourRef, scrollContainerRef, selectedDate, currentHour, getFamilyChildren }) => {
  const tasksForSelectedDate = useAsyncValue(presenter.tasksForDateRunner);
  const [currentTime, setCurrentTime] = useState(new Date());
  const { isPending: isTasksPending } = useAsyncStatus(presenter.tasksForDateRunner);
  const [expandedHourlyTaskId, setExpandedHourlyTaskId] = useState<number | null>(null);
  const isTodayView = selectedDate && isToday(selectedDate);
  const toggleHourlyTaskExpansion = (taskId: number) => {
    setExpandedHourlyTaskId((prev) => (prev === taskId ? null : taskId));
  };
  useEffect(() => {
    const intervalId = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(intervalId);
  }, []);

  console.log({ tasksForSelectedDate });
  return (
    <div className="relative h-full overflow-y-auto">
      <div className="py-5 pr-5">
        <div>
          {presenter.hours.map((hour, hourIdx) => {
            const isCurrentHourRow = isTodayView && hour === currentTime.getHours();
            return (
              <div
                key={hourIdx}
                ref={hour === currentHour ? currentHourRef : null}
                className={`flex min-h-[60px] border-[#eeeeee] ${hourIdx === 0 ? 'border-t-0' : 'border-t'} ${isCurrentHourRow ? 'relative z-10 -mx-5 rounded-lg border-t-transparent bg-[#eef6ff] px-5' : ''}`}
              >
                {isCurrentHourRow && <div className="absolute top-0 bottom-0 left-0 w-1 rounded-l-lg bg-[#5c9ced]"></div>}

                <div className="w-16 flex-shrink-0 pt-3 pr-4 text-right text-sm font-semibold text-[#4f4f4f]">
                  {hour === 0 ? '12 AM' : hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`}
                </div>
                <div className="grow space-y-3 border-l border-[#eeeeee] pt-2 pb-2 pl-4">
                  {tasksForSelectedDate[hour]?.length > 0 ? (
                    tasksForSelectedDate[hour].map((task: FormattedTask) => (
                      <TaskItem
                        key={`hourly-${task.id}`}
                        task={task}
                        presenter={presenter}
                        isTodayView={isTodayView}
                        currentTime={currentTime}
                        isExpanded={expandedHourlyTaskId === task.id}
                        onToggleExpansion={toggleHourlyTaskExpansion}
                        isTasksPending={isTasksPending}
                        getFamilyChildren={getFamilyChildren}
                      />
                    ))
                  ) : (
                    <div className="flex h-full items-center justify-center py-4 text-sm text-[#bdbdbd] italic">Free Time! ✨</div>
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
