import { DDTextField } from '@/components/domain_driven/fields/dd_text_field';
import React from 'react';
import { UserFormPresenterPort } from './user_form_presenter';

export interface UserFormProps {
  presenter: UserFormPresenterPort;
}
export const UserForm: React.FC<UserFormProps> = ({ presenter }) => {
  return (
    <div className="flex flex-col gap-4">
      <DDTextField domain={presenter.name} />
      <DDTextField domain={presenter.email} />
      <DDTextField domain={presenter.password} />
    </div>
  );
};
