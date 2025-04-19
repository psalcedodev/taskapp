import { ColumnDef, VirtualizedResizableTable } from '@/components/domain_driven/table/table_data';
import { TableSidebar } from '@/components/table_sidebar/table_sidebar';
import { IconButton } from '@/components/ui/icon-button';
import { ValueDetail } from '@/components/value_detail/value_detail';
import { useAsyncValue } from '@/hooks/use_async_value';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { Coins, PencilIcon, PlusSquareIcon, Trash2Icon } from 'lucide-react';
import React from 'react';
import { ShopManagerPresenter } from './shop_manager_presenter';
import { ShopItem } from './types';

export const ShopManager = () => {
  const [presenter] = React.useState(() => {
    const presenter = new ShopManagerPresenter();
    presenter.listShopItems(); // Fetch items on init
    return presenter;
  });

  const selectedShopItem = useAsyncValue(presenter.selectedShopItem);

  // Define table columns for Shop Items
  const columns: ColumnDef<ShopItem>[] = [
    {
      id: 'name',
      accessorKey: 'name',
      header: 'Name',
      cell: (row) => row.name,
      sortable: true,
    },
    {
      id: 'description',
      accessorKey: 'description',
      header: 'Description',
      cell: (row) => <span className="line-clamp-2">{row.description || '-'}</span>, // Truncate long desc
    },
    {
      id: 'token_cost',
      accessorKey: 'token_cost',
      header: 'Cost',
      cell: (row) => (
        <span className="flex items-center gap-1 whitespace-nowrap">
          <Coins className="h-4 w-4 text-yellow-500" /> {row.token_cost}
        </span>
      ),
      sortable: true,
    },
    {
      id: 'stock',
      accessorKey: 'stock',
      header: 'Stock',
      cell: (row) => (row.stock === null ? 'Unlimited' : row.stock),
      sortable: true,
    },
    {
      id: 'is_active',
      accessorKey: 'is_active',
      header: 'Active',
      cell: (row) => (row.is_active ? 'Yes' : 'No'),
      sortable: true,
    },
  ];

  return (
    <AppLayout>
      <Head title="Shop Manager" />
      <div className="flex h-full w-full flex-row gap-4 p-4">
        <VirtualizedResizableTable
          title="Shop Items"
          columns={columns}
          dataRunner={presenter.shopItemsRunner}
          actionsColumnWidth={90}
          selectedRowId={selectedShopItem?.id ?? null}
          onRowClick={(row) => presenter.setSelectedShopItem(row)}
          endAdornments={<IconButton Icon={PlusSquareIcon} onClick={() => presenter.openCreateItemModal()} title="Add New Item" />}
          actionsCell={(row) => (
            <div className="flex gap-2">
              <IconButton Icon={PencilIcon} onClick={() => presenter.startEditItem(row.id)} title="Edit Item" />
              <IconButton Icon={Trash2Icon} onClick={() => presenter.startDeleteItem(row)} title="Delete Item" isError />
            </div>
          )}
        />
        {selectedShopItem && (
          <TableSidebar title={selectedShopItem.name} onClose={() => presenter.setSelectedShopItem(null)}>
            <div className="flex flex-col gap-4 p-2">
              {/* Display selected item details */}
              <ValueDetail label="Description" value={selectedShopItem.description || '-'} />
              <ValueDetail label="Cost" value={`${selectedShopItem.token_cost} tokens`} />
              <ValueDetail label="Stock" value={selectedShopItem.stock === null ? 'Unlimited' : selectedShopItem.stock} />
              <ValueDetail label="Status" value={selectedShopItem.is_active ? 'Active' : 'Inactive'} />
              {/* Add image display if needed */}
              {selectedShopItem.image_url && (
                <div>
                  <h4 className="text-foreground mb-1 text-sm font-medium">Image:</h4>
                  <img src={selectedShopItem.image_url} alt={selectedShopItem.name} className="max-w-full rounded border" />
                </div>
              )}
            </div>
          </TableSidebar>
        )}
      </div>
      {/* TODO: Add Create/Edit/Delete Modals Here Later */}
    </AppLayout>
  );
};

export default ShopManager;
