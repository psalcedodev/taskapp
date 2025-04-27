import { Avatar, AvatarFallback } from '@/components/ui/avatar'; // Using default shadcn avatar
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useInitials } from '@/hooks/use-initials'; // Assuming you have this
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { formatDistanceToNow, parseISO } from 'date-fns'; // For relative time
import { CheckCheck, CheckCircle, Clock, Coins, ListChecks, Loader2, ShoppingBag, Store, UserPlus, Users, XCircle } from 'lucide-react'; // Icons
import { useEffect, useMemo, useState } from 'react'; // Import useState, useMemo, and useEffect
import { toast } from 'sonner'; // Import toast
import { FamilyDashboardDomain } from './family_dashboard_domain';

// --- Mock Data Interfaces (as defined in previous step) ---
interface MockChildSummary {
  id: number;
  name: string;
  color: string;
  token_balance: number;
  current_daily_streak: number;
}

interface MockPendingApproval {
  assignment_id: number;
  child_name: string;
  task_title: string;
  completed_at: string; // ISO date string
  isLoading?: boolean; // Optional loading state
}

interface MockRecentActivity {
  id: string; // Unique key
  type: 'task_approved' | 'task_completed' | 'purchase' | 'tokens_adjusted';
  timestamp: string; // ISO date string
  description: string;
  child_name?: string; // Optional depending on type
}

export default function Dashboard() {
  const getInitials = useInitials(); // Initialize the hook

  // --- Mock Data (Will be replaced by API data later) ---
  // We need useState to manage the list state for removal
  const [pendingApprovals, setPendingApprovals] = useState<MockPendingApproval[]>([
    {
      assignment_id: 101,
      child_name: 'Alexander',
      task_title: 'Eat All Lunch at School',
      completed_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
    // { assignment_id: 102, child_name: 'Sophia', task_title: 'Practice Piano', completed_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString() },
  ]);

  // (Other mock data can remain static for now)
  const mockChildrenSummaries: MockChildSummary[] = [{ id: 1, name: 'Alexander', color: '#FF3131', token_balance: 5, current_daily_streak: 3 }];
  const mockRecentActivities: MockRecentActivity[] = [
    {
      id: 'a1',
      type: 'task_completed',
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      description: 'Completed: Brush Teeth (AM)',
      child_name: 'Alexander',
    },
    // ... other activities
  ];
  const mockStats = { tasksCompletedToday: 5, totalPending: pendingApprovals.length }; // Derive from state
  // --- End Mock Data ---

  // --- API Call Handlers ---
  const handleApprovalAction = async (assignmentId: number, action: 'approved' | 'rejected') => {
    // Optionally set a local loading state for the specific button if needed
    try {
      const result = await domain.approveOrRejectTask(assignmentId, action);
      toast.success(result.message || `Task ${action} successfully!`);
      // No need to manually update state here, as the domain refetches
    } catch (error: any) {
      console.error(`Error ${action} task:`, error);
      const message = error.response?.data?.message || `Failed to ${action} task. Please try again.`;
      toast.error(message);
    } finally {
      // Reset local button loading state if used
    }
  };

  const renderActivityIcon = (type: MockRecentActivity['type']) => {
    switch (type) {
      case 'task_approved':
        return <CheckCheck className="h-4 w-4 text-green-600" />;
      case 'task_completed':
        return <ListChecks className="h-4 w-4 text-blue-600" />;
      case 'purchase':
        return <ShoppingBag className="h-4 w-4 text-red-600" />;
      case 'tokens_adjusted':
        return <Coins className="h-4 w-4 text-yellow-600" />;
      default:
        return <div className="h-4 w-4" />; // Placeholder
    }
  };

  const domain = useMemo(() => new FamilyDashboardDomain(), []);

  useEffect(() => {
    domain.listChildren();
    domain.listPendingApprovals();
    domain.listRecentActivities();
  }, [domain]); // Dependency array ensures it runs once

  return (
    <AppLayout title="Family Dashboard">
      <Head title="Family Dashboard" />
      <div className="flex h-full flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
        {/* Top Row */}
        <div className="grid auto-rows-min gap-4 md:grid-cols-3 md:gap-6">
          {/* Children Summary Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Children Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {mockChildrenSummaries.map((child) => (
                <div key={child.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8 border-2" style={{ borderColor: child.color }}>
                      <AvatarFallback style={{ backgroundColor: `${child.color}20` }} className="text-xs">
                        {getInitials(child.name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{child.name}</span>
                  </div>
                  <div className="text-muted-foreground flex items-center gap-3 text-sm">
                    <span title={`Streak: ${child.current_daily_streak} days`}>🔥 {child.current_daily_streak}</span>
                    <span className="flex items-center gap-1" title="Token Balance">
                      <Coins className="h-4 w-4 text-yellow-500" />
                      {child.token_balance}
                    </span>
                  </div>
                </div>
              ))}
              <Button variant="outline" size="sm" className="mt-2 w-full">
                <Link href="#">
                  <UserPlus className="mr-2 h-4 w-4" /> Manage Children
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Pending Approvals Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-orange-600" />
                Pending Approvals ({pendingApprovals.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {pendingApprovals.length > 0 ? (
                pendingApprovals.map((approval) => (
                  <div key={approval.assignment_id} className="flex items-center justify-between gap-2">
                    <div className="flex-grow">
                      <span className="font-medium">{approval.child_name}:</span> {approval.task_title}
                      <p className="text-muted-foreground text-xs">{formatDistanceToNow(parseISO(approval.completed_at), { addSuffix: true })}</p>
                    </div>
                    {/* Action Buttons */}
                    <div className="flex flex-shrink-0 gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-red-600 hover:bg-red-100 hover:text-red-700 disabled:opacity-50"
                        onClick={() => handleApprovalAction(approval.assignment_id, 'rejected')}
                        disabled={approval.isLoading}
                        title="Reject"
                      >
                        {approval.isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-green-600 hover:bg-green-100 hover:text-green-700 disabled:opacity-50"
                        onClick={() => handleApprovalAction(approval.assignment_id, 'approved')}
                        disabled={approval.isLoading}
                        title="Approve"
                      >
                        {approval.isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground">No tasks waiting for approval.</p>
              )}
            </CardContent>
          </Card>

          {/* Quick Links / Stats Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store className="h-5 w-5" />
                Quick Actions & Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <Button variant="outline">
                <Link href="#"> {/* TODO: Add link to manage tasks */} Manage Tasks</Link>
              </Button>
              <Button variant="outline">
                <Link href="#"> {/* TODO: Add link to shop */} View Reward Shop</Link>
              </Button>
              <div className="text-muted-foreground mt-2 border-t pt-2 text-sm">
                <p>Tasks Completed Today: {mockStats.tasksCompletedToday}</p>
                <p>Pending Approval: {mockStats.totalPending}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Section: Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest updates from the family.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {mockRecentActivities.map((activity) => (
                <li key={activity.id} className="flex items-center gap-3 text-sm">
                  <div className="bg-muted flex h-6 w-6 items-center justify-center rounded-full">{renderActivityIcon(activity.type)}</div>
                  <span className="flex-grow">
                    {activity.child_name && <span className="font-medium">{activity.child_name}: </span>}
                    {activity.description}
                  </span>
                  <span className="text-muted-foreground flex-shrink-0 text-xs">
                    {formatDistanceToNow(parseISO(activity.timestamp), { addSuffix: true })}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
