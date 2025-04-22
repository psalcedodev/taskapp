import { TooltipTrigger } from '@radix-ui/react-tooltip';
import clsx from 'clsx';
import { Loader } from 'lucide-react';
import React, { MouseEventHandler } from 'react';
import { Tooltip, TooltipContent, TooltipProvider } from './tooltip';

type ButtonSize = 'sm' | 'md' | 'lg';
type IconColor =
  | 'slate'
  | 'gray'
  | 'zinc'
  | 'neutral'
  | 'stone'
  | 'red'
  | 'orange'
  | 'amber'
  | 'yellow'
  | 'lime'
  | 'green'
  | 'emerald'
  | 'teal'
  | 'cyan'
  | 'sky'
  | 'blue'
  | 'indigo'
  | 'violet'
  | 'purple'
  | 'fuchsia'
  | 'pink'
  | 'rose';

type IconColorShade = '50' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  Icon: React.ElementType;
  onClick: MouseEventHandler<HTMLButtonElement>;
  loading?: boolean;
  disabled?: boolean;
  size?: ButtonSize;
  isError?: boolean;
  message?: string;
  ref?: React.RefObject<HTMLButtonElement | null>;
}

const iconSizeMap = {
  sm: 'w-[16px] h-[16px]',
  md: 'w-[18px] h-[18px]',
  lg: 'w-[20px] h-[20px]',
};

export function IconButton({ Icon, size = 'lg', className, isError = false, message, ref, ...props }: IconButtonProps) {
  const hoverClass = 'hover:border-gray-600';
  const activeClass = 'group-active/iconbutton:bg-gray-600';
  const borderClass = 'border border-transparent';
  const disabledClass = 'cursor-not-allowed opacity-50';

  // Error-specific classes
  const errorBackground = 'active:bg-red-500';
  const errorIcon = 'text-red-500';
  const errorHover = 'hover:border-red-500';
  const errorActive = 'group-active/iconbutton:bg-red-500';
  return (
    <button
      ref={ref}
      className={clsx(
        'group/iconbutton flex cursor-pointer items-center justify-center rounded-xs',
        {
          [disabledClass]: props.disabled,
          [isError ? errorHover : hoverClass]: !props.disabled,
          [isError ? errorActive : activeClass]: !props.disabled,
          [borderClass]: !props.disabled,
          [isError ? errorBackground : 'active:bg-gray-600']: !props.disabled,
        },
        {
          'h-[18px] w-[18px]': size === 'sm',
          'h-[20px] w-[20px]': size === 'md',
          'h-[24px] w-[24px]': size === 'lg',
        },
        className, // Include any additional className passed as a prop
      )}
      disabled={props.disabled}
      {...props}
    >
      {props.loading ? (
        <Loader className="h-5 w-5 animate-spin" />
      ) : (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Icon
                className={clsx(iconSizeMap[size], {
                  [isError ? errorIcon : 'text-gray-600']: !props.disabled,
                  'group-active/iconbutton:text-white': !props.disabled,
                })}
              />
            </TooltipTrigger>
            {message && (
              <TooltipContent align="end" className="z-50" side="left">
                {message}
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      )}
    </button>
  );
}
