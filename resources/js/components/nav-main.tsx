import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';

export function NavMain({ items = [], groupLabel }: { items: NavItem[]; groupLabel?: string }) {
  const page = usePage();
  const { open } = useSidebar();
  return (
    <SidebarGroup className="px-2 py-0">
      {groupLabel && open && <SidebarGroupLabel>{groupLabel}</SidebarGroupLabel>}
      <SidebarMenu className="border-b">
        {items.map((item) => (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton asChild isActive={item.href === page.url} tooltip={{ children: item.title }}>
              <Link href={item.href} prefetch>
                {item.icon && <item.icon />}
                <span>{item.title}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
