import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { FamilyChild } from '@/types/task';
import axios from 'axios';
import { useState } from 'react';
import { toast } from 'sonner';

interface ChildPinModalProps {
  children: FamilyChild[];
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (child: FamilyChild) => void;
}

export const ChildPinModal = ({ children, isOpen, onClose, onSuccess }: ChildPinModalProps) => {
  const [selectedChild, setSelectedChild] = useState<FamilyChild | null>(null);
  const [pin, setPin] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePinSubmit = async () => {
    if (!selectedChild) return;

    setIsSubmitting(true);
    try {
      const response = await axios.post(route('child.verify-pin'), {
        child_id: selectedChild.id,
        pin,
      });

      if (response.data.verified) {
        onSuccess(selectedChild);
      } else {
        toast.error('Invalid PIN. Please try again.');
      }
    } catch (error) {
      console.log('error', error);
      toast.error('Failed to verify PIN. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Select Child and Enter PIN</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium" style={{ color: '#222' }}>
              Select Child
            </label>
            <div className="grid grid-cols-2 gap-2">
              {children.map((child) => (
                <Button
                  key={child.id}
                  variant={selectedChild?.id === child.id ? 'default' : 'outline'}
                  onClick={() => setSelectedChild(child)}
                  style={{ background: selectedChild?.id === child.id ? '#FFD600' : '#FFF9DB', color: '#222', borderColor: '#FFD600' }}
                >
                  {child.name}
                </Button>
              ))}
            </div>
          </div>

          {selectedChild && (
            <div className="space-y-2">
              <label className="text-sm font-medium" style={{ color: '#222' }}>
                Enter PIN
              </label>
              <Input
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="Enter 4-digit PIN"
                maxLength={4}
                className="text-center text-lg tracking-widest"
                style={{ color: '#222', background: '#FFF9DB', borderColor: '#FFD600' }}
              />
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handlePinSubmit} disabled={!selectedChild || !pin || isSubmitting}>
              {isSubmitting ? 'Verifying...' : 'Verify'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
