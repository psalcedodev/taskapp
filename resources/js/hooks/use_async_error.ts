import { Broadcast } from '@/hooks/signal.js';
import { useUpdate } from '@/hooks/use_update.js';
import { useLayoutEffect, useRef } from 'react';

export function useAsyncError<TError>(broadcast: Broadcast<any, TError>) {
  const update = useUpdate();
  const versionRef = useRef(broadcast.errorVersion);

  useLayoutEffect(() => {
    const subscription = broadcast.onError(update);
    if (versionRef.current !== broadcast.valueVersion) {
      update();
    }
    return () => subscription();
  }, [broadcast, update]);

  return broadcast.getError();
}

export function useAsyncErrorMessage<TError extends { message?: string }>(broadcast: Broadcast<any, TError>) {
  const error = useAsyncError(broadcast);
  return error?.message || '';
}
