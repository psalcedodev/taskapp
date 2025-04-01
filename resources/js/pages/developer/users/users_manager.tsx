import { getColumnCell } from '@/components/domain_driven/table/column_builder';
import { VirtualizedResizableTable } from '@/components/domain_driven/table/table_data';
import { IconButton } from '@/components/ui/icon-button';
import { useAsyncStatus } from '@/hooks/use_async_status';
import { useAsyncValue } from '@/hooks/use_async_value';
import AppLayout from '@/layouts/app-layout';
import { User } from '@/types';
import { Head } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { PencilIcon, Trash2Icon } from 'lucide-react';
import React from 'react';
import { UsersManagerPresenter } from './users_manager_presenter';

export interface UsersManagerProps {}
export const UsersManager: React.FC<UsersManagerProps> = () => {
  const [presenter] = React.useState(() => {
    return new UsersManagerPresenter();
  });

  const { isPending } = useAsyncStatus(presenter.usersRunner);
  const users = useAsyncValue(presenter.usersRunner);
  console.log('users', users);
  console.log('isPending', isPending);

  const columnsv1: ColumnDef<User>[] = [
    {
      id: 'id',
      accessorKey: 'id',
      header: 'id',
      size: 50,
      cell: ({ row }) => getColumnCell({ cell: row.original.id }),
    },
    {
      id: 'name',
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => getColumnCell({ cell: row.original.name }),
    },
    {
      id: 'email',
      accessorKey: 'email',
      header: 'email',
      cell: ({ row }) => getColumnCell({ cell: row.original.email }),
    },
    {
      id: 'email2',
      accessorKey: 'email2',
      header: 'email',
      cell: ({ row }) => getColumnCell({ cell: row.original.email }),
    },
    {
      id: 'email3',
      accessorKey: 'email3',
      header: 'email',
      cell: ({ row }) => getColumnCell({ cell: row.original.email }),
    },
    {
      id: 'avatar',
      accessorKey: 'avatar',
      header: 'avatar',
      cell: ({ row }) => getColumnCell({ cell: row.original.avatar }),
    },
    {
      id: 'created_at',
      accessorKey: 'created_at',
      header: 'created_at',
      cell: ({ row }) => getColumnCell({ cell: row.original.created_at }),
    },
    {
      id: 'updated_at',
      accessorKey: 'updated_at',
      header: 'updated_at',
      cell: ({ row }) => getColumnCell({ cell: row.original.updated_at }),
    },
    {
      id: 'email_verified_at',
      accessorKey: 'email_verified_at',
      header: 'email_verified_at',
      cell: ({ row }) => getColumnCell({ cell: row.original.email_verified_at }),
    },
    {
      id: 'actions',
      accessorKey: 'actions',
      header: 'Actions',
      size: 100,
      cell: ({ row }) => (
        <div className="flex gap-2">
          <IconButton
            Icon={PencilIcon}
            onClick={(e) => {
              e.stopPropagation();
              //   presenter.setCategoryToEdit(row.original);
            }}
          />
          <IconButton
            Icon={Trash2Icon}
            onClick={(e) => {
              e.stopPropagation();
              //   presenter.deleteCategory(row.original);
            }}
          />
        </div>
      ),
    },
  ];

  const columns = [
    { key: 'id', label: 'ID', width: 100 },
    { key: 'firstName', label: 'First Name', width: 180 },
    { key: 'lastName', label: 'Last Name', width: 180 },
    { key: 'email', label: 'Email', width: 250 },
    { key: 'role', label: 'Role', width: 150 },
    // Add as many columns as you like
  ];

  const data = Array.from({ length: 1000 }).map((_, i) => ({
    id: i + 1,
    firstName: `John ${i + 1}`,
    lastName: `Doe ${i + 1}`,
    email: `john.doe${i + 1}@example.com`,
    role: i % 2 === 0 ? 'User' : 'Admin',
  }));
  return (
    <AppLayout>
      <Head title="Dashboard" />
      <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
        <VirtualizedResizableTable columns={columns} data={data} actionsColumnWidth={20} />
      </div>
    </AppLayout>
  );
};

export default UsersManager;
