import DayView from '@/components/day-view/day_view';
// Add useState and useEffect imports
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { TaskViewerPresenter } from './task_viewer_presenter';
// Import Clock icon
import { Clock } from 'lucide-react';

const TaskView: React.FC = () => {
  const presenter = useMemo(() => new TaskViewerPresenter(), []);
  const currentHourRef = useRef<HTMLDivElement>(null);
  // State for the current time
  const [currentTime, setCurrentTime] = useState(new Date());

  // Effect to update the time every second
  useEffect(() => {
    const timerId = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000); // Update every second

    // Cleanup function to clear the interval when the component unmounts
    return () => {
      clearInterval(timerId);
    };
  }, []); // Empty dependency array ensures this runs only once on mount

  return (
    <div className="container mx-auto h-full p-4">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Routine 🚀</h1>
          <div className="flex items-center gap-2 text-lg font-medium text-gray-600">
            <Clock className="h-5 w-5" />
            <span>{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>
      </div>
      <div>
        {presenter.viewMode === 'day' && (
          <DayView
            currentHourRef={currentHourRef}
            getTaskColor={presenter.getTaskColor}
            getRandomEmoji={presenter.getRandomEmoji}
            tasks={presenter.tasks}
            getTaskHour={presenter.getTaskHour}
          />
        )}
      </div>
    </div>
  );
};

export default TaskView;
