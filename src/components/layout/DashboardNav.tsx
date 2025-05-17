// src/components/layout/DashboardNav.tsx
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { LayoutDashboard, PlusCircle, Newspaper, Settings, Trophy, ListChecks } from 'lucide-react'; // Added Newspaper, Trophy, ListChecks

const navItems = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/tournaments/create', label: 'Create Tournament', icon: PlusCircle },
  // { href: '/dashboard/tournaments', label: 'Manage Tournaments', icon: ListOrdered }, // Replaced by Overview which lists them
  { href: '/dashboard/publish-news', label: 'Publish News', icon: Newspaper },
  // { href: '/dashboard/results', label: 'Manage Results (Global - TBD)', icon: Trophy }, 
  // We will link to results per tournament from tournament cards/list. A global results page might be different.
  // { href: '/dashboard/settings', label: 'Settings', icon: Settings }, 
];

export default function DashboardNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-2 p-4 bg-card h-full shadow-md">
      {navItems.map((item) => (
        <Button
          key={item.label}
          variant={pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href)) ? 'default' : 'ghost'}
          className={cn(
            "w-full justify-start text-left h-12 text-base",
            (pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))) && "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
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
