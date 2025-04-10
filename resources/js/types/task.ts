export interface Task {
  id: string;
  title: string;
  assignedTo: string | string[];
  visibleTime: {
    start: string;
    end: string;
  };
  tokens: number;
  status?: 'pending' | 'completed' | 'pending_approval';
  requiresApproval?: boolean;
  isGroupTask?: boolean;
  timeSlot: 'morning' | 'afternoon' | 'evening' | 'night';
}
