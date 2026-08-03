import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ShieldCheck, ShieldAlert, Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, adminUser } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white space-y-4">
        <div className="w-12 h-12 rounded-xl bg-primary-green/20 border border-primary-green flex items-center justify-center text-primary-green">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
        <div className="text-center space-y-1">
          <h3 className="text-sm font-bold tracking-wide">Authenticating Gateway</h3>
          <p className="text-xs text-slate-400">Verifying security token and permissions...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !adminUser) {
    // Redirect to /admin/login preserving original target path
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(adminUser.role)) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-white text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-red-950/60 border border-red-800/80 flex items-center justify-center text-red-400 shadow-xl">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <div className="max-w-md space-y-2">
          <h2 className="text-xl font-bold font-display text-white">403 - Access Forbidden</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Your role (<span className="text-primary-green font-bold">{adminUser.role}</span>) does not have authorization to access this administrative module.
          </p>
        </div>
        <a
          href="/admin/dashboard"
          className="px-5 py-2.5 bg-primary-green hover:bg-primary-green-hover text-white text-xs font-semibold rounded-lg shadow-md transition"
        >
          Return to Admin Dashboard
        </a>
      </div>
    );
  }

  return <>{children}</>;
}
