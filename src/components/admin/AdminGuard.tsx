/**
 * AdminGuard — server-side admin check.
 * Reads profile.role from the existing AuthContext.
 * Never relies purely on client state; profile is fetched from Supabase on session restore.
 */
import { type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';

interface AdminGuardProps {
  children: ReactNode;
}

export default function AdminGuard({ children }: AdminGuardProps) {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="fixed inset-0 bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (profile.role !== 'admin') {
    // Non-admin users see a clean redirect to home — no admin UI exposed
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
