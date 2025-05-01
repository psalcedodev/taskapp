import { router } from '@inertiajs/react';
import { useState } from 'react';

interface UsePasswordModalReturn {
  isOpen: boolean;
  isSubmitting: boolean;
  error: string | null;
  openModal: () => void;
  closeModal: () => void;
  handleSubmit: (password: string) => void;
}

export function usePasswordModal(): UsePasswordModalReturn {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  const handleSubmit = (password: string) => {
    router.post(
      route('auth.revalidatePassword'),
      { password },
      {
        preserveScroll: true,
        preserveState: true,
        onStart: () => {
          setIsSubmitting(true);
          setError(null);
        },
        onSuccess: () => {
          setIsOpen(false);
        },
        onError: (errors) => {
          console.error('Password revalidation failed (Inertia):', errors);
          if (errors.password) {
            setError(errors.password);
          } else {
            setError(Object.values(errors).join(' ') || 'An unexpected error occurred.');
          }
        },
        onFinish: () => {
          setIsSubmitting(false);
        },
      },
    );
  };

  return {
    isOpen,
    isSubmitting,
    error,
    openModal,
    closeModal,
    handleSubmit,
  };
}
