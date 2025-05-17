// src/app/dashboard/tournaments/page.tsx
"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// This page is for general tournament management.
// Specific actions like registering players or viewing registrations
// are now typically accessed via individual tournament cards on the main dashboard (/dashboard)
// or direct URLs like /dashboard/tournaments/[id]/register.
// This page can be a placeholder or redirect, as the main dashboard provides a good overview.

export default function ManageTournamentsPage() {
    const router = useRouter();

    useEffect(() => {
        // Redirect to the main dashboard page as it's the primary hub for tournament overview
        router.replace('/dashboard');
    }, [router]);

    return (
        <div>
            <p>Redirecting to dashboard...</p>
            {/* You could add a more specific tournament listing here if needed in the future,
                but for now, the main dashboard serves this purpose. */}
        </div>
    );
}
