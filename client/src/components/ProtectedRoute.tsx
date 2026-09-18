import { Navigate, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuth } from "../hooks/useAuth";

/**
 * Gates a route behind sign-in.
 * Waits for the session restore to finish first, otherwise a refresh would
 * bounce a signed-in user to the login page before their token is checked.
 */
export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="grid place-items-center py-32">
        <div className="h-8 w-8 animate-spin rounded-full border-3 border-line border-t-brand" />
      </div>
    );
  }

  // Remember where they were headed so login can send them back.
  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />;

  return <>{children}</>;
}
