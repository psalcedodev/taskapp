import { FieldDomain } from '@/components/domain_driven/field_domain';

export function required<T>(msg?: string) {
  return (field: FieldDomain<T>) => {
    const value = field.getValue();
    if (value === undefined || value === null || (typeof value === 'string' && !value.trim())) {
      throw new Error(msg || `${field.getLabel()} is required`);
    }
  };
}

export function minLength(min: number, msg?: string) {
  return (field: FieldDomain<string>) => {
    const value = field.getValue();
    if (value.length < min) {
      throw new Error(msg || `${field.getLabel()} must be at least ${min} characters long`);
    }
  };
}

export function maxLength(max: number, msg?: string) {
  return (field: FieldDomain<string>) => {
    const value = field.getValue();
    if (value.length > max) {
      throw new Error(msg || `${field.getLabel()} must be at most ${max} characters long`);
    }
  };
}

export function email(msg?: string) {
  return (field: FieldDomain<string>) => {
    const value = field.getValue();
    if (!value.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      throw new Error(msg || `${field.getLabel()} must be a valid email address`);
    }
  };
}

export function pin(msg?: string) {
  return (field: FieldDomain<string>) => {
    const value = field.getValue();
    if (!value.match(/^[0-9]{4}$/)) {
      throw new Error(msg || `${field.getLabel()} must be a 4-digit number`);
    }
  };
}

export function number(msg?: string) {
  return (field: FieldDomain<number>) => {
    const value = field.getValue();
    if (typeof value !== 'number' || isNaN(value)) {
      throw new Error(msg || `${field.getLabel()} must be a number`);
    }
  };
}

export function positive(msg?: string) {
  return (field: FieldDomain<number>) => {
    const value = field.getValue();
    if (value <= 0) {
      throw new Error(msg || `${field.getLabel()} must be positive`);
    }
  };
}

export function compose(validators: ((field: FieldDomain<any>) => void)[]) {
  return (field: FieldDomain<any>) => {
    validators.forEach((validator) => validator(field));
  };
}
