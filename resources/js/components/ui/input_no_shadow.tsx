import * as React from 'react';

import { cn } from '@/lib/utils';

function InputNoShadow({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'border-input file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
        'focus:shadow-[0_0_0_2px_rgba(0,0,0,0.2)]',
        'aria-invalid:border-destructive',
        className,
      )}
      {...props}
    />
  );
}

export { InputNoShadow };
