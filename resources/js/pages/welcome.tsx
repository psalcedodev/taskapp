import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { format, isSameDay, parse } from 'date-fns';
import { MoonIcon, SunIcon, SunriseIcon } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Task } from '../types/task';
import { User } from '../types/user';
import { tasks } from './tasks';
import { TimelineTaskCard } from './timeline_task_card';
import { users } from './users';

export const TimelineView = () => {
  const timelineRef = useRef<HTMLDivElement>(null);
  // State for the calculated indicator position
  const [dynamicTimeIndicatorTop, setDynamicTimeIndicatorTop] = useState<number | null>(null);
  // --- Mock Time State ---
  const [mockCurrentTime, setMockCurrentTime] = useState<Date | null>(null);

  // Determine the time to use (mock or real)
  const now = useMemo(() => mockCurrentTime || new Date(), [mockCurrentTime]);

  const onCompleteTask = (taskId: string, userId: string) => {
    console.log('onCompleteTask', taskId, userId);
  };

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Filter tasks for the selected date
  const filteredTasks = useMemo(() => {
    if (isSameDay(selectedDate, new Date())) {
      return tasks;
    }
    return [];
  }, [tasks, selectedDate]);

  // Scroll to current time on initial load
  useEffect(() => {
    if (timelineRef.current && isSameDay(selectedDate, now)) {
      const currentHour = now.getHours();

      // Find the DOM element for the current hour
      const currentHourElement = document.getElementById(`hour-${currentHour}`);

      if (currentHourElement) {
        // Scroll the element into the vertical center of the view
        currentHourElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center', // Try to center the hour block vertically
        });
      } else {
        // Updated fallback scroll calculation (offset is just currentHour)
        const scrollPosition = currentHour * 100;
        timelineRef.current.scrollTo({
          top: Math.max(0, scrollPosition - 200), // Attempt to center roughly
          behavior: 'smooth',
        });
      }
    }
  }, [selectedDate, now]);

  // Generate timeline hours (0 AM to 11 PM)
  const timelineHours = Array.from({ length: 24 }, (_, i) => i); // 0 to 23

  // Group tasks by hour
  const tasksByHour: Record<number, Task[]> = {};

  filteredTasks.forEach((task) => {
    try {
      const startTime = parse(task.visibleTime.start, 'HH:mm', new Date());
      const hour = startTime.getHours();

      if (!tasksByHour[hour]) {
        tasksByHour[hour] = [];
      }

      tasksByHour[hour].push(task);
    } catch (error) {
      // Skip tasks with invalid time format
    }
  });

  // Get time period (updated for 0-23 range)
  const getTimePeriod = (hour: number) => {
    if (hour >= 0 && hour < 6) return { name: 'Night', icon: <MoonIcon /> }; // 12 AM - 5 AM
    if (hour >= 6 && hour < 12) return { name: 'Morning', icon: <SunriseIcon /> }; // 6 AM - 11 AM
    if (hour >= 12 && hour < 17) return { name: 'Afternoon', icon: <SunIcon /> }; // 12 PM - 4 PM
    if (hour >= 17 && hour < 24) return { name: 'Evening', icon: <MoonIcon /> }; // 5 PM - 11 PM
    return { name: '', icon: <></> }; // Fallback
  };

  // Get user by ID
  const getUserById = (userId: string): User | undefined => {
    return users.find((user) => user.id === userId);
  };

  // Group tasks by time within an hour
  const groupTasksByTime = (tasksInHour: Task[]) => {
    const taskGroups: Record<string, Task[]> = {};

    tasksInHour.forEach((task) => {
      const timeKey = task.visibleTime?.start;

      if (timeKey) {
        if (!taskGroups[timeKey]) {
          taskGroups[timeKey] = [];
        }

        taskGroups[timeKey].push(task);
      }
    });

    // Sort the groups by time
    return Object.entries(taskGroups)
      .sort(([timeA], [timeB]) => {
        try {
          const parsedTimeA = parse(timeA, 'HH:mm', new Date());
          const parsedTimeB = parse(timeB, 'HH:mm', new Date());
          return parsedTimeA.getTime() - parsedTimeB.getTime();
        } catch {
          return 0; // Handle potential parsing errors during sort
        }
      })
      .map(([time, tasks]) => ({ time, tasks }));
  };

  // Determine which hours should show period headers (updated)
  const shouldShowPeriodHeader = (hour: number): boolean => {
    return hour === 0 || hour === 6 || hour === 12 || hour === 17;
  };

  // Effect to calculate dynamic indicator position
  useEffect(() => {
    if (!isSameDay(selectedDate, now) || !timelineRef.current) {
      setDynamicTimeIndicatorTop(null);
      return;
    }

    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    // Find the DOM element for the current hour block
    const currentHourElement = document.getElementById(`hour-${currentHour}`);
    if (!currentHourElement) {
      setDynamicTimeIndicatorTop(null);
      return;
    }

    // Get the top offset of the current hour block relative to the timeline container
    const hourBlockTop = currentHourElement.offsetTop;
    // Get the actual height of the current hour block
    const hourBlockHeight = currentHourElement.offsetHeight;

    // Calculate the minute proportion within the *actual* height
    const minuteOffset = (currentMinute / 60) * hourBlockHeight;

    // Calculate the final top position
    const newTop = hourBlockTop + minuteOffset;
    setDynamicTimeIndicatorTop(newTop);

    // Dependency: Re-run if selectedDate changes or filteredTasks change (if tasks can be dynamic)
  }, [selectedDate, filteredTasks, now]); // Add filteredTasks if it can change and affect layout

  // --- Debug Time Handlers ---
  const setMockTimeTo = (hour: number, minute: number) => {
    const today = new Date(); // Use today's date
    setMockCurrentTime(new Date(today.getFullYear(), today.getMonth(), today.getDate(), hour, minute));
  };
  const clearMockTime = () => {
    setMockCurrentTime(null);
  };

  return (
    <>
      {/* --- DEBUG CONTROLS --- */}
      <div className="mb-2 flex flex-wrap items-center gap-2 border-b p-2">
        <span className="text-sm font-medium">Debug Time:</span>
        <Button variant="outline" size="sm" onClick={() => setMockTimeTo(7, 30)}>
          Set 7:30 AM
        </Button>
        <Button variant="outline" size="sm" onClick={() => setMockTimeTo(9, 30)}>
          Set 9:30 AM
        </Button>
        <Button variant="outline" size="sm" onClick={() => setMockTimeTo(14, 0)}>
          Set 2:00 PM
        </Button>
        <Button variant="outline" size="sm" onClick={() => setMockTimeTo(15, 0)}>
          Set 3:00 PM
        </Button>
        <Button variant="outline" size="sm" onClick={() => setMockTimeTo(20, 10)}>
          Set 8:10 PM
        </Button>
        <Button variant="outline" size="sm" onClick={() => setMockTimeTo(20, 15)}>
          Set 8:15 PM
        </Button>
        <Button variant="outline" size="sm" onClick={() => setMockTimeTo(20, 20)}>
          Set 8:20 PM
        </Button>
        <Button variant="outline" size="sm" onClick={() => setMockTimeTo(20, 30)}>
          Set 8:30 PM
        </Button>
        <Button variant="outline" size="sm" onClick={() => setMockTimeTo(22, 45)}>
          Set 10:45 PM
        </Button>
        <Button variant="destructive" size="sm" onClick={clearMockTime} disabled={!mockCurrentTime}>
          Use Real Time
        </Button>
        {mockCurrentTime && <span className="text-sm text-red-600">(Using Mock Time: {format(mockCurrentTime, 'h:mm a')})</span>}
      </div>

      <Card className="h-full w-full">
        <CardContent className="h-full p-0">
          <div className="relative h-[calc(100vh-300px)] overflow-y-auto" ref={timelineRef}>
            <div className="relative min-h-[2400px]">
              {/* Timeline Hours and Tasks */}
              {timelineHours.map((hour) => {
                const period = getTimePeriod(hour);
                const showPeriodHeader = shouldShowPeriodHeader(hour);
                const hourTasks = tasksByHour[hour] || [];
                const taskGroups = groupTasksByTime(hourTasks);
                const hourHeight = Math.max(100, taskGroups.length * 80);

                // Check if this hour block is the current hour and if it's today
                const currentHourNow = now.getHours();
                const isToday = isSameDay(selectedDate, now);
                const isCurrentHourBlock = hour === currentHourNow && isToday;

                return (
                  <div
                    key={hour}
                    className={cn(
                      'relative',
                      isCurrentHourBlock && 'bg-muted/50', // Apply highlight class
                    )}
                    id={`hour-${hour}`}
                  >
                    {/* Render sticky period header */}
                    {showPeriodHeader && (
                      <div className="bg-background sticky top-0 z-20 border-t border-b py-2">
                        <div className="flex items-center gap-2 px-4">
                          {period.icon}
                          <h3 className="font-semibold">{period.name} Routines</h3>
                        </div>
                      </div>
                    )}

                    <div className="relative flex items-start" style={{ minHeight: `${hourHeight}px` }}>
                      {/* Hour marker */}
                      <div className="flex w-16 flex-shrink-0 flex-col items-center pt-2">
                        <div className="text-sm font-medium">
                          {hour === 0 ? '12 AM' : hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`}
                        </div>
                        <div className="border-default-200 mt-2 h-full border-r border-dashed"></div>
                      </div>

                      {/* Tasks for this hour */}
                      <div className="relative h-full flex-grow py-2 pr-4">
                        {taskGroups.length > 0 ? (
                          <div className="space-y-4">
                            {taskGroups.map(({ time, tasks: tasksAtTime }) => (
                              <div key={time} className="relative">
                                {/* Added check for time existence before formatting */}
                                {time && (
                                  <div className="text-default-500 mb-1 text-xs font-medium">
                                    {format(parse(time, 'HH:mm', new Date()), 'h:mm a')}
                                  </div>
                                )}
                                <div className="flex w-full flex-col gap-2">
                                  {tasksAtTime.map((task, index) => {
                                    const taskUsers = Array.isArray(task.assignedTo)
                                      ? (task.assignedTo.map((id) => getUserById(id)).filter(Boolean) as User[])
                                      : ([getUserById(task.assignedTo)].filter(Boolean) as User[]);
                                    const userId = Array.isArray(task.assignedTo) ? task.assignedTo[0] : task.assignedTo;

                                    return (
                                      <TimelineTaskCard
                                        key={task.id}
                                        task={task}
                                        users={taskUsers}
                                        zIndex={tasksAtTime.length - index}
                                        onComplete={() => userId && onCompleteTask(task.id, userId)}
                                      />
                                    );
                                  })}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="flex h-full items-center">
                            <span className="text-default-400 text-xs italic">No tasks</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default TimelineView;
