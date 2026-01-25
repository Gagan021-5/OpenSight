import { Navigate, useLocation } from 'react-router-dom';
import { useGlobal } from '../context/GlobalContext.jsx';

export default function ProtectedRoute({ children }) {
  const { userProfile, loading } = useGlobal();
  const location = useLocation();

  if (loading) return null;
  
  // Check both context state and localStorage for robust authentication
  const token = localStorage.getItem('opensight_token');
  
  // If we have no user in state AND no token in storage, then redirect
  if (!userProfile && !token) {
    return <Navigate to="/sign-in" state={{ from: location }} replace />;
  }
  
  // Otherwise, render the child routes
  return children;
}
