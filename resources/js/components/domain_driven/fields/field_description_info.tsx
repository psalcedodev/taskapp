import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useIsMobile } from '@/hooks/use-mobile';
import { Info } from 'lucide-react';
import React from 'react';

interface FieldDescriptionInfoProps {
  description: string | null | undefined;
}

export const FieldDescriptionInfo: React.FC<FieldDescriptionInfoProps> = ({ description }) => {
  const isMobile = useIsMobile();

  if (!description) {
    return null;
  }

  return isMobile ? (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="focus:ring-ring ml-1 inline-flex items-center justify-center rounded-full focus:ring-2 focus:ring-offset-2 focus:outline-none"
          aria-label="View description"
        >
          <Info className="text-muted-foreground h-4 w-4" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-screen text-sm">{description}</PopoverContent>
    </Popover>
  ) : (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button type="button" className="ml-1 inline-flex items-center justify-center" aria-label="View description">
            <Info className="text-muted-foreground h-4 w-4" />
          </button>
        </TooltipTrigger>
        <TooltipContent sideOffset={-4}>
          <p>{description}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
