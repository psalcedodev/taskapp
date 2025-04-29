import { BankView } from '@/components/bank/bank_view';
import ClockDisplay from '@/components/clock_display';
import { DayView } from '@/components/day-view/day_view';
import { ParentPasswordModal } from '@/components/parent_password_modal';
import { ShopAccessButton } from '@/components/shop/shop_access_button';
import { ShopView } from '@/components/shop/shop_view';
import { Button } from '@/components/ui/button';
import { useAsyncValue } from '@/hooks/use_async_value';
import { FamilyChild } from '@/types/task';
import { Head, router } from '@inertiajs/react';
import { format, isToday } from 'date-fns';
import { ChevronLeft, ChevronRight, Coins, UserCog, Wallet } from 'lucide-react';
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
  const [currentHour, setCurrentHour] = useState(() => new Date().getHours());
  const selectedDate = useAsyncValue(presenter.selectedDate);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [activeChild, setActiveChild] = useState<FamilyChild | null>(null);
  const [isShopView, setIsShopView] = useState(false);
  const [isBankView, setIsBankView] = useState(false);
  const [selectedChild, setSelectedChild] = useState<FamilyChild | null>(null);

  const formattedDate = format(selectedDate, 'MMMM d, yyyy');

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
  //   const { isPending: isChildrenPending } = useAsyncStatus(presenter.familyChildren);

  const handlePasswordSubmit = (password: string) => {
    router.post(
      route('auth.revalidatePassword'),
      { password },
      {
        preserveScroll: true,
        preserveState: true,
        onStart: () => {
          setIsSubmittingPassword(true);
          setPasswordError(null);
        },
        onSuccess: () => {
          setIsPasswordModalOpen(false);
        },
        onError: (errors) => {
          console.error('Password revalidation failed (Inertia):', errors);
          if (errors.password) {
            setPasswordError(errors.password);
          } else {
            setPasswordError(Object.values(errors).join(' ') || 'An unexpected error occurred.');
          }
        },
        onFinish: () => {
          setIsSubmittingPassword(false);
        },
      },
    );
  };

  const handleShopAccess = (child: FamilyChild) => {
    setActiveChild(child);
    setIsShopView(true);
  };

  const handleShopClose = () => {
    setIsShopView(false);
    setActiveChild(null);
  };

  const handleBankAccess = (child: FamilyChild) => {
    setSelectedChild(child);
    setIsBankView(true);
  };

  const handleBankClose = () => {
    setIsBankView(false);
    setSelectedChild(null);
  };

  return (
    <div className="flex h-screen flex-col">
      <Head title="Routine" />
      <Toaster richColors position="top-right" />

      {/* Header */}
      <header className="border-b border-gray-200 bg-white px-4 py-4 shadow-sm">
        <div className="container mx-auto">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold tracking-tight" style={{ color: '#111827' }}>
                Routine 🚀
              </h1>

              {!isShopView && !isBankView && (
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
              {(activeChild || selectedChild) && (
                <div className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-1.5">
                  <span className="text-sm font-medium text-gray-700">{(activeChild || selectedChild)?.name}</span>
                  <div className="flex items-center gap-1">
                    <Coins size={14} className="text-yellow-500" />
                    <span className="text-sm font-medium text-gray-700">{(activeChild || selectedChild)?.token_balance}</span>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2">
                <div className="relative">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9"
                    title="Bank Access"
                    onClick={() => {
                      if (children.length === 1) {
                        handleBankAccess(children[0]);
                      }
                    }}
                  >
                    <Wallet className="h-4 w-4" />
                  </Button>
                </div>

                <Button variant="outline" size="icon" className="h-9 w-9" title="Parent Access" onClick={() => setIsPasswordModalOpen(true)}>
                  <UserCog className="h-4 w-4" />
                </Button>

                <ShopAccessButton
                  children={children}
                  onPurchaseSuccess={() => {
                    presenter.getFamilyChildren();
                  }}
                  onShopAccess={handleShopAccess}
                  onShopClose={handleShopClose}
                />

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
              {!isShopView && !isBankView && (
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
              {isShopView && activeChild && (
                <div className="h-full">
                  <ShopView
                    child={activeChild}
                    onPurchaseSuccess={() => {
                      presenter.getFamilyChildren();
                    }}
                    onClose={handleShopClose}
                  />
                </div>
              )}
              {isBankView && selectedChild && (
                <div className="h-full">
                  <BankView child={selectedChild} onClose={handleBankClose} />
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <ParentPasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        onSubmit={handlePasswordSubmit}
        isSubmitting={isSubmittingPassword}
        errorMessage={passwordError}
      />
    </div>
  );
};

export default TaskView;
