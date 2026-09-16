import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import ConfirmModal from '@/components/common/ConfirmModal';
import MyPageSidebar from '@/components/mypage/MyPageSidebar';
import useAuthStore from '@/store/authStore';
import '@/styles/mypage.css';

function MyPageLayout({ children }) {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const fetchMe = useAuthStore((state) => state.fetchMe);
  const logout = useAuthStore((state) => state.logout);
  const [isLogoutPanelOpen, setIsLogoutPanelOpen] = useState(false);

  useEffect(() => {
    fetchMe().catch(() => null);
  }, [fetchMe]);

  const confirmLogout = () => {
    logout();
    setIsLogoutPanelOpen(false);
    navigate('/login', { replace: true });
  };

  return (
    <main className="mypage-page">
      <div className="mypage-shell">
        <MyPageSidebar user={user} onLogout={() => setIsLogoutPanelOpen(true)} />
        {children}
      </div>

      <ConfirmModal
        open={isLogoutPanelOpen}
        title="로그아웃하시겠습니까?"
        description={
          <>
            현재 계정에서 로그아웃됩니다.
            <br />
            다시 이용하려면 로그인이 필요합니다.
          </>
        }
        confirmText="로그아웃"
        cancelText="취소"
        onConfirm={confirmLogout}
        onClose={() => setIsLogoutPanelOpen(false)}
        titleId="mypageInlineLogoutTitle"
        backdropClassName="mypage-inline-logout-backdrop"
        modalClassName="mypage-inline-logout-modal"
        iconClassName="mypage-inline-logout-icon"
        actionsClassName="mypage-inline-logout-actions"
        confirmClassName="is-confirm"
        icon={
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M10 17l5-5-5-5" />
            <path d="M15 12H3" />
            <path d="M14 3h4a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3h-4" />
          </svg>
        }
      />
    </main>
  );
}

export default MyPageLayout;
