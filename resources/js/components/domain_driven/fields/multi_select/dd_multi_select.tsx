import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import clsx from 'clsx';
import { ChevronDownIcon, Loader, XIcon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { FieldDomain } from '@/components/domain_driven/field_domain';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useDDFieldSync } from '@/hex/use_dd_field_sync';
import { cn } from '@/lib/utils';
import { FieldDescriptionInfo } from '../field_description_info';
import { FieldErrorInfo } from '../field_error_info';

export interface Option<T> {
  id: string;
  value: T;
  label: string;
}

export interface DDMultiSelectFieldProps<T> {
  domain: FieldDomain<Option<T>[]>;
  options: Option<T>[];
  loading?: boolean;
  disabled?: boolean;
  isInline?: boolean;
  placeHolder?: string;
  labelEndAdornment?: React.ReactNode;
  labelClassName?: string;
}

const OptionsSectionHeader = ({
  title,
  handleSelectAll,
  optCount,
  isAdd,
}: {
  title: string;
  handleSelectAll: () => void;
  optCount: number;
  isAdd: boolean;
}) => {
  return (
    <div className="mb-1 flex items-center justify-between">
      <h3 className="text-foreground text-sm font-medium">
        {title} ({optCount})
      </h3>
      <button type="button" className="text-primary hover:text-primary/80 text-sm" onClick={handleSelectAll}>
        {isAdd ? 'Add All' : 'Remove All'}
      </button>
    </div>
  );
};

