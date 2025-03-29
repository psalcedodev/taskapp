import { useState } from 'react';
import { ActionBroadcast, Status } from '@/hooks/action_signal';
import { Broadcast } from '@/hooks/signal';
import { useAsyncValue } from '@/hooks/use_async_value';

export interface StatusHelper {
  status: Status;
  isInitial: boolean;
  isPending: boolean;
  isSuccess: boolean;
  isError: boolean;
}

export function useAsyncStatus(
  broadcast: ActionBroadcast<any> | Broadcast<Status, any>,
) {
  const status = useAsyncValue(
    'status' in broadcast ? broadcast.status : broadcast,
  );

  // We use the same object to reduce memory churn.
  const [statusObject] = useState<StatusHelper>(() => ({
    status: status,
    isInitial: status === Status.INITIAL,
    isPending: status === Status.PENDING,
    isSuccess: status === Status.SUCCESS,
    isError: status === Status.ERROR,
  }));

  statusObject.status = status;
  statusObject.isInitial = status === Status.INITIAL;
  statusObject.isPending = status === Status.PENDING;
  statusObject.isSuccess = status === Status.SUCCESS;
  statusObject.isError = status === Status.ERROR;

  return statusObject;
}
