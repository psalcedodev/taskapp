/**
 * TaskView Component
 *
 * A comprehensive task management interface that provides three main views:
 * - Day View: Shows hourly tasks and routines
 * - Shop View: Allows children to spend earned tokens
 * - Bank View: Displays transaction history and token balance
 *
 * Features:
 * - Automatic scrolling to current hour
 * - Inactivity handling (returns to today's view after 5 minutes)
 * - Parent access authentication
 * - Dynamic view switching based on user interaction
 * - Real-time token balance tracking
 */

import { BankView } from '@/components/bank/bank_view';
import ClockDisplay from '@/components/clock_display';
import { DayView } from '@/components/day-view/day_view';
import { ParentPasswordModal } from '@/components/parent_password_modal';
import { ShopAccessButton } from '@/components/shop/shop_access_button';
import { ShopView } from '@/components/shop/shop_view';
import { Button } from '@/components/ui/button';
import { useAsyncValue } from '@/hooks/use_async_value';
import { usePasswordModal } from '@/hooks/use_password_modal';
import { FamilyChild } from '@/types/task';
import { ViewState } from '@/types/views';
import { Head } from '@inertiajs/react';
import { format, isToday } from 'date-fns';
import { ArrowLeft, ChevronLeft, ChevronRight, UserCog, Wallet } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Toaster } from 'sonner';
import { TaskViewerPresenter } from './task_viewer_presenter';

const INACTIVITY_TIMEOUT = 300000; // 5 minutes in milliseconds
const SCROLL_DELAY = 300; // Delay to ensure DOM is ready before scrolling

const TaskView = () => {
  // Initialize presenter
  const [presenter] = useState(() => {
    const presenter = new TaskViewerPresenter();
    presenter.getFamilyChildren();
    return presenter;
  });

  // Refs
  const currentHourRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // State
  const [currentHour, setCurrentHour] = useState(() => new Date().getHours());
  const [viewState, setViewState] = useState<ViewState>({ type: 'day' });

  // Custom hooks
  const passwordModal = usePasswordModal();
  const selectedDate = useAsyncValue(presenter.selectedDate);
  const children = useAsyncValue(presenter.familyChildren);

  // Derived values
  const formattedDate = format(selectedDate, 'MMMM d, yyyy');

  /**
   * Scrolls the view to the current hour block
   * Used when viewing today's schedule or after inactivity
   */
  const scrollToCurrentHour = () => {
    if (currentHourRef.current) {
      currentHourRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  };

  /**
   * Updates current hour every minute
   * Used to highlight the current hour block and update time-based UI
   */
  useEffect(() => {
    const intervalId = setInterval(() => {
      const newHour = new Date().getHours();
      setCurrentHour((prevHour) => (newHour !== prevHour ? newHour : prevHour));
    }, 60000);

    return () => clearInterval(intervalId);
  }, []);

  /**
   * Automatically scrolls to current hour when viewing today's schedule
   */
  useEffect(() => {
    if (selectedDate && isToday(selectedDate)) {
      const timerId = setTimeout(scrollToCurrentHour, SCROLL_DELAY);
      return () => clearTimeout(timerId);
    }
  }, [selectedDate]);

  /**
   * Handles user inactivity by:
   * 1. Returning to today's view if on a different date
   * 2. Scrolling to current hour
   * 3. Resetting child filter to show all children
   */
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    const handleInactivity = () => {
      const isViewingToday = selectedDate && isToday(selectedDate);

      if (isViewingToday) {
        scrollToCurrentHour();
      } else {
        presenter.goToToday();
        setTimeout(scrollToCurrentHour, SCROLL_DELAY);
      }
      presenter.changeSelectedChildFilter('all');
    };

    let inactivityTimeout: NodeJS.Timeout | null = null;

    const resetInactivityTimeout = () => {
      if (inactivityTimeout) clearTimeout(inactivityTimeout);
      inactivityTimeout = setTimeout(handleInactivity, INACTIVITY_TIMEOUT);
    };

    const handleInteraction = () => resetInactivityTimeout();

    scrollContainer.addEventListener('scroll', handleInteraction);
    window.addEventListener('mousemove', handleInteraction);
    window.addEventListener('keydown', handleInteraction);
    resetInactivityTimeout();

    return () => {
      scrollContainer.removeEventListener('scroll', handleInteraction);
      window.removeEventListener('mousemove', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
      if (inactivityTimeout) clearTimeout(inactivityTimeout);
    };
  }, [selectedDate, presenter]);

  /**
   * View state transition handlers
   * These functions manage the switching between different views (day, shop, bank)
   * and handle the associated child state
   */
  const goToDay = () => setViewState({ type: 'day' });
  const goToShop = (child: FamilyChild) => setViewState({ type: 'shop', child });
  const goToBank = (child: FamilyChild) => setViewState({ type: 'bank', child });

  return (
    <div className="flex h-screen flex-col">
      <Head title="Routine" />
      <Toaster richColors position="top-center" />

      {/* Header */}
      <header style={{ borderBottom: '1px solid #e5e7eb', backgroundColor: '#fff' }} className="px-4 py-4 shadow-sm">
        <div className="container mx-auto">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {viewState.type !== 'day' && (
                <Button variant="ghost" size="icon" onClick={goToDay} className="mr-2 h-9 w-9">
                  <ArrowLeft className="h-4 w-4" style={{ color: '#4b5563' }} />
                </Button>
              )}
              <h1 style={{ color: '#111827' }} className="text-2xl font-bold tracking-tight">
                {viewState.type === 'shop' ? 'Shop' : viewState.type === 'bank' ? 'Bank' : 'Routine 🚀'}
              </h1>

              {viewState.type === 'day' && (
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
              )}
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9"
                    title="Bank Access"
                    onClick={() => {
                      if (children.length === 1) {
                        goToBank(children[0]);
                      }
                    }}
                  >
                    <Wallet className="h-4 w-4" />
                  </Button>
                </div>

                <ShopAccessButton
                  children={children}
                  onPurchaseSuccess={() => presenter.getFamilyChildren()}
                  onShopAccess={goToShop}
                  onShopClose={goToDay}
                />
                <Button variant="outline" size="icon" className="h-9 w-9" title="Parent Access" onClick={passwordModal.openModal}>
                  <UserCog className="h-4 w-4" />
                </Button>

                <ClockDisplay />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden">
        <div className="h-full">
          {presenter.viewMode === 'day' && (
            <>
              {viewState.type === 'day' && (
                <div className="h-full">
                  <DayView
                    scrollContainerRef={scrollContainerRef}
                    presenter={presenter.dayViewPresenter}
                    currentHourRef={currentHourRef}
                    selectedDate={selectedDate}
                    currentHour={currentHour}
                    getFamilyChildren={() => presenter.getFamilyChildren()}
                  />
                </div>
              )}
              {viewState.type === 'shop' && (
                <div className="h-full">
                  <ShopView child={viewState.child} onPurchaseSuccess={() => presenter.getFamilyChildren()} onClose={goToDay} />
                </div>
              )}
              {viewState.type === 'bank' && (
                <div className="h-full">
                  <BankView child={viewState.child} onClose={goToDay} goToShop={goToShop} />
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <ParentPasswordModal
        isOpen={passwordModal.isOpen}
        onClose={passwordModal.closeModal}
        onSubmit={passwordModal.handleSubmit}
        isSubmitting={passwordModal.isSubmitting}
        errorMessage={passwordModal.error}
      />
    </div>
  );
};

export default TaskView;
