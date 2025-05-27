/**
 * Day View Component
 *
 * A daily schedule view that displays tasks in an hourly timeline format.
 * Provides real-time tracking of current hour, task completion status,
 * and interactive task management.
 */

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
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

  // Helper to safely get tasks for an hour
  const getTasksForHour = (hour: number): FormattedTask[] => {
    return (tasksForSelectedDate && tasksForSelectedDate.hourlyTasks && tasksForSelectedDate.hourlyTasks[hour]) || [];
  };

  // Accordion state for anytime tasks
  const anytimeTasks = tasksForSelectedDate?.anytimeTasks || [];
  const anytimeCompleted = anytimeTasks.filter((task) => task.assignment_status === 'completed' || task.assignment_status === 'approved').length;
  const anytimeTotal = anytimeTasks.length;
  // Open by default if not all completed
  const [accordionValue, setAccordionValue] = useState<string[]>(anytimeTotal > 0 && anytimeCompleted !== anytimeTotal ? ['anytime'] : []);
  useEffect(() => {
    if (anytimeTotal > 0 && anytimeCompleted === anytimeTotal) {
      setAccordionValue([]);
    } else if (anytimeTotal > 0 && anytimeCompleted !== anytimeTotal) {
      setAccordionValue(['anytime']);
    }
  }, [anytimeCompleted, anytimeTotal]);

  return (
    <div className="relative h-full overflow-y-auto">
      <div className="py-5 pr-5">
        {/* Modern Anytime Tasks Accordion at the top */}
        {anytimeTotal > 0 && (
          <div className="mx-2 mb-4">
            <Accordion
              type="multiple"
              value={accordionValue}
              onValueChange={setAccordionValue}
              className="w-full rounded-xl border border-gray-200 bg-white shadow-sm"
            >
              <AccordionItem value="anytime" className="overflow-hidden rounded-xl border-none">
                <AccordionTrigger className="flex items-center justify-between gap-2 border-b border-gray-200 px-6 py-3 text-base font-semibold text-gray-800">
                  <span className="flex items-center gap-2">
                    <span className="font-bold text-gray-900">Anytime Tasks</span>
                    <span className="text-sm font-medium text-gray-500">
                      ({anytimeCompleted} completed / {anytimeTotal} total)
                    </span>
                  </span>
                </AccordionTrigger>
                <AccordionContent className="space-y-3 rounded-b-xl bg-white px-6 pt-3 pb-4 transition-all duration-300">
                  {anytimeTasks.map((task: FormattedTask) => (
                    <TaskItem
                      key={`anytime-${task.id}`}
                      task={task}
                      presenter={presenter}
                      isTodayView={isTodayView}
                      currentTime={currentTime}
                      isExpanded={expandedHourlyTaskId === task.id}
                      onToggleExpansion={toggleHourlyTaskExpansion}
                      isTasksPending={isTasksPending}
                      getFamilyChildren={getFamilyChildren}
                    />
                  ))}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        )}
        {/* Hourly timeline below */}
        <div>
          {presenter.hours.map((hour, hourIdx) => {
            const isCurrentHourRow = isTodayView && hour === currentTime.getHours();
            const tasksForHour = getTasksForHour(hour);
            const hasTasks = tasksForHour.length > 0;
            return (
              <div
                key={hourIdx}
                ref={hour === currentHour ? currentHourRef : null}
                className={`flex ${hasTasks ? 'min-h-[60px]' : 'min-h-[32px]'} border-[#eeeeee] ${hourIdx === 0 ? 'border-t-0' : 'border-t'} ${isCurrentHourRow ? 'relative z-10 -mx-5 rounded-lg border-t-transparent bg-[#eef6ff] px-5' : ''}`}
              >
                {isCurrentHourRow && <div className="absolute top-0 bottom-0 left-0 w-1 rounded-l-lg bg-[#5c9ced]"></div>}

                <div className="flex w-16 flex-shrink-0 items-center justify-center text-sm font-semibold text-[#4f4f4f]">
                  {hour === 0 ? '12 AM' : hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`}
                </div>
                <div className="grow space-y-3 border-l border-[#eeeeee] pt-2 pb-2 pl-4">
                  {hasTasks
                    ? tasksForHour.map((task: FormattedTask) => (
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
                    : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
