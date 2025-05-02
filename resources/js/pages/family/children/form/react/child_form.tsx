import { DDNumberField } from '@/components/domain_driven/fields/dd_number_field';
import { DDTextField } from '@/components/domain_driven/fields/dd_text_field';
import React from 'react';
import { ChildFormDomain } from '../child_form_domain';
export interface ChildFormProps {
  domain: ChildFormDomain;
}
export const ChildForm: React.FC<ChildFormProps> = ({ domain }) => {
  return (
    <>
      <DDTextField domain={domain.nameField} />
      <DDTextField domain={domain.pinField} />
      <DDNumberField domain={domain.tokenBalanceField} />
      <DDTextField domain={domain.avatarUrlField} />
      <DDTextField domain={domain.colorField} />
    </>
  );
};
