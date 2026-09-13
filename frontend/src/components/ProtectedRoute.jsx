import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-brand-bgLight text-brand-brown">
        <p className="font-semibold text-lg animate-pulse">Cargando Daytrack...</p>
      </div>
    );
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export const PublicOnlyRoute = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return null;

  return !isAuthenticated ? <Outlet /> : <Navigate to="/" replace />;
};