import { Child } from '@/types/task';

export interface FormattedTask {
  id: number;
  title: string;
  description: string | null;
  type: string;
  needs_approval: boolean;
  is_mandatory: boolean;
  available_from_time: string | null;
  available_to_time: string | null;
  assignment_status: string;
  children: Child[];
}
