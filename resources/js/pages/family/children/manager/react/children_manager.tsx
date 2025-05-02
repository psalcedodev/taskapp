import { useAsyncValue } from '@/hooks/use_async_value';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import React from 'react';
import { ChildrenApiAdapter } from '../../adapter/children_api_adapter';
import { ChildrenCreateModal } from '../../create/react/children_create_modal';
import { ChildrenEditModal } from '../../edit/react/children_edit_modal';
import { ChildrenManagerPresenter } from '../children_manager_presenter';
import { ChildrenSidebar } from './children_sidebar';
import { ChildrenTable } from './children_table';
import { DeleteChild } from './delete_child';

export const ChildrenManager = () => {
  const [api] = React.useState(() => new ChildrenApiAdapter());
  const [presenter] = React.useState(() => new ChildrenManagerPresenter(api));
  const selectedChild = useAsyncValue(presenter.selectedChild);
  const createPresenter = useAsyncValue(presenter.createPresenter);
  const childToDelete = useAsyncValue(presenter.childToDelete);
  const childToEdit = useAsyncValue(presenter.childToEdit);

  return (
    <AppLayout title="Children Manager">
      <Head title="Children Manager" />
      <div className="flex h-full w-full flex-row gap-4 p-4">
        <ChildrenTable presenter={presenter} />
        {selectedChild && <ChildrenSidebar child={selectedChild} onClose={() => presenter.setSelectedChild(null)} />}
      </div>
      {createPresenter && <ChildrenCreateModal presenter={createPresenter} onClose={() => presenter.closeCreateModal()} />}
      {childToEdit && (
        <ChildrenEditModal child={childToEdit} onClose={() => presenter.stopEditChild()} onSuccess={() => presenter.onSuccessfulEditChild()} />
      )}
      {childToDelete && <DeleteChild presenter={presenter} />}
    </AppLayout>
  );
};

export default ChildrenManager;
