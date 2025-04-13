import DayView from '@/components/day-view';
import { Button } from '@/components/ui/button';
import { mockTasks } from '@/pages/parent/tasks/types'; // Import mock tasks
import { Task } from '@/types/task';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import React, { useRef, useState } from 'react';

const TaskView: React.FC = () => {
  const [tasks] = useState<Task[]>(mockTasks); // Use mock tasks as initial state
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('day'); // State to manage view mode
  const today = new Date();
  const currentHour = today.getHours(); // Use test hour if set, otherwise current hour
  const currentHourRef = useRef<HTMLDivElement>(null); // Ref to the current hour block

  // Generate hours for the day (5 AM to 11 PM in the example)
  const hours = Array.from({ length: 19 }, (_, i) => i + 5); // 5 AM to 11 PM

  // Adjust weekDays to start from Monday to Sunday
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today);
    date.setDate(today.getDate() - today.getDay() + 1 + i); // Adjust to start from Monday
    return date;
  });

  // Parse time string and get hour
  const getTaskHour = (timeString: string) => {
    if (!timeString) return 8; // Default to 8 AM if no time
    const [hours] = timeString.split(':');
    return parseInt(hours, 10);
  };

  // Add detailed debugging to identify why tasks are not appearing
  weekDays.forEach((day) => {
    const dayKey = day.toDateString();
    const dayOfWeek = day.toLocaleDateString('en-US', { weekday: 'short' });

    hours.forEach((hour) => {
      const tasksForHour = tasks.filter((task) => {
        const taskDate = new Date(task.start_date);
        const isInDateRange = day >= taskDate && day <= task.recurrence_ends_on;
        const matchesRecurrence = task.recurrence_days.includes(dayOfWeek);
        const matchesHour = getTaskHour(task.available_from_time) === hour;

        return isInDateRange && matchesRecurrence && matchesHour;
      });

      if (tasksForHour.length > 0) {
        console.log(`Tasks for ${dayKey} at ${hour}:`, tasksForHour);
      }
    });
  });

  const getTaskColor = (taskType: string) => {
    switch (taskType) {
      case 'routine':
        return 'bg-blue-100 border-blue-200';
      case 'challenge':
        return 'bg-purple-100 border-purple-200';
      default:
        return 'bg-gray-100 border-gray-200';
    }
  };

  const getRandomEmoji = (taskTitle: string) => {
    const emojis = ['📚', '🧹', '🍽️', '🛏️', '🧸', '📱', '🎮', '🧠', '🏃‍♂️', '🥗', '🧼', '📝', '🎵', '✏️'];
    // Use the title to consistently select the same emoji for a given task
    const index = taskTitle.charCodeAt(0) % emojis.length;
    return emojis[index];
  };

  return (
    <div className="container mx-auto h-full p-4">
      {/* Header Section */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">My Adventure Board! 🚀</h1>
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <CalendarIcon className="mr-1 h-4 w-4" />
              {format(today, 'EEEE, MMMM d, yyyy')}
            </Button>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className={viewMode === 'day' ? 'bg-blue-100' : ''} onClick={() => setViewMode('day')}>
              Day
            </Button>
            <Button size="sm" variant="outline" className={viewMode === 'week' ? 'bg-blue-100' : ''} onClick={() => setViewMode('week')}>
              Week
            </Button>
            <Button size="sm" variant="outline" className={viewMode === 'month' ? 'bg-blue-100' : ''} onClick={() => setViewMode('month')}>
              Month
            </Button>
          </div>
        </div>
      </div>

      {/* Calendar View */}
      {viewMode === 'day' && (
        <DayView
          today={today}
          hours={hours}
          currentHour={currentHour}
          currentHourRef={currentHourRef}
          getTaskColor={getTaskColor}
          getRandomEmoji={getRandomEmoji}
          tasks={tasks} // Pass tasks explicitly
          getTaskHour={getTaskHour} // Pass getTaskHour explicitly
        />
      )}

      {/* {viewMode === 'week' && (
        <WeekView
          weekDays={weekDays}
          hours={hours}
          getTaskColor={getTaskColor}
          tasks={tasks} // Pass tasks explicitly
          getRandomEmoji={getRandomEmoji}
        />
      )}

      {viewMode === 'month' && <MonthView tasks={tasks} getTaskColor={getTaskColor} getRandomEmoji={getRandomEmoji} />} */}
    </div>
  );
};

export default TaskView;
