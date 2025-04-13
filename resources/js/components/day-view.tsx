import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Task } from '@/types/task';
import { format } from 'date-fns';
import { CalendarIcon, CheckIcon, ClockIcon } from 'lucide-react';
import React, { useState } from 'react';

interface DayViewProps {
  today: Date;
  hours: number[];
  currentHour: number;
  currentHourRef: React.RefObject<HTMLDivElement | null>;
  getTaskColor: (taskType: string) => string;
  getRandomEmoji: (taskTitle: string) => string;
  tasks: Task[];
  getTaskHour: (timeString: string) => number;
}

const DayView: React.FC<DayViewProps> = ({ today, hours, currentHour, currentHourRef, getTaskColor, getRandomEmoji, tasks, getTaskHour }) => {
  const [selectedDate, setSelectedDate] = useState(today);

  const tasksForSelectedDate = hours.reduce(
    (hourAcc, hour) => {
      hourAcc[hour] = tasks.filter((task) => {
        const taskDate = new Date(task.start_date);
        const isInDateRange = selectedDate >= taskDate && selectedDate <= task.recurrence_ends_on;

        // Normalize day of week for comparison
        const selectedDayOfWeek = selectedDate.toLocaleDateString('en-US', { weekday: 'short' });
        const matchesRecurrence = task.recurrence_days.includes(selectedDayOfWeek);

        // Compare task hour correctly
        const taskHour = getTaskHour(task.available_from_time);
        const matchesHour = taskHour === hour;

        return isInDateRange && matchesRecurrence && matchesHour;
      });
      return hourAcc;
    },
    {} as Record<number, Task[]>,
  );

  return (
    <div className="timeline-container rounded-lg border bg-white shadow">
      <div className="p-4">
        {/* Section Title */}
        <div className="mb-4 flex items-center gap-2">
          <ClockIcon className="h-5 w-5 text-blue-500" />
          <h2 className="font-semibold">Daily Routines</h2>
        </div>

        {/* ShadCN Date Picker */}
        <div className="mb-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant={'outline'} className={cn('w-[280px] justify-start text-left font-normal', !selectedDate && 'text-muted-foreground')}>
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? format(selectedDate, 'PPP') : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => {
                  if (date) {
                    date.setHours(0, 0, 0, 0); // Ensure time is reset to midnight
                    setSelectedDate(date);
                  }
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Time Slots */}
        <div className="space-y-4">
          {hours.map((hour) => (
            <div
              key={hour}
              ref={hour === currentHour ? currentHourRef : null} // Attach ref to the current hour block
              className={`flex ${hour === currentHour ? 'bg-yellow-100' : ''}`} // Highlight the current hour block
            >
              {/* Hour Label */}
              <div className="w-16 pr-4 text-right font-medium">{hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`}</div>

              {/* Task Container */}
              <div className="flex-1">
                {tasksForSelectedDate[hour]?.length > 0 ? (
                  tasksForSelectedDate[hour].map((task) => (
                    <div key={task.id} className={`mb-2 flex items-start rounded-lg border p-3 ${getTaskColor(task.type)}`}>
                      {/* Task Assignees */}
                      <div className="flex -space-x-2">
                        {task.assigned_to.map((child) => (
                          <Avatar key={child.id} className="h-8 w-8 border-2 border-white">
                            <AvatarFallback>{child.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                        ))}
                      </div>

                      {/* Task Details */}
                      <div className="ml-3 flex-1">
                        <div className="flex items-center gap-2">
                          <span>{getRandomEmoji(task.title)}</span>
                          <h3 className="font-medium">{task.title}</h3>
                        </div>
                        <p className="text-sm text-gray-600">
                          {task.available_from_time && task.available_to_time ? `${task.available_from_time} - ${task.available_to_time}` : 'Anytime'}
                        </p>
                      </div>

                      {/* Complete Button */}
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
  );
};

export default DayView;
