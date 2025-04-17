import { useAsyncStatus } from '@/hooks/use_async_status';
import { useAsyncValue } from '@/hooks/use_async_value';
import { isToday } from 'date-fns';
import { Activity } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Toaster } from 'sonner';
// import './day_view.css'; // We won't use the CSS file here
import { DayViewPresenter } from './day_view_presenter';
import { TaskItem } from './task_item';
import { FormattedTask } from './types';

interface DayViewProps {
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
  currentHourRef: React.RefObject<HTMLDivElement | null>;
  presenter: DayViewPresenter;
  selectedDate: Date;
  currentHour: number;
}

const DayViewV2: React.FC<DayViewProps> = ({ presenter, currentHourRef, scrollContainerRef, selectedDate, currentHour }) => {
  // Keeping original data structure for now
  const tasksForSelectedDate = useAsyncValue(presenter.tasksForDateRunner);
  const [currentTime, setCurrentTime] = useState(new Date());
  const { isPending: isTasksPending } = useAsyncStatus(presenter.tasksForDateRunner);
  const [expandedAnytimeTaskId, setExpandedAnytimeTaskId] = useState<number | null>(null);
  const [expandedHourlyTaskId, setExpandedHourlyTaskId] = useState<number | null>(null);

  // --- Mock Anytime Tasks --- START (Same as before)
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
        { id: 1, name: 'Maida', color: '#FDFFB6', avatar: null, token_reward: 10 },
        { id: 2, name: 'Nia', color: '#CAFFBF', avatar: null, token_reward: 5 },
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
      children: [{ id: 1, name: 'Maida', color: '#FDFFB6', avatar: null, token_reward: 15 }],
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
      children: [{ id: 2, name: 'Nia', color: '#CAFFBF', avatar: null, token_reward: 20 }],
    },
  ];
  // --- Mock Anytime Tasks --- END

  const isTodayView = selectedDate && isToday(selectedDate);

  const toggleAnytimeTaskExpansion = (taskId: number) => {
    setExpandedAnytimeTaskId((prev) => (prev === taskId ? null : taskId));
  };

  const toggleHourlyTaskExpansion = (taskId: number) => {
    setExpandedHourlyTaskId((prev) => (prev === taskId ? null : taskId));
  };

  useEffect(() => {
    const intervalId = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(intervalId);
  }, []);

  return (
    // Container with light background
    <div className="h-full bg-[#f8f9fa]">
      <Toaster richColors />
      <div ref={scrollContainerRef} className="relative h-full overflow-y-auto rounded-xl border border-[#e0e0e0] bg-white shadow-md">
        <div className="p-5">
          {mockAnytimeTasks.length > 0 && (
            <div className="mb-6">
              <h3 className="mb-3 flex items-center gap-2 border-b border-[#e5e7eb] pb-2 text-lg font-semibold text-[#374151]">
                <Activity size={18} />
                <span>Anytime Today</span>
              </h3>
              <div className="space-y-3">
                {mockAnytimeTasks.map((task) => (
                  <TaskItem
                    key={`anytime-${task.id}`}
                    task={task}
                    presenter={presenter}
                    isTodayView={isTodayView}
                    currentTime={currentTime}
                    isExpanded={expandedAnytimeTaskId === task.id}
                    onToggleExpansion={toggleAnytimeTaskExpansion}
                    isTasksPending={isTasksPending}
                  />
                ))}
              </div>
            </div>
          )}
          <div>
            {presenter.hours.map((hour, hourIdx) => {
              // Determine if the current hour row should be highlighted
              const isCurrentHourRow = isTodayView && hour === currentTime.getHours();
              return (
                <div
                  key={hourIdx}
                  ref={hour === currentHour ? currentHourRef : null}
                  // Apply Tailwind classes for hour row, including conditional highlight
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
    </div>
  );
};

export default DayViewV2;
