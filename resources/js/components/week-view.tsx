import { Task } from '@/types/task';
import { addDays, format, subDays } from 'date-fns';
import { ClockIcon } from 'lucide-react';
import React, { useState } from 'react';

interface WeekViewProps {
  tasks: Task[];
  weekDays: Date[];
  hours: number[];
  getTaskColor: (taskType: string) => string;
  getRandomEmoji: (taskTitle: string) => string;
}

const WeekView: React.FC<WeekViewProps> = ({ tasks, weekDays, hours, getTaskColor, getRandomEmoji }) => {
  interface WeeklyData {
    [date: string]: {
      [hour: number]: Task[];
    };
  }

  const generateWeeklyData = (tasks: Task[], weekStart: Date): WeeklyData => {
    const weekData: WeeklyData = {};

    for (let i = 0; i < 7; i++) {
      const currentDay = addDays(weekStart, i);
      const dayKey = currentDay.toDateString();
      weekData[dayKey] = {};

      for (let hour = 0; hour < 24; hour++) {
        weekData[dayKey][hour] = [];
      }
    }

    tasks.forEach((task) => {
      const taskStartDate = new Date(task.start_date);
      const recurrenceEndsOn = new Date(task.recurrence_ends_on);

      if (!task.is_active || weekStart > recurrenceEndsOn) {
        return;
      }

      let currentTaskDate = taskStartDate;

      while (currentTaskDate <= recurrenceEndsOn) {
        const taskDayName = format(currentTaskDate, 'EEE');

        if (task.recurrence_days.includes(taskDayName)) {
          const taskDateKey = currentTaskDate.toDateString();

          if (weekData[taskDateKey]) {
            const taskHour = task.available_from_time ? parseInt(task.available_from_time.split(':')[0], 10) : 0;
            weekData[taskDateKey][taskHour].push(task);
          }
        }

        currentTaskDate = addDays(currentTaskDate, 1);
      }
    });

    return weekData;
  };

  const [currentWeekStart, setCurrentWeekStart] = useState(new Date());
  const [weeklyData, setWeeklyData] = useState(generateWeeklyData(tasks, currentWeekStart));

  const handleWeekChange = (direction: 'prev' | 'next') => {
    const newWeekStart = direction === 'prev' ? subDays(currentWeekStart, 7) : addDays(currentWeekStart, 7);
    setCurrentWeekStart(newWeekStart);
    setWeeklyData(generateWeeklyData(tasks, newWeekStart));
  };

  const updatedWeekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));

  return (
    <div className="timeline-container rounded-lg border bg-white shadow">
      <div className="p-4">
        {/* Section Title */}
        <div className="mb-4 flex items-center gap-2">
          <ClockIcon className="h-5 w-5 text-blue-500" />
          <h2 className="font-semibold">Weekly Overview</h2>
        </div>

        {/* Week Selector */}
        <div className="mb-4 flex items-center justify-between">
          <button className="rounded bg-gray-200 px-4 py-2" onClick={() => handleWeekChange('prev')}>
            Previous Week
          </button>
          <h2 className="text-lg font-semibold">
            {format(currentWeekStart, 'MMM d')} - {format(addDays(currentWeekStart, 6), 'MMM d, yyyy')}
          </h2>
          <button className="rounded bg-gray-200 px-4 py-2" onClick={() => handleWeekChange('next')}>
            Next Week
          </button>
        </div>

        {/* Week View */}
        <div className="grid grid-cols-7 gap-4">
          {updatedWeekDays.map((day) => (
            <div key={day.toDateString()} className="overflow-hidden rounded-lg border p-4" style={{ maxHeight: '100%', overflowY: 'auto' }}>
              <h3 className="mb-2 text-lg font-semibold">{format(day, 'EEEE, MMM d')}</h3>
              {hours.map(
                (hour) =>
                  weeklyData[day.toDateString()]?.[hour]?.length > 0 && (
                    <div key={hour} className="mb-2">
                      <div className="text-sm font-medium text-gray-600">{hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`}</div>
                      <div className="mt-1 space-y-1">
                        {weeklyData[day.toDateString()][hour].map((task) => (
                          <div key={task.id} className={`rounded-lg border p-2 ${getTaskColor(task.type)}`}>
                            <div className="flex items-center gap-2">
                              <span>{getRandomEmoji(task.title)}</span>
                              <h4 className="truncate font-medium">{task.title}</h4>
                            </div>
                            <p className="text-xs text-gray-600">
                              {task.available_from_time && task.available_to_time
                                ? `${task.available_from_time} - ${task.available_to_time}`
                                : 'Anytime'}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ),
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WeekView;
