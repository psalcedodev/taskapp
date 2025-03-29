import { DataTableProps, Idable, TableData } from '@/components/domain_driven/table/table_data';
import { AsyncActionRunner } from '@/hex/async_action_runner';
import { useAsyncStatus } from '@/hooks/use_async_status';
import { useAsyncValue } from '@/hooks/use_async_value';

interface TableProps<T extends Idable> extends Omit<DataTableProps<T>, 'data' | 'isPending'> {
  data: AsyncActionRunner<T[]>;
}

export function Table<T extends Idable>({ data, ...props }: TableProps<T>) {
  const loadedData = useAsyncValue(data);
  const { isPending } = useAsyncStatus(data);

  return <TableData {...props} data={loadedData} isPending={isPending} />;
}
