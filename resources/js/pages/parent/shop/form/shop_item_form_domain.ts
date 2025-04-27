import { FieldDomain } from '@/components/domain_driven/field_domain';
import { format, isValid, parseISO } from 'date-fns';
import { ShopItemRequestData } from './types';

// Default values for creating a new shop item form
const defaultShopItemData: ShopItemRequestData = {
  name: '',
  description: '',
  image_path: '',
  token_cost: 10, // Default cost, adjust as needed
  stock: 0,
  needs_approval: false,
  is_limited_time: false,
  available_from: null,
  available_until: null,
  is_active: true,
};

export class ShopItemFormDomain {
  name: FieldDomain<string>;
  description: FieldDomain<string>;
  image_path: FieldDomain<string>;
  token_cost: FieldDomain<number | null>;
  stock: FieldDomain<number | null>;
  needs_approval: FieldDomain<boolean>;
  is_limited_time: FieldDomain<boolean>;
  available_from: FieldDomain<Date | null>;
  available_until: FieldDomain<Date | null>;
  is_active: FieldDomain<boolean>;

  constructor(initialData: ShopItemRequestData = defaultShopItemData) {
    this.name = new FieldDomain('name', initialData.name, {
      label: 'Item Name',
      description: 'The name of the item displayed in the shop.',
      validate: (field) => {
        if (!field.getValue()?.trim()) {
          throw new Error('Item name is required.');
        }
        if (field.getValue().length > 255) {
          throw new Error('Name cannot exceed 255 characters.');
        }
      },
    });

    this.description = new FieldDomain('description', initialData.description ?? '', {
      label: 'Description',
      description: 'A brief description of the item (optional).',
      validate: (field) => {
        if (field.getValue() && field.getValue().length > 65535) {
          throw new Error('Description is too long.');
        }
      },
    });

    this.image_path = new FieldDomain('image_path', initialData.image_path ?? '', {
      label: 'Image URL',
      description: 'Optional URL for the item image.',
      // TODO: Add URL validation if needed
    });

    this.token_cost = new FieldDomain<number | null>('token_cost', initialData.token_cost ?? null, {
      label: 'Token Cost',
      description: 'How many tokens this item costs to purchase.',
      validate: (field) => {
        const cost = field.getValue();
        if (cost === null) return;

        if (typeof cost !== 'number' || isNaN(cost)) {
          throw new Error('Token cost must be a number.');
        }
        if (cost < 0) {
          throw new Error('Token cost cannot be negative.');
        }
        if (!Number.isInteger(cost)) {
          throw new Error('Token cost must be a whole number.');
        }
      },
    });

    this.stock = new FieldDomain<number | null>('stock', initialData.stock ?? 0, {
      label: 'Stock',
      description: 'How many of this item are available (0 for none, or set a positive number).',
      validate: (field) => {
        const value = field.getValue();
        if (typeof value !== 'number' || isNaN(value)) {
          throw new Error('Stock must be a number.');
        }
        if (!Number.isInteger(value)) {
          throw new Error('Stock must be a whole number.');
        }
        if (value < 0) {
          throw new Error('Stock cannot be negative.');
        }
      },
    });

    this.needs_approval = new FieldDomain('needs_approval', initialData.needs_approval ?? false, {
      label: 'Requires Approval',
      description: 'Does a parent need to approve the purchase?',
    });

    this.is_active = new FieldDomain('is_active', initialData.is_active ?? true, {
      label: 'Active',
      description: 'Is this item currently available in the shop?',
    });

    // --- Time Limited Fields ---
    const initialIsLimited = initialData.is_limited_time ?? false;
    this.is_limited_time = new FieldDomain('is_limited_time', initialIsLimited, {
      label: 'Limited Time Offer',
      description: 'Is this item only available for a specific period?',
      onChangeCallback: (field) => {
        const isLimited = field.getValue();
        this.available_from.setIsDisabled(!isLimited);
        this.available_until.setIsDisabled(!isLimited);
      },
    });

    const parseDate = (dateStr: string | null): Date | null => {
      if (!dateStr) return null;
      try {
        const parsed = parseISO(dateStr);
        return isValid(parsed) ? parsed : null;
      } catch {
        return null;
      }
    };

    this.available_from = new FieldDomain('available_from', parseDate(initialData.available_from ?? null), {
      label: 'Available From',
      description: 'Start date/time for limited availability.',
      isDisabled: !initialIsLimited,
    });

    this.available_until = new FieldDomain('available_until', parseDate(initialData.available_until ?? null), {
      label: 'Available Until',
      description: 'End date/time for limited availability.',
      isDisabled: !initialIsLimited,
      validate: (field) => {
        const fromDate = this.available_from.getValue();
        const untilDate = field.getValue();
        if (this.is_limited_time.getValue() && fromDate && untilDate && untilDate < fromDate) {
          throw new Error('Available Until must be after Available From.');
        }
      },
    });
  }

  async validate(): Promise<boolean> {
    const fieldsToValidate = [
      this.name,
      this.description,
      this.image_path,
      this.token_cost,
      this.stock,
      this.needs_approval,
      this.is_active,
      this.is_limited_time,
      this.available_from,
      this.available_until,
    ];

    // Trigger validation on all fields and collect results
    const results = await Promise.all(
      fieldsToValidate.map((field) =>
        field
          .validate()
          .then(() => true)
          .catch(() => false),
      ),
    );

    // Return true if all validations passed
    return results.every(Boolean);
  }

  // Convert domain state back to the request data shape
  toRequestData(): ShopItemRequestData {
    const fromDate = this.available_from.getValue();
    const untilDate = this.available_until.getValue();
    const isLimited = this.is_limited_time.getValue();
    const tokenCost = this.token_cost.getValue();
    const description = this.description.getValue();
    const imagePath = this.image_path.getValue();

    // Helper to format Date to ISO string suitable for backend (YYYY-MM-DD HH:MM:SS)
    const formatDateForAPI = (date: Date | null): string | null => {
      if (!date || !isValid(date)) return null;
      return format(date, 'yyyy-MM-dd HH:mm:ss');
    };

    return {
      name: this.name.getValue(),
      description: description === '' ? null : description,
      image_path: imagePath === '' ? null : imagePath,
      token_cost: tokenCost === null ? 0 : tokenCost,
      stock: this.stock.getValue() ?? 0,
      needs_approval: this.needs_approval.getValue(),
      is_limited_time: isLimited,
      available_from: isLimited ? formatDateForAPI(fromDate) : null,
      available_until: isLimited ? formatDateForAPI(untilDate) : null,
      is_active: this.is_active.getValue(),
    };
  }
}
