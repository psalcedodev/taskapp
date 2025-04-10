import type { Options as ConfettiOptions } from 'canvas-confetti';
import React from 'react';

export const useConfetti = () => {
  const [confettiInstance, setConfettiInstance] = React.useState<((opts: ConfettiOptions) => void) | null>(null);
  const confettiLoaded = React.useRef(false);

  React.useEffect(() => {
    if (confettiLoaded.current) return;
    confettiLoaded.current = true;

    const loadConfetti = async () => {
      try {
        const confettiModule = await import('canvas-confetti');
        setConfettiInstance(() => confettiModule.default);
      } catch (error) {
        console.error('Failed to load confetti:', error);
      }
    };

    loadConfetti();
  }, []);

  const triggerConfetti = React.useCallback(
    (options: ConfettiOptions = {}) => {
      if (!confettiInstance) {
        return;
      }

      const defaultOptions: ConfettiOptions = {
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        disableForReducedMotion: true,
        colors: ['#FF5757', '#FFBD59', '#4CD964', '#5AC8FA', '#AF52DE'],
      };

      try {
        confettiInstance({
          ...defaultOptions,
          ...options,
        });
      } catch (error) {
        console.error('Error triggering confetti:', error);
      }
    },
    [confettiInstance],
  );

  return { triggerConfetti };
};
