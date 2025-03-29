import { Option } from '@/components/domain_driven/fields/select/dd_select_field';
export function enumToList<T extends object>(enumObject: T, enumLabels?: Record<string, string>, valueAsId?: boolean): Option<T[keyof T]>[] {
  return Object.entries(enumObject)
    .filter(([key]) => isNaN(Number(key)))
    .map(([key, value], index) => {
      return {
        id: valueAsId ? value.toString() : (index + 1).toString(), // Use index + 1 to avoid id of 0, especially for UNSPECIFIED enum value
        label: enumLabels
          ? enumLabels[value]
          : key
              .replace(/_/g, '')
              .toLowerCase()
              .replace(/\b\w/g, (l) => l.toUpperCase()),
        value: value,
      };
    });
}
