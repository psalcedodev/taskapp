import { ColumnDef, VirtualizedResizableTable } from '@/components/domain_driven/table/table_data';
import { TableSidebar } from '@/components/table_sidebar/table_sidebar';
import { IconButton } from '@/components/ui/icon-button';
import { ValueDetail } from '@/components/value_detail/value_detail';
import { useAsyncValue } from '@/hooks/use_async_value';
import AppLayout from '@/layouts/app-layout';
import { User } from '@/types';
import { Head } from '@inertiajs/react';
import { PencilIcon, PlusSquareIcon, Trash2Icon } from 'lucide-react';
import React from 'react';
import { CreateUserModal } from './create/react/create_user_modal';
import { UsersManagerPresenter } from './users_manager_presenter';

export const UsersManager = () => {
  const [presenter] = React.useState(() => {
    return new UsersManagerPresenter();
  });

  const selectedUser = useAsyncValue(presenter.selectedUser);

  const columns: ColumnDef<User>[] = [
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
      header: 'Email',
      size: 200,
      cell: (row) => row.email,
      sortable: true,
    },
    {
      id: 'created_at',
      accessorKey: 'created_at',
      header: 'Created At',
      cell: (row) => row.created_at,
    },
    {
      id: 'email_verified_at',
      accessorKey: 'email_verified_at',
      header: 'Email Verified At',
      cell: (row) => row.email_verified_at,
      size: 200,
    },
  ];

  const createUserPresenter = useAsyncValue(presenter.createUserPresenter);
  return (
    <AppLayout>
      <Head title="Dashboard" />
      <div className="flex h-full w-full flex-row gap-4 p-4">
        <VirtualizedResizableTable
          title="Users Manager"
          columns={columns}
          dataRunner={presenter.usersRunner}
          actionsColumnWidth={90}
          selectedRowId={selectedUser?.id ?? null}
          onRowClick={(row) => presenter.setSelectedUser(row)}
          endAdornments={<IconButton Icon={PlusSquareIcon} onClick={() => presenter.openCreateUserModal()} />}
          actionsCell={(row) => (
            <div className="flex gap-2">
              <IconButton Icon={PencilIcon} onClick={() => console.log('Edit', row.id)} />
              <IconButton Icon={Trash2Icon} onClick={() => console.log('Delete', row.id)} />
            </div>
          )}
        />
        {selectedUser && (
          <TableSidebar title={selectedUser.name} onClose={() => presenter.setSelectedUser(null)}>
            <div className="flex flex-col gap-2">
              <ValueDetail label="ID" value={selectedUser.id} />
              <ValueDetail label="Name" value={selectedUser.name} />
              <ValueDetail label="Email" value={selectedUser.email} />
              <ValueDetail label="Created At" value={selectedUser.created_at} />
              <ValueDetail label="Email Verified At" value={selectedUser.email_verified_at} />
            </div>
          </TableSidebar>
        )}
      </div>
      {createUserPresenter && <CreateUserModal presenter={createUserPresenter} />}
    </AppLayout>
  );
};

export default UsersManager;
