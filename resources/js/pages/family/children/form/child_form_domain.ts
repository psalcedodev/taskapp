import { FieldDomain } from '@/components/domain_driven/field_domain';
import { pin, required } from '@/components/domain_driven/field_validators';
import { ChildFormData } from '../children_types';

export class ChildFormDomain {
  // Form fields
  nameField: FieldDomain<string>;
  pinField: FieldDomain<string>;
  tokenBalanceField: FieldDomain<number | null>;
  avatarUrlField: FieldDomain<string>;
  colorField: FieldDomain<string>;

  constructor(child: ChildFormData) {
    this.nameField = new FieldDomain<string>('name', child.name, {
      shouldValidateOnChange: true,
      validate: required(),
    });
    this.pinField = new FieldDomain<string>('pin', '', {
      shouldValidateOnChange: true,
      validate: pin(),
    });
    this.tokenBalanceField = new FieldDomain<number | null>('token_balance', child.token_balance);
    this.avatarUrlField = new FieldDomain<string>('avatar_url', child.avatar_url || '');
    this.colorField = new FieldDomain<string>('color', child.color);
  }

  resetFields() {
    this.nameField.setValue('');
    this.pinField.setValue('');
    this.tokenBalanceField.setValue(0);
    this.avatarUrlField.setValue('');
    this.colorField.setValue('#000000');
  }

  async validate(): Promise<boolean> {
    // try {
    //   await this.nameField.validate();
    //   await this.pinField.validate();
    //   return true;
    // } catch (error) {
    //   return false;
    // }

    // or

    const fields = [this.nameField, this.pinField];
    const result = await Promise.all(
      fields.map((field) =>
        field
          .validate()
          .then(() => true)
          .catch(() => false),
      ),
    );
    return result.every(Boolean);
  }

  getFormData(): ChildFormData {
    return {
      name: this.nameField.getValue().trim(),
      pin: this.pinField.getValue().trim(),
      token_balance: this.tokenBalanceField.getValue() || 0,
      avatar_url: this.avatarUrlField.getValue().trim() || undefined,
      color: this.colorField.getValue().trim(),
    };
  }
}