export const DDMultiSelectField = <T,>({ domain, options, loading, placeHolder, labelEndAdornment, labelClassName }: DDMultiSelectFieldProps<T>) => {
  const { onChange, errorMessage } = useDDFieldSync(domain);
  const selectedOptions = domain.getValue() || [];
  const label = domain.getLabel();
  const disabled = domain.getIsDisabled();
  const description = domain.getDescription();
  const name = domain.getName();

  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const handleSelect = (option: Option<T>) => {
    if (selectedOptions.find((item) => item.id === option.id)) {
      onChange(selectedOptions.filter((item) => item.id !== option.id));
    } else {
      onChange([...selectedOptions, option]);
    }
  };

  const handleRemove = (option: Option<T>) => {
    onChange(selectedOptions.filter((item) => item.id !== option.id));
  };

  const handleSelectAll = () => {
    onChange(options);
  };

  const handleDeselectAll = () => {
    onChange([]);
  };

  const filteredOptions = options.filter((option) => option.label.toLowerCase().includes(searchTerm.toLowerCase()));

  const renderSelectedItems = () => {
    if (selectedOptions.length === 0) {
      return placeHolder || 'Select Items';
    }
    const maxVisibleItems = 1;
    const visibleItems = selectedOptions.slice(0, maxVisibleItems).map((opt) => opt.label);
    const remainingItemsCount = selectedOptions.length - maxVisibleItems;

    if (remainingItemsCount > 0) {
      return `${visibleItems.join(', ')}, +${remainingItemsCount} more`;
    }

    return visibleItems.join(', ');
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [popoverRef, triggerRef]);

  const descriptionInfoElement = <FieldDescriptionInfo description={description} />;
  const errorInfoElement = <FieldErrorInfo errorMessage={errorMessage} />;
  const isErrorIconVisible = !!errorMessage && !disabled;

  return (
    <div className="w-full rounded-md">
      <div className={clsx('flex flex-col gap-1')}>
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center">
            <Label
              data-slot="form-label"
              data-error={!!errorMessage}
              className={cn('data-[error=true]:text-destructive-foreground', labelClassName)}
              htmlFor={name}
            >
              {label}
            </Label>
            {descriptionInfoElement}
            {errorInfoElement}
          </div>
          {labelEndAdornment && <div>{labelEndAdornment}</div>}
        </div>
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <button
              ref={triggerRef}
              id={name}
              type="button"
              role="combobox"
              aria-expanded={isOpen}
              aria-controls={`${name}-listbox`}
              aria-haspopup="listbox"
              disabled={disabled}
              className={clsx(
                'border-input file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground relative flex h-9 w-full min-w-0 items-center justify-between rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
                'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
                errorMessage && !disabled ? 'border-destructive' : '',
                disabled ? 'bg-muted cursor-not-allowed' : 'hover:bg-accent cursor-pointer',
              )}
              onClick={() => !disabled && setIsOpen((prev) => !prev)}
            >
              <span
                className={clsx(
                  'flex items-center truncate',
                  disabled && 'text-muted',
                  !selectedOptions.length && !placeHolder && 'text-muted-foreground',
                )}
              >
                {renderSelectedItems()}
              </span>
              <ChevronDownIcon
                className={cn('text-foreground ml-2 h-4 w-4 flex-shrink-0', isOpen && 'rotate-180 transition-transform')}
                aria-hidden="true"
              />
            </button>
          </PopoverTrigger>
          <PopoverContent
            ref={popoverRef}
            id={`${name}-listbox`}
            className="h-auto w-[--radix-popover-trigger-width] rounded-md p-4"
            align="start"
            onOpenAutoFocus={(e) => e.preventDefault()}
          >
            <Input
              placeholder="Search..."
              onChange={(event) => setSearchTerm(event.target.value)}
              value={searchTerm}
              disabled={disabled}
              type="text"
              className="mb-2"
            />
            {loading ? (
              <div className="flex h-36 items-center justify-center">
                <Loader className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              <div className="flex flex-col gap-2" style={{ maxHeight: '400px' }}>
                <div className="my-1">
                  <OptionsSectionHeader title="Selected" handleSelectAll={handleDeselectAll} optCount={selectedOptions.length} isAdd={false} />
                  <div className="bg-background max-h-36 overflow-y-auto rounded-sm border">
                    {selectedOptions.length > 0 ? (
                      <>
                        {selectedOptions.map((item) => (
                          <div
                            key={item.id}
                            className="hover:bg-accent/50 flex cursor-pointer items-center justify-between border-b px-2 py-1 last:border-b-0"
                            onClick={() => handleRemove(item)}
                          >
                            <div className="w-full max-w-[90%] truncate text-left text-sm">{item.label}</div>
                            <button type="button" className="text-destructive/80 hover:text-destructive ml-1 flex-shrink-0 p-0.5">
                              <XIcon className="h-4 w-4" aria-hidden="true" />
                            </button>
                          </div>
                        ))}
                      </>
                    ) : (
                      <div className="flex h-20 items-center justify-center px-2 text-center text-sm text-gray-500">No items selected</div>
                    )}
                  </div>
                </div>
                <div className="my-1">
                  <OptionsSectionHeader title="Available" handleSelectAll={handleSelectAll} optCount={filteredOptions.length} isAdd={true} />
                  <div className="bg-background max-h-36 overflow-y-auto rounded-sm border">
                    {filteredOptions.length > 0 ? (
                      <>
                        {filteredOptions.map((option) => (
                          <div
                            key={option.id}
                            className="hover:bg-accent/50 flex cursor-pointer items-center border-b px-2 py-1 last:border-b-0"
                            onClick={() => handleSelect(option)}
                          >
                            <Checkbox
                              id={`ms-opt-${option.id}`}
                              checked={selectedOptions.some((item) => item.id === option.id)}
                              className="mr-2 flex-shrink-0"
                              onCheckedChange={() => handleSelect(option)}
                              aria-labelledby={`ms-label-${option.id}`}
                            />
                            <Label
                              htmlFor={`ms-opt-${option.id}`}
                              id={`ms-label-${option.id}`}
                              className="max-w-[90%] cursor-pointer truncate text-left text-sm font-normal"
                            >
                              {option.label}
                            </Label>
                          </div>
                        ))}
                      </>
                    ) : (
                      <div className="flex h-20 items-center justify-center px-2 text-center text-sm text-gray-500">
                        {searchTerm ? 'No matching options' : 'No options available'}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};
