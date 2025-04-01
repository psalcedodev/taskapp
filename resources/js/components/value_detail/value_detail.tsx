import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import React, { useEffect, useRef, useState } from 'react';

export interface ValueDetailProps {
  label: string;
  value: string | React.ReactNode;
}

export const ValueDetail: React.FC<ValueDetailProps> = ({ label, value }) => {
  const valueRef = useRef<HTMLSpanElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const [isValueTruncated, setIsValueTruncated] = useState(false);
  const [isLabelTruncated, setIsLabelTruncated] = useState(false);

  useEffect(() => {
    const valueEl = valueRef.current;
    if (valueEl && typeof value === 'string') {
      setIsValueTruncated(valueEl.scrollWidth > valueEl.offsetWidth);
    }

    const labelEl = labelRef.current;
    if (labelEl) {
      setIsLabelTruncated(labelEl.scrollWidth > labelEl.offsetWidth);
    }
  }, [label, value]);

  return (
    <div className="grid w-full grid-cols-2 items-center justify-between gap-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span
              ref={labelRef}
              className="truncate text-sm text-gray-500"
              title={undefined} // avoid default tooltip behavior
            >
              {label}
            </span>
          </TooltipTrigger>
          {isLabelTruncated && (
            <TooltipContent sideOffset={-8} className="top-2.5 mt-2 max-w-xs text-sm">
              {label}
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span
              ref={valueRef}
              className="max-w-full truncate text-right text-sm"
              title={undefined} // avoid default tooltip behavior
            >
              {value}
            </span>
          </TooltipTrigger>
          {isValueTruncated && (
            <TooltipContent sideOffset={-8} className="top-2.5 mt-2 max-w-xs text-sm">
              {value}
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};
