import { FieldDomain } from '@/components/domain_driven/field_domain';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useDDFieldSync } from '@/hex/use_dd_field_sync';
import { cn } from '@/lib/utils';
import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from '@headlessui/react';
import clsx from 'clsx';
import { CheckIcon, ChevronDownIcon, Loader, TriangleAlert } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

export interface Option<T> {
  id: string;
  value: T;
  label: string;
}

export interface DDSelectFieldProps<T> {
  domain: FieldDomain<Option<T>>;
  options: Option<T>[];
  loading?: boolean;
  disabled?: boolean;
  isInline?: boolean;
}

export const DDSelectField = <T,>({ domain, options, loading, isInline }: DDSelectFieldProps<T>) => {
  const { onChange, errorMessage } = useDDFieldSync(domain);
  const value = domain.getValue();
  const label = domain.getLabel();
  const disabled = domain.getIsDisabled();
  const description = domain.getDescription();

  const [searchTerm, setSearchTerm] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const listboxRef = useRef<HTMLDivElement>(null);

  const filteredOptions = options.filter((option) => option.label.toLowerCase().includes(searchTerm.toLowerCase()));

  const updateCurrentOption = useCallback(() => {
    const currentOption = options.find((option) => option.id === value?.id);
    if (currentOption && (currentOption.id !== value?.id || currentOption.label !== value?.label)) {
      onChange(currentOption);
      domain.upgrade();
    }
  }, [options, value, onChange, domain]);

  const handleClose = () => {
    setIsOptionsOpen(false);
    setTimeout(() => setSearchTerm(''), 100);
  };

  useEffect(() => {
    updateCurrentOption();
  }, [updateCurrentOption]);
  useEffect(() => {
    if (isOptionsOpen) {
      setTimeout(() => {
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }, 0);
    }
  }, [isOptionsOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (listboxRef.current && !listboxRef.current.contains(event.target as Node)) {
        handleClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleClick = () => {
    handleClose();
    setTimeout(() => setIsOptionsOpen(true), 0);
  };

  return (
    <Listbox value={value} onChange={onChange} disabled={disabled} as="div" className="w-full">
      <div className={cn('flex flex-col', isInline && 'flex-row items-center gap-4')}>
        <Label data-slot="form-label" data-error={!!errorMessage} className={cn('data-[error=true]:text-destructive-foreground')}>
          {label}
        </Label>
        <div className="relative mt-2 flex-1" ref={listboxRef}>
          <ListboxButton
            className={clsx(
              'border-input file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
              'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
              'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
              disabled ? 'bg-muted cursor-not-allowed' : 'cursor-pointer',
              errorMessage && !disabled ? 'ring-red-200 focus:ring-red-300' : '',
            )}
            disabled={disabled}
            onClick={handleClick}
          >
            <span className={clsx('flex items-center', disabled ? 'text-muted' : errorMessage ? 'text-destructive' : '')}>{value.label}</span>
            <span className="absolute inset-y-0 right-0 flex items-center pr-2">
              {loading && !errorMessage && <Loader className="h-4 w-4 animate-spin" />}
              {!loading && !errorMessage && <ChevronDownIcon className="h-4 w-4 text-gray-400" aria-hidden="true" />}
              {errorMessage && !disabled && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <TriangleAlert className="h-5 w-5 text-red-400" />
                    </TooltipTrigger>
                    <TooltipContent>{errorMessage}</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </span>
          </ListboxButton>

          <ListboxOptions
            transition
            className="bg-background ring-ring absolute !top-8 z-10 mt-1 max-h-60 w-full overflow-auto rounded-md text-base shadow-lg focus:outline-none data-[leave]:transition data-[leave]:duration-100 data-[leave]:ease-in data-[closed]:data-[leave]:opacity-0 sm:text-sm"
          >
            <div className="bg-background sticky top-[-1px] z-10 p-1">
              <Input
                placeholder="Search..."
                onChange={(event) => setSearchTerm(event.target.value)}
                value={searchTerm}
                disabled={disabled}
                ref={searchInputRef}
                type="text"
              />
            </div>
            {filteredOptions.map((option) => (
              <ListboxOption
                key={option.id}
                value={option}
                className="group data-[focus]:bg-foreground data-[focus]:text-background relative cursor-default py-2 pr-9 pl-3 select-none"
              >
                <span className="truncate font-normal group-data-[selected]:font-semibold">{option.label}</span>
                <span className="group-data-[focus]:text-background absolute inset-y-0 right-0 flex items-center pr-4 [.group:not([data-selected])_&]:hidden">
                  <CheckIcon aria-hidden="true" className="h-5 w-5" />
                </span>
              </ListboxOption>
            ))}
          </ListboxOptions>
        </div>
      </div>
      <p className={cn('text-muted-foreground mt-1 text-xs', errorMessage && 'text-destructive-foreground')}>
        {errorMessage ? errorMessage : description}
      </p>
    </Listbox>
  );
};
