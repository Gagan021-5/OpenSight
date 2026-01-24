import { Navigate, useLocation } from 'react-router-dom';
import { useGlobal } from '../context/GlobalContext';

export default function ProtectedRoute({ children }) {
  const { isSignedIn, loading } = useGlobal();
  const location = useLocation();

  if (loading) return null;
  if (!isSignedIn) {
    return <Navigate to="/sign-in" state={{ from: location }} replace />;
  }
  return children;
}
