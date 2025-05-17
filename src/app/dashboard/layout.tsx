// src/app/dashboard/layout.tsx
"use client"; // Required for useAuthMock and conditional rendering based on auth status

import Header from '@/components/layout/Header';
import DashboardNav from '@/components/layout/DashboardNav';
import { useAuthMock } from '@/hooks/useAuthMock';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoggedIn, isLoading } = useAuthMock();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      router.replace('/login');
    }
  }, [isLoggedIn, isLoading, router]);

  if (isLoading || !isLoggedIn) {
    // Show a loading state or a redirecting message
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8 grid md:grid-cols-[280px_1fr] gap-8 items-start">
          <aside className="hidden md:block">
            <Skeleton className="h-[200px] w-full rounded-lg" />
          </aside>
          <div className="space-y-6">
            <Skeleton className="h-12 w-1/2 rounded-lg" />
            <Skeleton className="h-40 w-full rounded-lg" />
            <Skeleton className="h-40 w-full rounded-lg" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 grid md:grid-cols-[280px_1fr] gap-8 items-start">
        <aside className="hidden md:block sticky top-[calc(theme(spacing.16)_+_1px)] h-[calc(100vh_-_theme(spacing.16)_-_2rem_-_1px)]"> {/* sticky top value approx header height + some padding */}
           <DashboardNav />
        </aside>
        {/* Mobile Nav Trigger - can be implemented later if needed */}
        <div className="md:hidden p-2">
          {/* Example: <Button>Menu</Button> */}
          {/* For now, mobile users will rely on browser back/forward or direct URL access */}
        </div>
        <div className="w-full overflow-x-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
