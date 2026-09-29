"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ChevronUp, LogOut, UserRound } from "lucide-react";

import { LogoutDialog } from "@/components/auth/logout-dialog";
import { navGroups, type NavItem } from "@/config/nav";
import { siteConfig } from "@/config/site";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAdminStats } from "@/lib/api/admin";
import { useAuth } from "@/lib/auth/auth-provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const { data: stats } = useAdminStats();
  const badgeFor = (item: NavItem): number | null => {
    if (!item.badgeKey) return null;
    const value = stats?.totals[item.badgeKey];
    return value ? value : null;
  };
  const pathname = usePathname();
  const { user } = useAuth();
  const [logoutOpen, setLogoutOpen] = useState(false);

  const name = user?.name ?? siteConfig.user.name;
  const email = user?.email ?? siteConfig.user.email;
  const initials = user?.initials ?? siteConfig.user.initials;

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard">
                <Image
                  src={siteConfig.icon}
                  alt={siteConfig.name}
                  width={512}
                  height={512}
                  className="hidden size-8 shrink-0 group-data-[collapsible=icon]:block"
                />
                <Image
                  src={siteConfig.logo}
                  alt={siteConfig.name}
                  width={292}
                  height={113}
                  className="h-7 w-auto group-data-[collapsible=icon]:hidden"
                />
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {navGroups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    pathname.startsWith(`${item.href}/`);

                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        tooltip={item.title}
                      >
                        <Link href={item.href}>
                          <item.icon />
                          <span>{item.title}</span>
                          {badgeFor(item) ? (
                            <Badge
                              variant="secondary"
                              className="ml-auto rounded-full px-1.5 text-[10px] tabular-nums"
                            >
                              {badgeFor(item)}
                            </Badge>
                          ) : null}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="size-8 rounded-lg">
                    <AvatarFallback className="rounded-lg">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">{name}</span>
                    <span className="truncate text-xs text-muted-foreground">
                      {email}
                    </span>
                  </div>
                  <ChevronUp className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                align="end"
                className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
              >
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <Avatar className="size-8 rounded-lg">
                      <AvatarFallback className="rounded-lg">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">{name}</span>
                      <span className="truncate text-xs text-muted-foreground">
                        {email}
                      </span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile">
                    <UserRound />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => setLogoutOpen(true)}
                >
                  <LogOut />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <LogoutDialog open={logoutOpen} onOpenChange={setLogoutOpen} />
      <SidebarRail />
    </Sidebar>
  );
}
