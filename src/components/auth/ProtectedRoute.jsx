import { Navigate, Outlet, useLocation } from 'react-router-dom';

import useAuthStore from '@/store/authStore';

function ProtectedRoute() {
  const location = useLocation();
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const isAuthLoading = useAuthStore((state) => state.isAuthLoading);

  if (isAuthLoading && !isLoggedIn) {
    return null;
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
