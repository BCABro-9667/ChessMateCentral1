// src/app/dashboard/tournaments/page.tsx
"use client";
import { useEffect } from 'react';
import { useRouter }
from 'next/navigation';

// This page is currently a conceptual placeholder.
// The main dashboard page already lists all tournaments.
// If specific "My Tournaments" filtering or different layout is needed,
// this page can be expanded. For now, it redirects to the main dashboard.

export default function MyTournamentsPage() {
    const router = useRouter();

    useEffect(() => {
        router.replace('/dashboard');
    }, [router]);

    return (
        <div>
            <p>Redirecting to dashboard...</p>
        </div>
    );
}
