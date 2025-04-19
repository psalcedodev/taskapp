import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react'; // For loading spinner
import { useState } from 'react';

interface ParentPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (password: string) => void; // Changed: Removed Promise<void>
  isSubmitting: boolean;
  errorMessage: string | null;
}

export const ParentPasswordModal: React.FC<ParentPasswordModalProps> = ({ isOpen, onClose, onSubmit, isSubmitting, errorMessage }) => {
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || isSubmitting) return;
    onSubmit(password); // Call the synchronous handler
  };

  // Handle modal open state change (e.g., closing via overlay click)
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
      setPassword(''); // Clear password on close
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="bg-[#f9fafb] p-4 sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Parent Access</DialogTitle>
            <DialogDescription>Please enter your password to access the parent dashboard.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="password" className="text-right">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="col-span-3"
                required
                disabled={isSubmitting}
              />
            </div>
            {errorMessage && <p className="col-span-4 text-center text-sm text-red-600">{errorMessage}</p>}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)} // Use handler to ensure cleanup
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !password}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                'Submit'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
