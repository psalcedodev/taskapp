import { FieldDomain } from '@/components/domain_driven/field_domain';
import { useAsyncError } from '@/hooks/use_async_error';
import { useAsyncValue } from '@/hooks/use_async_value';
import { useCallback } from 'react';
export function useDDFieldSync<T, TElement extends HTMLElement>(domain: FieldDomain<T>) {
  useAsyncValue(domain.state);
  useAsyncError(domain.state);
  const isFocused = domain.isFocused();
  const error = domain.getError();
  const errorMessage = error != null ? error.message : undefined;
  const onChange = useCallback(
    function (value: T) {
      domain.touch();
      domain.setValue(value);
      const cb = domain.getOnChangeCallback();
      if (cb != null) {
        cb(domain);
      }
    },
    [domain],
  );
  const onBlur = useCallback(
    function () {
      domain.blur();
    },
    [domain],
  );
  const onFocus = useCallback(
    function () {
      domain.focus();
    },
    [domain],
  );

  // This keeps the field domain and the element in sync with one another coming from
  // the domains side. This will allow developers to focus fields through the domain
  const inputRef = useCallback(
    function (element: TElement) {
      if (element == null) {
        return;
      }
      if (isFocused && document.activeElement !== element) {
        element.focus();
      }
      if (!isFocused && document.activeElement === element) {
        element.blur();
      }
    },
    [isFocused],
  );
  return {
    onChange,
    onBlur,
    onFocus,
    inputRef,
    errorMessage,
  };
}
