// frontend/src/components/ProtectedRoute.js
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (!user) {
    // Redirect to home page (not login) - user can see content but can't access protected pages
    return <Navigate to="/home" replace />;
  }
  
  if (role && user.role !== role) {
    return <Navigate to="/home" replace />;
  }
  
  return children;
};

export default ProtectedRoute;