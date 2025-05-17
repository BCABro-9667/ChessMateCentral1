// src/hooks/useAuthMock.ts
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';

const AUTH_KEY = 'isLoggedInChessmate';

export function useAuthMock() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | undefined>(undefined);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const storedAuth = localStorage.getItem(AUTH_KEY);
    const authStatus = storedAuth === 'true';
    setIsLoggedIn(authStatus);

    if (pathname?.startsWith('/dashboard') && !authStatus) {
      router.replace('/login');
    }
  }, [router, pathname]);

  const login = useCallback(() => {
    localStorage.setItem(AUTH_KEY, 'true');
    setIsLoggedIn(true);
    router.push('/dashboard');
  }, [router]);

  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_KEY);
    setIsLoggedIn(false);
    router.push('/login');
  }, [router]);

  return { isLoggedIn, login, logout, isLoading: isLoggedIn === undefined };
}
