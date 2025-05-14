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
import { ClipboardCheckIcon, LayoutDashboardIcon, LayoutGrid, ListTodoIcon, ShoppingBagIcon, Users2Icon } from 'lucide-react';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboardIcon,
  },
  {
    title: 'Tasks',
    href: '/tasks',
    icon: ClipboardCheckIcon,
  },
  //   {
  //     title: 'List',
  //     href: '/todo-list',
  //     icon: ListTodoIcon,
  //   },
  {
    title: 'Shop',
    href: '/shop',
    icon: ShoppingBagIcon,
  },
  {
    title: 'Routine Viewer',
    href: '/',
    icon: ListTodoIcon,
  },
];

const developerNavItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/developer-dashboard',
    icon: LayoutGrid,
  },
  {
    title: 'Users',
    href: '/developer-dashboard/users',
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
    <Sidebar collapsible="icon" variant="sidebar">
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
