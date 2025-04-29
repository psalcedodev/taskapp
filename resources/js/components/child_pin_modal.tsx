import { Modal } from '@/components/modal/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FamilyChild } from '@/types/task';
import axios from 'axios';
import { useState } from 'react';
import { toast } from 'sonner';

interface ChildPinModalProps {
  child: FamilyChild;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ChildPinModal = ({ child, isOpen, onClose, onSuccess }: ChildPinModalProps) => {
  const [pin, setPin] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!pin) {
      toast.error('Please enter your PIN');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await axios.post(route('child.verify-pin'), {
        child_id: child.id,
        pin: pin,
      });

      if (response.data.verified) {
        onSuccess();
        onClose();
      } else {
        toast.error('Incorrect PIN');
      }
    } catch (error) {
      toast.error('Failed to verify PIN');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal
      title={`${child.name}'s Shop Access`}
      onClose={onClose}
      footerContent={
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Verifying...' : 'Enter Shop'}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <p className="text-sm text-gray-600">Please enter your PIN to access the shop.</p>
        <Input
          type="password"
          placeholder="Enter PIN"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          maxLength={4}
          className="text-center text-2xl tracking-widest"
        />
      </div>
    </Modal>
  );
};
