import { Navigate, Outlet, useLocation } from 'react-router-dom';

import LoadingState from '@/components/common/LoadingState';
import useAuthStore from '@/store/authStore';

function ProtectedRoute() {
  const location = useLocation();
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const isAuthLoading = useAuthStore((state) => state.isAuthLoading);

  if (isAuthLoading) {
    return <LoadingState message="로그인 정보를 확인하는 중입니다." />;
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
