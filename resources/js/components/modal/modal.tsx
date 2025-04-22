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
export const Modal: React.FC<ModalProps> = ({ title, onClose, children, footerContent, width = 'sm:max-w-lg' }) => {
  return (
    <Dialog open>
      <DialogContent className={`bg-background flex w-full flex-col rounded-md border ${width} max-h-[90vh]`}>
        <DialogHeader className="flex flex-shrink-0 flex-row items-center justify-between border-b p-3">
          <DialogTitle>{title}</DialogTitle>
          <div className="flex gap-2 border-l pl-3">
            <IconButton Icon={XIcon} onClick={onClose} />
          </div>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto px-3">{children}</div>
        <DialogFooter className="flex-shrink-0 border-t p-3">{footerContent}</DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
