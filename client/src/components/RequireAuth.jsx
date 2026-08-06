import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RequireAuth({ children }) {
  const { user, initializing } = useAuth();

  if (initializing) {
    return (
      <div className="flex justify-center items-center py-24 text-text-muted">
        Loading…
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
