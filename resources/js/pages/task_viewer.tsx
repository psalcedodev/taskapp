import ClockDisplay from '@/components/clock_display'; // Import the new component
import DayView from '@/components/day-view/day_view';
import { useAsyncValue } from '@/hooks/use_async_value';
import { Users } from 'lucide-react';
import React, { useEffect, useMemo, useRef, useState } from 'react'; // Import useEffect
import { TaskViewerPresenter } from './task_viewer_presenter';

const TaskView = () => {
  // Wrap component with observer
  const presenter = useMemo(() => {
    const presenter = new TaskViewerPresenter();
    // Fetch initial data
    presenter.getFamilyTasks();
    presenter.getFamilyChildren(); // Fetch children
    return presenter;
  }, []);

  const currentHourRef = useRef<HTMLDivElement>(null);
  const [selectedChildId, setSelectedChildId] = useState<string | number>('all'); // State for filter, 'all' or child ID
  // State for the current hour (0-23) - updates less frequently
  const [currentHour, setCurrentHour] = useState(() => new Date().getHours());

  // Effect to update the current hour state every minute
  useEffect(() => {
    const intervalId = setInterval(() => {
      const newHour = new Date().getHours();
      setCurrentHour((prevHour) => {
        // Only update state if the hour has actually changed
        if (newHour !== prevHour) {
          return newHour;
        }
        return prevHour;
      });
    }, 60000); // Check every 60 seconds (1 minute)

    return () => clearInterval(intervalId); // Cleanup interval
  }, []); // Runs once on mount

  const allTasks = useAsyncValue(presenter.tasks);
  console.log({ allTasks });
  const children = useAsyncValue(presenter.familyChildren); // Get children list

  // Filter tasks based on selected child
  const filteredTasks = useMemo(() => {
    if (selectedChildId === 'all') {
      return allTasks; // Show all tasks if 'all' is selected
    }
    // Ensure selectedChildId is treated as a number for comparison
    const childIdToFilter = Number(selectedChildId);
    // Filter tasks where at least one assigned child matches the selected ID
    return allTasks.filter((task) => task.assigned_to.some((child) => child.id === childIdToFilter));
  }, [allTasks, selectedChildId]); // Dependencies: allTasks and selectedChildId

  const handleFilterChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    setSelectedChildId(value === 'all' ? 'all' : Number(value)); // Store ID as number or 'all'
  };

  return (
    <div className="container mx-auto h-full p-4">
      <div className="mb-6">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <h1 className="text-2xl font-bold">Routine 🚀</h1>

          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-gray-500" />
            <select
              id="childFilter"
              value={selectedChildId}
              onChange={handleFilterChange}
              className="focus:ring-opacity-50 block w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 sm:w-auto"
            >
              <option value="all">All Children</option>
              {children.map((child) => (
                <option key={child.id} value={child.id}>
                  {child.name}
                </option>
              ))}
            </select>
          </div>

          {/* Render the dedicated ClockDisplay component */}
          <ClockDisplay />
        </div>
      </div>
      <div>
        {presenter.viewMode === 'day' && (
          <DayView currentHourRef={currentHourRef} tasks={filteredTasks} currentHour={currentHour} fetchTasks={() => presenter.getFamilyTasks()} />
        )}
      </div>
    </div>
  );
}; // Close observer wrapper

export default TaskView;
