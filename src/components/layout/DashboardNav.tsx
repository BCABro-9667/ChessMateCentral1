// src/components/layout/DashboardNav.tsx
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { LayoutDashboard, PlusCircle, ListOrdered, Settings } from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/tournaments/create', label: 'Create Tournament', icon: PlusCircle },
  { href: '/dashboard/tournaments', label: 'My Tournaments', icon: ListOrdered },
  // { href: '/dashboard/settings', label: 'Settings', icon: Settings }, // Future item
];

export default function DashboardNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-2 p-4 bg-card h-full shadow-md">
      {navItems.map((item) => (
        <Button
          key={item.label}
          variant={pathname === item.href ? 'default' : 'ghost'}
          className={cn(
            "w-full justify-start text-left h-12 text-base",
            pathname === item.href && "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
          )}
          asChild
        >
          <Link href={item.href}>
            <item.icon className="mr-3 h-5 w-5" />
            {item.label}
          </Link>
        </Button>
      ))}
    </nav>
  );
}
