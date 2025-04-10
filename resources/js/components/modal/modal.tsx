import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { IconButton } from '@/components/ui/icon-button';
import { XIcon } from 'lucide-react';
import React from 'react';

export interface ModalProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footerContent: React.ReactNode;
  width?: string;
}
export const Modal: React.FC<ModalProps> = ({ title, onClose, children, footerContent, width }) => {
  return (
    <Dialog open>
      <DialogContent className="bg-background w-full rounded-md border" style={{ width }}>
        <DialogHeader className="flex flex-row items-center justify-between border-b p-3">
          <DialogTitle>{title}</DialogTitle>
          <div className="flex gap-2 border-l pl-3">
            <IconButton Icon={XIcon} onClick={onClose} />
          </div>
        </DialogHeader>
        <div className="px-3">{children}</div>
        <DialogFooter className="border-t p-3">{footerContent}</DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
