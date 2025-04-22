import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useIsMobile } from '@/hooks/use-mobile';
import { TriangleAlert } from 'lucide-react';
import React from 'react';

interface FieldErrorInfoProps {
  errorMessage: string | null | undefined;
}

export const FieldErrorInfo: React.FC<FieldErrorInfoProps> = ({ errorMessage }) => {
  const isMobile = useIsMobile();

  if (!errorMessage) {
    return null;
  }

  return isMobile ? (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="focus:ring-ring inline-flex items-center justify-center rounded-full focus:ring-2 focus:ring-offset-2 focus:outline-none"
          aria-label="View error"
        >
          <TriangleAlert className="text-destructive-foreground h-5 w-5" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="text-destructive-foreground w-60 text-sm">{errorMessage}</PopoverContent>
    </Popover>
  ) : (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button type="button" className="inline-flex items-center justify-center" aria-label="View error">
            <TriangleAlert className="text-destructive-foreground h-5 w-5" />
          </button>
        </TooltipTrigger>
        <TooltipContent
          className="bg-destructive-foreground text-white"
          arrowClassName="fill-destructive-foreground bg-destructive-foreground"
          sideOffset={-4}
        >
          <p>{errorMessage}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
