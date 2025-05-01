import { AsyncActionRunner } from '@/hex/async_action_runner';
import axios from 'axios';

// Define interfaces based on family_dashboard.tsx mock data
export interface Child {
  id: number;
  name: string;
  color: string;
  token_balance: number;
  current_daily_streak: number;
}

export interface PendingApproval {
  assignment_id: number;
  child_name: string;
  task_title: string;
  completed_at: string; // ISO date string
  isLoading?: boolean; // Optional: Domain might handle loading state differently
}

export interface RecentActivity {
  id: string; // Unique key
  type: 'task_approved' | 'task_completed' | 'purchase' | 'tokens_adjusted';
  timestamp: string; // ISO date string
  description: string;
  child_name?: string; // Optional depending on type
}

export class FamilyDashboardDomain {
  children: AsyncActionRunner<Child[]>;
  pendingApprovals: AsyncActionRunner<PendingApproval[]>;
  recentActivities: AsyncActionRunner<RecentActivity[]>;

  constructor() {
    this.children = new AsyncActionRunner<Child[]>([]);
    this.pendingApprovals = new AsyncActionRunner<PendingApproval[]>([]);
    this.recentActivities = new AsyncActionRunner<RecentActivity[]>([]);
  }

  listChildren() {
    this.children.execute(async () => {
      // TODO: Replace 'route' with actual API endpoint
      const response = await axios.get<{ data: Child[] }>('/api/family/children');
      console.log({ children: response.data });
      return response.data.data; // Assuming backend wraps data
    });
  }

  listPendingApprovals() {
    this.pendingApprovals.execute(async () => {
      const response = await axios.get<{ data: PendingApproval[] }>('/api/family/assignments/pending');
      return response.data.data;
    });
  }

  listRecentActivities() {
    this.recentActivities.execute(async () => {
      // TODO: Replace 'route' with actual API endpoint
      const response = await axios.get<{ data: RecentActivity[] }>('/api/family/recent-activities');
      return response.data.data; // Assuming backend wraps data
    });
  }

  /**
   * Approves or rejects a pending task assignment.
   * Refetches the pending approvals list on success.
   */
  async approveOrRejectTask(assignmentId: number, action: 'approved' | 'rejected'): Promise<{ message: string }> {
    try {
      const response = await axios.patch<{ message: string; assignment: any }>(
        route('api.family.assignments.updateStatus', { assignment: assignmentId }),
        {
          status: action,
        },
      );

      // On success, refetch the pending approvals list
      this.listPendingApprovals();

      return response.data;
    } catch (error) {
      console.error(`Error ${action} task ${assignmentId}:`, error);
      throw error;
    }
  }
}
