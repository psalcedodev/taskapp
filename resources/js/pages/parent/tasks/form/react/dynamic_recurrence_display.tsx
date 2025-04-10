import { FieldDomain } from '@/components/domain_driven/field_domain';
import { useDDFieldSync } from '@/hex/use_dd_field_sync';
import React from 'react';

// Define the parts of the domain needed (simplified)
interface DynamicRecurrenceDomain {
  is_recurring: FieldDomain<boolean>;
  // Renaming for clarity within this component
  selected_recurrence_days: FieldDomain<string[]> | undefined; // Can be undefined if not applicable/passed
}

interface DynamicRecurrenceDisplayProps {
  domain: DynamicRecurrenceDomain;
  isEditing?: boolean; // Add flag to force default display
}

const formatDays = (days: string[] | undefined): string => {
  if (!days || days.length === 0) return '';
  // Simple join, consider ordering (e.g., M, T, W...) if needed
  // Example ordering:
  const dayOrder = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']; // Assuming these are the values stored
  const sortedDays = days.sort((a, b) => dayOrder.indexOf(a) - dayOrder.indexOf(b));
  return sortedDays.join(', ');
};

export const DynamicRecurrenceDisplay: React.FC<DynamicRecurrenceDisplayProps> = ({ domain, isEditing = false }) => {
  // Sync with the domain fields
  useDDFieldSync(domain.is_recurring);
  if (domain.selected_recurrence_days) {
    useDDFieldSync(domain.selected_recurrence_days);
  }

  // If editing, always show the default text
  if (isEditing) {
    return <>Set Recurrence...</>;
  }

  const isRecurring = domain.is_recurring.getValue();
  const selectedDays = domain.selected_recurrence_days?.getValue(); // Get value safely

  if (!isRecurring || !selectedDays || selectedDays.length === 0) {
    return <>Set Recurrence...</>;
  }

  // Display selected days
  const daysString = formatDays(selectedDays);
  return <>Repeats on {daysString}</>;
};
