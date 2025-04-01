import React, { MouseEventHandler } from 'react';
import { Loader } from 'lucide-react';
import clsx from 'clsx';
import { TooltipTrigger } from '@radix-ui/react-tooltip';
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

type IconColorShade =
  | '50'
  | '100'
  | '200'
  | '300'
  | '400'
  | '500'
  | '600'
  | '700'
  | '800'
  | '900';
interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  Icon: React.ElementType;
  onClick: MouseEventHandler<HTMLButtonElement>;
  loading?: boolean;
  disabled?: boolean;
  size?: ButtonSize;
  isError?: boolean;
  message?: string;
}

const iconSizeMap = {
  sm: 'w-[16px] h-[16px]',
  md: 'w-[18px] h-[18px]',
  lg: 'w-[20px] h-[20px]',
};

export function IconButton({
  Icon,
  size = 'lg',
  className,
  isError = false,
  message,
  ...props
}: IconButtonProps) {
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
      className={clsx(
        'group/iconbutton flex items-center justify-center rounded-sm',
        {
          [disabledClass]: props.disabled,
          [isError ? errorHover : hoverClass]: !props.disabled,
          [isError ? errorActive : activeClass]: !props.disabled,
          [borderClass]: !props.disabled,
          [isError ? errorBackground : 'active:bg-gray-600']: !props.disabled,
        },
        {
          'w-[18px] h-[18px]': size === 'sm',
          'w-[20px] h-[20px]': size === 'md',
          'w-[24px] h-[24px]': size === 'lg',
        },
        className, // Include any additional className passed as a prop
      )}
      disabled={props.disabled}
      {...props}
    >
      {props.loading ? (
        <Loader className="w-5 h-5 animate-spin" />
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
