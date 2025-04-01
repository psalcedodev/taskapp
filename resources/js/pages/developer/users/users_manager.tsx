import { ColumnDef, VirtualizedResizableTable } from '@/components/domain_driven/table/table_data';
import { IconButton } from '@/components/ui/icon-button';
import AppLayout from '@/layouts/app-layout';
import { User } from '@/types';
import { Head } from '@inertiajs/react';
import { PencilIcon, Trash2Icon } from 'lucide-react';
import React from 'react';
import { UsersManagerPresenter } from './users_manager_presenter';

export interface UsersManagerProps {}
export const UsersManager: React.FC<UsersManagerProps> = () => {
  const [presenter] = React.useState(() => {
    return new UsersManagerPresenter();
  });

  const columns: ColumnDef<User>[] = [
    {
      id: 'id',
      accessorKey: 'id',
      header: 'ID',
      size: 150,
      cell: (row) => row.id,
      sortable: true,
    },
    {
      id: 'name',
      accessorKey: 'name',
      header: 'Name',
      size: 150,
      cell: (row) => row.name,
      sortable: true,
    },
    {
      id: 'email',
      accessorKey: 'email',
      header: 'email',
      size: 200,
      cell: (row) => row.email,
      sortable: true,
    },
    {
      id: 'created_at',
      accessorKey: 'created_at',
      header: 'created_at',
      cell: (row) => row.created_at,
    },
    {
      id: 'email_verified_at',
      accessorKey: 'email_verified_at',
      header: 'email_verified_at',
      cell: (row) => row.email_verified_at,
    },
  ];

  return (
    <AppLayout>
      <Head title="Dashboard" />
      <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
        <VirtualizedResizableTable
          title="Users Manager"
          columns={columns}
          dataRunner={presenter.usersRunner}
          actionsColumnWidth={90}
          actionsCell={(row) => (
            <div className="flex gap-2">
              <IconButton Icon={PencilIcon} onClick={() => console.log('Edit', row.id)} />
              <IconButton Icon={Trash2Icon} onClick={() => console.log('Delete', row.id)} />
            </div>
          )}
        />
      </div>
    </AppLayout>
  );
};

export default UsersManager;
