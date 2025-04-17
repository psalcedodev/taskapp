import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAsyncStatus } from '@/hooks/use_async_status';
import { useAsyncValue } from '@/hooks/use_async_value';
import { useConfetti } from '@/hooks/use_confetti';
import { isToday } from 'date-fns';
import { Activity, CheckIcon, ChevronDown, ChevronUp, Coins, Hourglass, ShieldAlert, ThumbsDown, ThumbsUp, XCircle } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Toaster } from 'sonner';
// import './day_view.css'; // We won't use the CSS file here
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
  isTasksPending: boolean;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, presenter, isTodayView, currentTime, isExpanded, onToggleExpansion, isTasksPending }) => {
  const { triggerConfetti } = useConfetti();
  const uniqueChildColors = [...new Set(task.children.map((child) => child.color).filter(Boolean))];
  const hasReward = task.children.some((c) => c.token_reward > 0);

  // --- Dynamic Background Style Calculation (Keep using inline style for this complex part) ---
  let backgroundStyle: React.CSSProperties = { backgroundColor: '#f3f4f6', borderColor: '#e5e7eb' };
  if (uniqueChildColors.length === 1) {
    const color = uniqueChildColors[0];
    backgroundStyle = { backgroundColor: color, borderColor: `color-mix(in srgb, ${color} 70%, #000)` };
  } else if (uniqueChildColors.length > 1) {
    backgroundStyle = { background: `linear-gradient(to right, ${uniqueChildColors.join(', ')})`, borderColor: '#e5e7eb' };
  }
  // --- End Dynamic Background Style Calculation ---

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

  const handleButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    const childIds = task.children.map((child) => child.id);
    if (childIds.length > 0) {
      presenter.markTaskComplete(childIds, task.id, () => triggerConfetti());
    }
  };

  // Combined Tailwind classes for the task item base
  const taskItemClasses = `
    flex flex-wrap p-4 rounded-lg border shadow-sm hover:shadow-md transition-shadow duration-200 ease-in-out cursor-pointer relative
  `;

  return (
    <div
      key={task.id}
      className={taskItemClasses}
      style={backgroundStyle} // Apply dynamic background/border styles
      onClick={() => onToggleExpansion(task.id)}
    >
      {/* Main Content Wrapper - Flex container */}
      <div className="mr-1 flex w-[calc(100%-40px)] min-w-0 grow items-center">
        {' '}
        {/* Adjusted width calculation for indicator space */}
        {/* Avatar Stack */}
        <div className="mr-4 flex flex-shrink-0 -space-x-2.5">
          {' '}
          {/* Adjusted overlap and margin */}
          {task.children.map((child, childIdx) => (
            <Avatar key={childIdx} className="h-9 w-9 overflow-hidden rounded-full border-2 border-white bg-[#e0e0e0] shadow-sm">
              <AvatarFallback className="text-sm font-medium text-[#4f4f4f]">{child.name.charAt(0)}</AvatarFallback>
            </Avatar>
          ))}
        </div>
        {/* Task Details */}
        <div className="mr-2 min-w-0 grow">
          {' '}
          {/* Added margin */}
          <div className="mb-0.5 flex items-center gap-2">
            {' '}
            {/* Reduced bottom margin */}
            <h3 className="truncate text-base font-semibold text-[#333333]">{task.title}</h3>
            {hasReward && <Coins size={16} className="ml-2 inline-block align-middle text-[#fbbf24]" />}
          </div>
          <p className="text-sm leading-tight text-[#5f6368]">
            {task.available_from_time && task.available_to_time ? `${task.available_from_time} - ${task.available_to_time}` : 'Anytime'}
          </p>
        </div>
        {/* Status/Button Logic - Tailwind Styled - Placed outside details, aligned right */}
        <div className="ml-auto flex-shrink-0 self-center">
          {' '}
          {/* Align self center vertically */}
          {isTodayView &&
            (() => {
              const chipBase = 'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium border'; // Adjusted gap
              switch (displayStatus) {
                case 'completed':
                case 'approved':
                  return (
                    <div className={`${chipBase} border-[#c7e8d8] bg-[#e7f5ec] text-[#1e8e3e]`}>
                      <ThumbsUp className="h-3.5 w-3.5" />
                      <span>Done!</span>
                    </div>
                  );
                case 'pending_approval':
                  return (
                    <div className={`${chipBase} animate-[pulse-border_2s_infinite] border-[#ffecb3] bg-[#fff8e1] text-[#e67e22]`}>
                      <Hourglass className="h-3.5 w-3.5" />
                      <span>Pending Approval</span>
                    </div>
                  );
                case 'rejected':
                  return (
                    <div className={`${chipBase} border-[#f7cacc] bg-[#fce8e6] text-[#d93025]`}>
                      <ThumbsDown className="h-3.5 w-3.5" />
                      <span>Needs Review</span>
                    </div>
                  );
                case 'in_progress': // Example status chip (can add if needed)
                // return (<div className={`${chipBase} bg-[#e8f0fe] text-[#1a73e8] border-[#d2e3fc]`}><Activity className="h-3.5 w-3.5"/><span>In Progress</span></div>);
                case 'pending':
                  return isPastDue ? (
                    <div className={`${chipBase} border-[#e8eaed] bg-[#f1f3f4] text-[#5f6368]`}>
                      <XCircle className="h-3.5 w-3.5" />
                      <span>Missed</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-end">
                      {' '}
                      {/* Button Container */}
                      <button
                        type="button"
                        className="relative inline-flex items-center gap-1 rounded-md bg-[#2ecc71] px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-[#27ae60] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2ecc71] disabled:cursor-not-allowed disabled:opacity-50"
                        onClick={handleButtonClick}
                        title={'Mark Complete'}
                        disabled={isTasksPending}
                      >
                        {' '}
                        {/* Added disabled state */}
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
                                backgroundColor: '#22c55e',
                                color: 'white',
                              }}
                            />
                          </span>
                        )}
                      </button>
                      {task.needs_approval && <span className="mt-0.5 text-right text-xs text-[#5f6368]">Requires approval</span>}
                    </div>
                  );
              }
            })()}
        </div>
      </div>{' '}
      {/* End Main Content Wrapper */}
      {/* Expansion Indicator Icon - Positioned absolute within relative parent */}
      <div
        className="absolute top-3 right-3 flex h-[24px] w-[24px] cursor-pointer items-center justify-center text-[#6b7280]"
        onClick={(e) => {
          e.stopPropagation();
          onToggleExpansion(task.id);
        }}
      >
        {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </div>
      {/* Conditionally Rendered Details Section */}
      <div className={`transition-max-height w-full overflow-hidden duration-300 ease-in-out ${isExpanded ? 'max-h-[500px]' : 'max-h-0'}`}>
        {' '}
        {/* Use conditional max-h */}
        <div className="mt-2 pt-2">
          {' '}
          {/* Inner container for padding */}
          <hr className="my-2 border-t border-[#e5e7eb]" />
          {task.description && <p className="mb-3 text-sm text-[#4b5563]">{task.description}</p>}
          <div className="text-sm text-[#4b5563]">
            <strong className="font-semibold text-[#374151]">Token Rewards:</strong>
            <ul className="mt-1">
              {task.children.map((child) => (
                <li key={child.id} className="pl-4">
                  {child.name}: {child.token_reward} tokens
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div> // End Task Item
  );
};
// --- Reusable TaskItem Component --- END

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
      {/* Scrollable Container */}
      <div ref={scrollContainerRef} className="relative h-full overflow-y-auto rounded-xl border border-[#e0e0e0] bg-white shadow-md">
        {isTasksPending ? (
          // Loading State
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/75">
            <svg className="h-8 w-8 animate-spin text-[#3b82f6]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </div>
        ) : (
          // Main Content Area
          <div className="p-5">
            {' '}
            {/* Padding for content */}
            {/* Anytime Tasks Section */}
            {mockAnytimeTasks.length > 0 && (
              <div className="mb-6">
                {' '}
                {/* Spacing below anytime section */}
                <h3 className="mb-3 flex items-center gap-2 border-b border-[#e5e7eb] pb-2 text-lg font-semibold text-[#374151]">
                  <Activity size={18} />
                  <span>Anytime Today</span>
                </h3>
                <div className="space-y-3">
                  {' '}
                  {/* Vertical spacing for anytime tasks */}
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
            {/* Hourly Tasks Section */}
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
                    {/* Current hour indicator line */}
                    {isCurrentHourRow && <div className="absolute top-0 bottom-0 left-0 w-1 rounded-l-lg bg-[#5c9ced]"></div>}

                    {/* Hour Label */}
                    <div className="w-16 flex-shrink-0 pt-3 pr-4 text-right text-sm font-semibold text-[#4f4f4f]">
                      {hour === 0 ? '12 AM' : hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`}
                    </div>
                    {/* Tasks Container for the hour */}
                    <div className="grow space-y-3 border-l border-[#eeeeee] pt-2 pb-2 pl-4">
                      {' '}
                      {/* Added space-y for tasks */}
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
                        // Empty Slot styling
                        <div className="flex h-full items-center justify-center py-4 text-sm text-[#bdbdbd] italic">Free Time! ✨</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DayViewV2;
