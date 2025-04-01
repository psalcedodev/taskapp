import { FieldDomain } from '@/components/domain_driven/field_domain';

export class UserFormPresenter implements UserFormPresenterPort {
  name: FieldDomain<string>;
  email: FieldDomain<string>;
  password: FieldDomain<string>;
  constructor() {
    this.name = new FieldDomain<string>('name', '', {
      shouldValidateOnChange: true,
      validate(field) {
        const value = field.getValue();
        if (value === '') {
          throw new Error('Name is required');
        }
      },
    });
    this.email = new FieldDomain<string>('email', '', {
      shouldValidateOnChange: true,
      validate(field) {
        const value = field.getValue();
        if (value === '') {
          throw new Error('Email is required');
        }
        if (!/\S+@\S+\.\S+/.test(value)) {
          throw new Error('Email is invalid');
        }
      },
    });
    this.password = new FieldDomain<string>('password', '', {
      shouldValidateOnChange: true,
      validate(field) {
        const value = field.getValue();
        if (value === '') {
          throw new Error('Password is required');
        }
        if (value.length < 8) {
          throw new Error('Password must be at least 8 characters long');
        }
      },
    });
  }

  getValues() {
    return {
      name: this.name.getValue(),
      email: this.email.getValue(),
      password: this.password.getValue(),
      password_confirmation: this.password.getValue(),
    };
  }

  async isValid() {
    const fields = [this.name, this.email, this.password];
    const result = await Promise.all(
      fields.map(async (field) => {
        return field
          .validate()
          .then(() => true)
          .catch(() => false);
      }),
    );
    return result.every(Boolean);
  }

  isPristine() {
    return this.name.isPristine() && this.email.isPristine() && this.password.isPristine();
  }
}

export interface UserFormPresenterPort {
  name: FieldDomain<string>;
  email: FieldDomain<string>;
  password: FieldDomain<string>;
}
