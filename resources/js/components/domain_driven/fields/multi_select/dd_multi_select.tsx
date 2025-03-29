import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import clsx from 'clsx';
import { ChevronDownIcon, Loader, TriangleAlert, XIcon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { FieldDomain } from '@/components/domain_driven/field_domain';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useDDFieldSync } from '@/hex/use_dd_field_sync';
import { cn } from '@/lib/utils';

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
}

export const DDMultiSelectField = <T,>({ domain, options, loading, placeHolder }: DDMultiSelectFieldProps<T>) => {
  const { onChange, errorMessage } = useDDFieldSync(domain);
  const selectedOptions = domain.getValue();
  const label = domain.getLabel();
  const disabled = domain.getIsDisabled();
  const description = domain.getDescription();

  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

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
    const maxVisibleItems = 1; // Number of items to display before truncating
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

  return (
    <div className="w-full rounded-md">
      <Popover open={isOpen}>
        <PopoverTrigger asChild>
          <div className={clsx('flex flex-col gap-1')}>
            <Label
              data-slot="form-label"
              data-error={!!errorMessage}
              className={cn('data-[error=true]:text-destructive-foreground flex items-center')}
            >
              {label}
            </Label>
            <div
              ref={triggerRef}
              className={clsx(
                'border-input file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground relative flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
                'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
                'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
                disabled ? 'bg-muted cursor-not-allowed' : 'cursor-pointer',
                errorMessage && !disabled ? 'ring-red-200 focus:ring-red-300' : 'focus:ring-black/20',
              )}
              onClick={() => !disabled && setIsOpen((prev) => !prev)}
            >
              <span className={clsx('text-foreground flex items-center truncate', disabled ? 'text-muted' : errorMessage ? 'text-destructive' : '')}>
                {selectedOptions.length ? renderSelectedItems() : placeHolder ? placeHolder : 'Select Items'}
              </span>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2">
                {loading && !errorMessage && <Loader className="h-4 w-4 animate-spin" />}
                {!loading && !errorMessage && <ChevronDownIcon className="text-foreground h-4 w-4" aria-hidden="true" />}
                {errorMessage && !disabled && <TriangleAlert className="text-destructive-foreground h-5 w-5" />}
              </div>
            </div>
          </div>
        </PopoverTrigger>
        <p className={cn('text-muted-foreground mt-1 text-xs', errorMessage && 'text-destructive-foreground')}>
          {errorMessage ? errorMessage : description}
        </p>
        <PopoverContent ref={popoverRef} className="h-full w-96 rounded-md p-4">
          <Input placeholder="Search..." onChange={(event) => setSearchTerm(event.target.value)} value={searchTerm} disabled={disabled} type="text" />
          <div
            style={{
              height: '200px',
              overflowY: 'auto',
            }}
          >
            <div className="my-2">
              <OptionsSectionHeader title="Selected Options" handleSelectAll={handleDeselectAll} optCount={selectedOptions.length} isAdd={false} />
              <div className="bg-background h-36 rounded-sm border" style={{ overflowY: 'scroll' }}>
                {selectedOptions.length > 0 ? (
                  <div>
                    {selectedOptions.map((item) => (
                      <div
                        key={item.id}
                        className="hover:bg-accent flex cursor-pointer items-center justify-between border-b px-2 py-1 last:border-b-0"
                        onClick={() => handleRemove(item)}
                      >
                        <div className="w-full max-w-[280px] truncate text-left text-sm">{item.label}</div>
                        <button type="button" className="text-destructive ml-2 flex-shrink-0">
                          <XIcon className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex h-36 items-center justify-center px-2 text-center text-sm text-gray-500">No items selected</div>
                )}
              </div>
            </div>
            <div className="my-2">
              <OptionsSectionHeader title="Available Options" handleSelectAll={handleSelectAll} optCount={filteredOptions.length} isAdd />
              <div className="bg-background h-36 rounded-sm border" style={{ overflowY: 'scroll' }}>
                {filteredOptions.length > 0 ? (
                  <div>
                    {filteredOptions.map((option) => (
                      <div
                        key={option.id}
                        className="hover:bg-accent flex cursor-pointer items-center border-b px-2 py-1 last:border-b-0"
                        onClick={() => handleSelect(option)}
                      >
                        <Checkbox
                          checked={selectedOptions.some((item) => item.id === option.id)}
                          className="mr-2 flex-shrink-0"
                          onCheckedChange={() => handleSelect(option)}
                        />
                        <div className="max-w-[280px] truncate text-left text-sm">{option.label}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex h-36 items-center justify-center px-2 text-center text-sm text-gray-500">
                    {searchTerm ? 'No matching options found' : 'No options available'}
                  </div>
                )}
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export const OptionsSectionHeader = ({
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
      <button className="text-foreground text-sm" onClick={handleSelectAll}>
        {isAdd ? 'Add All' : 'Remove All'}
      </button>
    </div>
  );
};
