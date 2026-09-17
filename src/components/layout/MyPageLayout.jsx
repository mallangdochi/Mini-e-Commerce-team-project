import { cloneElement, isValidElement, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { getCoupons } from '@/api/coupons';
import { getWishlist } from '@/api/wishlist';
import ConfirmModal from '@/components/common/ConfirmModal';
import MyPageSidebar from '@/components/mypage/MyPageSidebar';
import useAuthStore from '@/store/authStore';
import '@/styles/mypage.css';
import '@/styles/mypage-responsive.css';

function MyPageLayout({ children }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const fetchMe = useAuthStore((state) => state.fetchMe);
  const patchUserSummary = useAuthStore((state) => state.patchUserSummary);
  const logout = useAuthStore((state) => state.logout);
  const [isLogoutPanelOpen, setIsLogoutPanelOpen] = useState(false);

  useEffect(() => {
    let isActive = true;

    const loadMyPageSummary = async () => {
      const [, couponResult, wishlistResult] = await Promise.allSettled([
        fetchMe(),
        getCoupons(),
        getWishlist(),
      ]);

      if (!isActive) {
        return;
      }

      const coupons =
        couponResult.status === 'fulfilled' && Array.isArray(couponResult.value?.data)
          ? couponResult.value.data
          : [];

      const now = Date.now();

      const availableCouponCount = coupons.filter((coupon) => {
        const expiresAt = coupon?.expiresAt ? new Date(coupon.expiresAt).getTime() : null;

        const isExpired =
          coupon?.status === 'expired' || (Number.isFinite(expiresAt) && expiresAt < now);

        const isUsed = coupon?.status === 'used' || Boolean(coupon?.usedAt);

        return !isExpired && !isUsed;
      }).length;

      const wishlistData =
        wishlistResult.status === 'fulfilled' ? (wishlistResult.value?.data ?? {}) : {};

      const wishlistItems = Array.isArray(wishlistData)
        ? wishlistData
        : Array.isArray(wishlistData?.items)
          ? wishlistData.items
          : [];

      patchUserSummary({
        availableCouponCount,
        couponCount: availableCouponCount,
        wishlistCount: wishlistItems.length,
      });
    };

    void loadMyPageSummary();

    return () => {
      isActive = false;
    };
  }, [fetchMe, patchUserSummary]);

  const confirmLogout = () => {
    logout();
    setIsLogoutPanelOpen(false);
    navigate('/login', { replace: true });
  };

  return (
    <main className="mypage-page">
      <div className={`mypage-shell${pathname === '/mypage' ? ' mypage-shell--home' : ''}`}>
        <MyPageSidebar user={user} onLogout={() => setIsLogoutPanelOpen(true)} />

        {isValidElement(children)
          ? cloneElement(children, {
              onLogout: () => setIsLogoutPanelOpen(true),
            })
          : children}
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
