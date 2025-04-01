import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { SharedData, type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { CalendarDaysIcon, LayoutGrid, Users2Icon } from 'lucide-react';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
  {
    title: 'Calendar',
    href: '/dashboard',
    icon: CalendarDaysIcon,
  },
];

const developerNavItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: route('developer-dashboard'),
    icon: LayoutGrid,
  },
  {
    title: 'Users',
    href: route('developer-dashboard.users-manager'),
    icon: Users2Icon,
  },
];

// const footerNavItems: NavItem[] = [
//   {
//     title: 'Repository',
//     href: 'https://github.com/laravel/react-starter-kit',
//     icon: Folder,
//   },
//   {
//     title: 'Documentation',
//     href: 'https://laravel.com/docs/starter-kits',
//     icon: BookOpen,
//   },
// ];

export function AppSidebar() {
  const { auth } = usePage<SharedData>().props;
  const isDeveloper = auth.roles.some((role) => role === 'developer');
  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard" prefetch>
                <AppLogo />
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={mainNavItems} groupLabel="Family" />
        {isDeveloper && <NavMain items={developerNavItems} groupLabel="Developer" />}
      </SidebarContent>

      <SidebarFooter>
        <NavUser />
        <SidebarTrigger />
      </SidebarFooter>
    </Sidebar>
  );
}
