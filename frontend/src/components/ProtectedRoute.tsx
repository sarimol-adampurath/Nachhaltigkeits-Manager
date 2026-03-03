import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { JSX } from 'react/jsx-dev-runtime';

export const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated } = useAuth();
  
  // Logic: If not logged in, boot them to the login page immediately
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};