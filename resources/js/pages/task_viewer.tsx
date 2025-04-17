import ClockDisplay from '@/components/clock_display';
import { DayView } from '@/components/day-view/day_view';
import { Button } from '@/components/ui/button';
import { useInitials } from '@/hooks/use-initials';
import { useAsyncStatus } from '@/hooks/use_async_status';
import { useAsyncValue } from '@/hooks/use_async_value';
import { format, isToday } from 'date-fns';
import { ChevronLeft, ChevronRight, Coins } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Toaster } from 'sonner';
import { TaskViewerPresenter } from './task_viewer_presenter';

const TaskView = () => {
  const [presenter] = useState(() => {
    const presenter = new TaskViewerPresenter();
    presenter.getFamilyChildren();
    return presenter;
  });

  const currentHourRef = useRef<HTMLDivElement>(null);
  const selectedChildId = useAsyncValue(presenter.selectedChildId);
  const [currentHour, setCurrentHour] = useState(() => new Date().getHours());
  const selectedDate = useAsyncValue(presenter.selectedDate);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

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

  const scrollToCurrentHour = () => {
    if (currentHourRef.current) {
      currentHourRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    } else {
      console.warn('currentHourRef.current is null, cannot scroll.');
    }
  };

  useEffect(() => {
    if (selectedDate && isToday(selectedDate)) {
      const timerId = setTimeout(() => {
        scrollToCurrentHour();
      }, 300);

      return () => clearTimeout(timerId);
    }
  }, [selectedDate]);

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;

    const handleInactivity = () => {
      const isViewingToday = selectedDate && isToday(selectedDate);

      if (isViewingToday) {
        scrollToCurrentHour();
        presenter.changeSelectedChildFilter('all');
      } else {
        presenter.goToToday();
        presenter.changeSelectedChildFilter('all');
        setTimeout(scrollToCurrentHour, 300);
      }
    };

    let inactivityTimeout: NodeJS.Timeout | null = null;

    const resetInactivityTimeout = () => {
      if (inactivityTimeout) {
        clearTimeout(inactivityTimeout);
      }
      inactivityTimeout = setTimeout(handleInactivity, 300000);
    };

    const handleInteraction = () => {
      resetInactivityTimeout();
    };

    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleInteraction);
      window.addEventListener('mousemove', handleInteraction);
      window.addEventListener('keydown', handleInteraction);
      resetInactivityTimeout();
    } else {
      console.warn('scrollContainerRef.current is null when trying to add listeners.');
    }

    return () => {
      if (scrollContainer) {
        scrollContainer.removeEventListener('scroll', handleInteraction);
      }
      window.removeEventListener('mousemove', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
      if (inactivityTimeout) {
        clearTimeout(inactivityTimeout);
      }
    };
  }, [selectedDate, presenter]);

  const children = useAsyncValue(presenter.familyChildren);
  const { isPending: isChildrenPending } = useAsyncStatus(presenter.familyChildren);

  return (
    <div className="container mx-auto flex h-screen flex-col px-4 py-6 lg:px-8">
      <Toaster richColors position="top-right" />
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4">
        <h1 className="text-3xl font-bold tracking-tight" style={{ color: '#111827' }}>
          Routine 🚀
        </h1>
        <div className="flex flex-wrap items-center gap-4 sm:gap-6">
          <div className="flex items-center gap-2">
            {/* <span className="text-sm font-medium" style={{ color: '#6b7280' }}>
              Filter:
            </span> */}
            <div className="flex items-center gap-1.5">
              {/* <Avatar
                title="Show All"
                className={`h-8 w-8 cursor-pointer rounded-full border-2 transition-all duration-150 ease-in-out hover:opacity-100 ${selectedChildId === 'all' ? 'opacity-100 ring-2 ring-[#6b7280] ring-offset-1' : 'opacity-60'}`}
                style={{ borderColor: '#d1d4db', backgroundColor: '#ffffff' }}
                onClick={() => presenter.changeSelectedChildFilter('all')}
              >
                <AvatarFallback className="border border-transparent bg-clip-text text-[10px] font-bold uppercase" style={{ color: '#6b7280' }}>
                  All
                </AvatarFallback>
              </Avatar> */}
              {children.map((child) => (
                <div key={child.id} className="flex flex-row gap-2">
                  {/* <Avatar
                        title={`Show ${child.name}'s Tasks`}
                        className={`h-8 w-8 cursor-pointer overflow-hidden rounded-full border-2 shadow-sm`}
                        style={{
                          color: selectedChildId === child.id ? child.color || '#9ca3af' : '#6b7280',
                          backgroundColor: selectedChildId === child.id ? (child.color ? `${child.color}40` : '#e5e7eb') : '#f3f4f6',
                          borderColor: selectedChildId === child.id ? child.color || '#9ca3af' : '#d1d4db',
                        }}
                        onClick={() => presenter.changeSelectedChildFilter(child.id)}
                      >
                        <AvatarFallback className="text-xs font-medium" style={{ color: '#4f4f4f' }}>
                          {getInitials(child.name)}
                        </AvatarFallback>
                      </Avatar> */}
                  <div className="text-sm font-medium" style={{ color: '#6b7280' }}>
                    {child.name} |
                  </div>
                  <Coins size={14} className="inline-block align-middle" style={{ color: '#fbbf24' }} />
                  <div className="text-sm font-medium" style={{ color: '#6b7280' }}>
                    {child.token_balance}
                  </div>
                </div>
              ))}
              {/* {isChildrenPending ? (
                <div className="h-8 w-8 animate-pulse rounded-full" style={{ backgroundColor: '#e5e7eb' }} />
              ) : (
              )} */}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" className="h-9 px-3 text-sm" onClick={() => presenter.goToToday()}>
              Today
            </Button>

            <div className="flex overflow-hidden rounded-md border" style={{ borderColor: '#d1d4db' }}>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => presenter.goToPreviousDay()}
                className="h-9 w-9 rounded-none border-r hover:bg-gray-100"
                style={{ borderColor: '#d1d4db' }}
              >
                <ChevronLeft className="h-4 w-4" style={{ color: '#4b5563' }} />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => presenter.goToNextDay()} className="h-9 w-9 rounded-none hover:bg-gray-100">
                <ChevronRight className="h-4 w-4" style={{ color: '#4b5563' }} />
              </Button>
            </div>

            <div className="w-32 text-sm font-medium" style={{ color: '#374151' }}>
              {formattedDate}
            </div>
          </div>

          <ClockDisplay />
        </div>
      </div>
      <div className="min-h-0 flex-grow overflow-hidden">
        {presenter.viewMode === 'day' && (
          <DayView
            scrollContainerRef={scrollContainerRef}
            presenter={presenter.dayViewPresenter}
            currentHourRef={currentHourRef}
            selectedDate={selectedDate}
            currentHour={currentHour}
            getFamilyChildren={() => presenter.getFamilyChildren()}
          />
        )}
      </div>
    </div>
  );
};

export default TaskView;
