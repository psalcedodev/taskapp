import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import { useIsMobile } from '@/hooks/use-mobile';
import { type BreadcrumbItem } from '@/types';
import { type PropsWithChildren } from 'react';

export default function AppSidebarLayout({
  children,
  breadcrumbs = [],
  title,
}: PropsWithChildren<{ breadcrumbs?: BreadcrumbItem[]; title: string }>) {
  const isMobile = useIsMobile();

  return (
    <AppShell variant="sidebar">
      <AppSidebar />
      <AppContent variant="sidebar">
        {isMobile && <AppSidebarHeader breadcrumbs={breadcrumbs} title={title} />}
        {children}
      </AppContent>
    </AppShell>
  );
}
