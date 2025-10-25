
'use client';

import { useUser, useAuth } from '@/firebase/provider';
import { useRouter, usePathname } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  BookOpen,
  Music,
  Shirt,
  MessageSquare,
  User as UserIcon,
} from 'lucide-react';
import Link from 'next/link';
import { UserNav } from '@/components/user-nav';
import { Logo } from '@/components/icons';
import { FullPageLoader } from '@/components/full-page-loader';
import { onAuthStateChanged } from 'firebase/auth';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/buddy', icon: MessageSquare, label: 'Buddy' },
  { href: '/homework', icon: BookOpen, label: 'Homework Helper' },
  { href: '/music', icon: Music, label: 'Music AI' },
  { href: '/fashion', icon: Shirt, label: 'Fashion AI' },
  { href: '/profile', icon: UserIcon, label: 'Profile' },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = useUser();
  const auth = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      // Auth object might not be available right away.
      // The onAuthStateChanged listener will handle the redirect.
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setLoading(false);
      } else {
        router.replace('/login');
      }
    });

    return () => unsubscribe();
  }, [auth, router]);

  if (loading) {
    return <FullPageLoader />;
  }

  // user object might be null for a brief moment after auth state changes.
  // This prevents a flash of an empty layout.
  if (!user) {
    return <FullPageLoader />;
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <Link href="/dashboard" className="flex items-center gap-2">
            <Logo className="w-7 h-7 text-primary" />
            <span className="text-lg font-bold font-headline text-sidebar-foreground group-data-[collapsible=icon]:hidden">
              Yo Companion
            </span>
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.href}
                  tooltip={{ children: item.label }}
                >
                  <Link href={item.href}>
                    <item.icon />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
          <SidebarSeparator />
            <SidebarGroup>
                <SidebarGroupLabel>Chat History</SidebarGroupLabel>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild isActive={pathname.startsWith('/buddy')}>
                            <Link href="/buddy">
                                <MessageSquare />
                                <span>Conversation with Buddy</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <SidebarInset className="flex flex-col">
        <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4 sm:px-6">
          <SidebarTrigger className="md:hidden" />
          <div className="flex-1" />
          <UserNav />
        </header>
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
