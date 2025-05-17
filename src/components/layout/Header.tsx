// src/components/layout/Header.tsx
"use client";

import Link from 'next/link';
import { Crown, LogIn, LogOut, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthMock } from '@/hooks/useAuthMock';
import { usePathname } from 'next/navigation';

export default function Header() {
  const { isLoggedIn, logout, isLoading } = useAuthMock();
  const pathname = usePathname();

  const isDashboardRoute = pathname?.startsWith('/dashboard');

  return (
    <header className="bg-card shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2 text-primary hover:text-primary/90 transition-colors">
          <Crown className="w-8 h-8" />
          <span className="text-2xl font-bold">Chessmate Central</span>
        </Link>
        <nav className="flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link href="/">Home</Link>
          </Button>
          {isLoading ? (
            <Button variant="ghost" disabled>Loading...</Button>
          ) : isLoggedIn ? (
            <>
              {!isDashboardRoute && (
                 <Button variant="ghost" asChild>
                    <Link href="/dashboard">
                      <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
                    </Link>
                  </Button>
              )}
              <Button variant="outline" onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" /> Logout
              </Button>
            </>
          ) : (
            <Button asChild>
              <Link href="/login">
                <LogIn className="mr-2 h-4 w-4" /> Organizer Login
              </Link>
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
}
