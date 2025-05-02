import { ColumnDef } from '@/components/domain_driven/table/table_data';
import { Child } from '../../children_types';

export const childrenTableColumns: ColumnDef<Child>[] = [
  {
    id: 'name',
    accessorKey: 'name',
    header: 'Name',
    cell: (row) => row.name,
    sortable: true,
  },
  {
    id: 'token_balance',
    accessorKey: 'token_balance',
    header: 'Tokens',
    cell: (row) => row.token_balance,
    sortable: true,
  },
  {
    id: 'color',
    accessorKey: 'color',
    header: 'Color',
    cell: (row) => {
      return <span style={{ background: row.color, display: 'inline-block', width: 20, height: 20, borderRadius: '50%' }}>{row.color}</span>;
    },
  },
];
