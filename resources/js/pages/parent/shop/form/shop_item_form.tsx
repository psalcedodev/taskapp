import { DDDatePickerField } from '@/components/domain_driven/fields/dd_date_picker_field';
import { DDNumberField } from '@/components/domain_driven/fields/dd_number_field';
import { DDSwitchField } from '@/components/domain_driven/fields/dd_switch_field';
import { DDTextField } from '@/components/domain_driven/fields/dd_text_field';
import React from 'react';
import { ShopItemFormDomain } from './shop_item_form_domain';

interface ShopItemFormProps {
  domain: ShopItemFormDomain;
  isEdit?: boolean; // Optional flag, might be useful later
}

export const ShopItemForm: React.FC<ShopItemFormProps> = ({ domain }) => {
  return (
    <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
      <DDTextField domain={domain.name} />
      <DDTextField domain={domain.description} />
      <DDNumberField
        domain={domain.token_cost}
        min={0} // Allow 0 cost
        step={1} // Only whole numbers
      />
      <DDTextField domain={domain.image_path} placeholder="https://example.com/image.png" />
      <DDNumberField domain={domain.stock} min={0} step={1} />

      <DDSwitchField domain={domain.needs_approval} inline />
      <DDSwitchField domain={domain.is_active} inline />

      <div className="space-y-4 rounded border p-3">
        <DDSwitchField domain={domain.is_limited_time} inline />
        <div className="bg-border h-px w-full" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <DDDatePickerField domain={domain.available_from} nullable clearable />
          <DDDatePickerField domain={domain.available_until} nullable clearable />
        </div>
      </div>

      {/* We typically won't have a submit button directly in the form component itself,
           as the action (create/update) is usually triggered by a button in the modal */}
    </form>
  );
};
