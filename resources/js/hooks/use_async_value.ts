import { useLayoutEffect, useRef } from 'react';
import { useUpdate } from '@/hooks/use_update';
import { Broadcast } from '@/hooks/signal';

export function useAsyncValue<TValue, TInitial = TValue>(
  broadcast: Broadcast<TValue, TInitial>,
) {
  const update = useUpdate();
  const versionRef = useRef(broadcast.valueVersion);

  useLayoutEffect(() => {
    const unsubscribe = broadcast.onChange(update);
    if (versionRef.current !== broadcast.valueVersion) {
      update();
    }
    return () => unsubscribe();
  }, [broadcast, update]);

  return broadcast.getValue();
}
