import ClockDisplay from '@/components/clock_display';
import DayView from '@/components/day-view/day_view';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useInitials } from '@/hooks/use-initials';
import { useAsyncValue } from '@/hooks/use_async_value';
import { format } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Toaster } from 'sonner';
import { TaskViewerPresenter } from './task_viewer_presenter';

const TaskView = () => {
  const presenterRef = useRef<TaskViewerPresenter | null>(null);

  const getPresenter = () => {
    if (presenterRef.current === null) {
      presenterRef.current = new TaskViewerPresenter();
    }
    return presenterRef.current;
  };

  useEffect(() => {
    const currentPresenter = getPresenter();
    currentPresenter.getFamilyTasks();
    currentPresenter.getFamilyChildren();

    return () => {
      currentPresenter.dispose();
    };
  }, []);

  const presenter = getPresenter();

  const currentHourRef = useRef<HTMLDivElement>(null);
  const selectedChildId = useAsyncValue(presenter.selectedChildId);
  const [currentHour, setCurrentHour] = useState(() => new Date().getHours());
  const selectedDate = useAsyncValue(presenter.selectedDate);
  const dayViewPresenter = useAsyncValue(presenter.dayViewPresenter);

  const formattedDate = format(selectedDate, 'MMMM d, yyyy');
  const getInitials = useInitials();

  useEffect(() => {
    const intervalId = setInterval(() => {
      const newHour = new Date().getHours();
      setCurrentHour((prevHour) => {
        if (newHour !== prevHour) {
          return newHour;
        }
        return prevHour;
      });
    }, 60000);

    return () => clearInterval(intervalId);
  }, []);

  const children = useAsyncValue(presenter.familyChildren);

  return (
    <div className="container mx-auto h-full px-4 py-6 lg:px-8">
      <Toaster richColors />
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Routine 🚀</h1>
        <div className="flex flex-wrap items-center gap-4 sm:gap-6">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-500">Filter:</span>
            <div className="flex items-center gap-1.5">
              <Avatar
                title="Show All"
                className={`h-8 w-8 cursor-pointer rounded-full border-2 border-gray-300 bg-white transition-all duration-150 ease-in-out hover:border-gray-400 hover:opacity-100 ${selectedChildId === 'all' ? 'opacity-100 ring-2 ring-blue-500 ring-offset-1' : 'opacity-60'}`}
                onClick={() => presenter.changeSelectedChildFilter('all')}
              >
                <AvatarFallback className="border border-transparent bg-clip-text text-[10px] font-bold text-gray-500 uppercase">All</AvatarFallback>
              </Avatar>

              {children.map((child) => (
                <Avatar
                  key={child.id}
                  title={`Show ${child.name}'s Tasks`}
                  className={`h-8 w-8 cursor-pointer rounded-full border-2 text-white transition-all duration-150 ease-in-out hover:opacity-100 ${selectedChildId === child.id ? 'opacity-100 ring-2 ring-current ring-offset-1' : 'opacity-60'}`}
                  style={{
                    backgroundColor: child.color || '#9ca3af',
                    borderColor: selectedChildId === child.id ? child.color || '#9ca3af' : 'rgba(255, 255, 255, 0.3)',
                    color: child.color || '#9ca3af',
                  }}
                  onClick={() => presenter.changeSelectedChildFilter(child.id)}
                >
                  <AvatarFallback style={{ backgroundColor: 'transparent' }} className="text-[11px] font-semibold text-gray-500">
                    {getInitials(child.name)}
                  </AvatarFallback>
                </Avatar>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" className="h-9 px-3 text-sm" onClick={() => presenter.goToToday()}>
              Today
            </Button>

            <div className="flex overflow-hidden rounded-md border border-gray-300">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => presenter.goToPreviousDay()}
                className="h-9 w-9 rounded-none border-r border-gray-300 hover:bg-gray-100"
              >
                <ChevronLeft className="h-4 w-4 text-gray-600" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => presenter.goToNextDay()} className="h-9 w-9 rounded-none hover:bg-gray-100">
                <ChevronRight className="h-4 w-4 text-gray-600" />
              </Button>
            </div>

            <div className="w-32 text-sm font-medium text-gray-700">{formattedDate}</div>
          </div>

          <ClockDisplay />
        </div>
      </div>

      <div>
        {presenter.viewMode === 'day' && dayViewPresenter && (
          <DayView presenter={dayViewPresenter} currentHourRef={currentHourRef} currentHour={currentHour} selectedDate={selectedDate} />
        )}
      </div>
    </div>
  );
};

export default TaskView;
