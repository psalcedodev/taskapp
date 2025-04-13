import { Task } from '@/types/task';
import { addDays, addMonths, endOfMonth, endOfWeek, format, isSameDay, isSameMonth, startOfMonth, startOfWeek, subMonths } from 'date-fns';
import React, { useState } from 'react';

interface MonthViewProps {
  tasks: Task[];
  getTaskColor: (taskType: string) => string;
  getRandomEmoji: (taskTitle: string) => string;
}

const MonthView: React.FC<MonthViewProps> = ({ tasks, getTaskColor, getRandomEmoji }) => {
  console.log({ tasks });
  const [selectedDate, setSelectedDate] = useState(new Date());

  const handleMonthChange = (newDate: Date) => {
    setSelectedDate(newDate);
  };

  const startDate = startOfWeek(startOfMonth(selectedDate));
  const endDate = endOfWeek(endOfMonth(selectedDate));

  const days = [];
  let currentDate = startDate;

  while (currentDate <= endDate) {
    days.push(currentDate);
    currentDate = addDays(currentDate, 1);
  }

  const tasksByDate = tasks.reduce<Record<string, Task[]>>((acc, task) => {
    const taskStartDate = new Date(task.start_date);
    const recurrenceEndsOn = new Date(task.recurrence_ends_on);

    // Skip tasks that are inactive or past their recurrence end date
    if (!task.is_active || selectedDate > recurrenceEndsOn) {
      return acc;
    }

    let currentTaskDate = taskStartDate;

    while (currentTaskDate <= recurrenceEndsOn) {
      const taskDayName = format(currentTaskDate, 'EEE'); // Get the day name (e.g., Mon, Tue)

      // Check if the current day matches the task's recurrence days
      if (task.recurrence_days.includes(taskDayName)) {
        const taskDateKey = currentTaskDate.toDateString();

        if (!acc[taskDateKey]) {
          acc[taskDateKey] = [];
        }

        acc[taskDateKey].push(task);
      }

      // Increment the task date assuming all tasks are weekly
      currentTaskDate = addDays(currentTaskDate, 1);
    }

    return acc;
  }, {});

  console.log({ tasksByDate });
  return (
    <div className="h-full w-full">
      {/* Month Selector */}
      <div className="mb-4 flex items-center justify-between">
        <button className="rounded bg-gray-200 px-4 py-2" onClick={() => handleMonthChange(subMonths(selectedDate, 1))}>
          Previous
        </button>
        <h2 className="text-lg font-semibold">{format(selectedDate, 'MMMM yyyy')}</h2>
        <button className="rounded bg-gray-200 px-4 py-2" onClick={() => handleMonthChange(addMonths(selectedDate, 1))}>
          Next
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="grid h-full grid-cols-7 gap-4" style={{ gridAutoRows: '1fr' }}>
        {days.map((day) => (
          <div
            key={day.toDateString()}
            className={`flex flex-col overflow-hidden rounded-lg border p-2 ${isSameMonth(day, selectedDate) ? 'bg-white' : 'bg-gray-100'}`}
            style={{ height: '160px' }} // Set a fixed height for day containers
          >
            <div className={`text-sm font-semibold ${isSameDay(day, new Date()) ? 'text-blue-500' : 'text-gray-800'}`}>{format(day, 'EEE d')}</div>
            <div className="mt-2 flex-grow space-y-1 overflow-y-auto">
              {tasksByDate[day.toDateString()]?.map((task, index) => (
                <div
                  key={task.id}
                  className={`rounded-lg border p-1 text-xs ${getTaskColor(task.type)}`}
                  style={{ display: index < 3 ? 'block' : 'none' }} // Show only the first 3 tasks
                >
                  <span>{getRandomEmoji(task.title)}</span> {task.title}
                </div>
              ))}
              {tasksByDate[day.toDateString()]?.length > 3 && (
                <div className="text-xs text-gray-500">+{tasksByDate[day.toDateString()].length - 3} more</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MonthView;
