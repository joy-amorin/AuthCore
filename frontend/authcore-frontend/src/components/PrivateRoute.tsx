import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

interface PrivateRouteProps {
  children: ReactNode;
}

const PrivateRoute = ({ children }: PrivateRouteProps) => {
  const { authenticated, loading } = useAuth();

  if (loading) {
    // verifying authentication status
    return <div>Cargando...</div>;
  }

  if (!authenticated) {
    // user not authenticated, redirect to login
    return <Navigate to="/" replace />;
  }

  // user authenticated, render the protected component
  return <>{children}</>;
};

export default PrivateRoute;
