import { NavLink } from 'react-router-dom';

const MY_PAGE_MENU = [
  { label: '마이페이지 홈', to: '/mypage', end: true },
  { label: '주문 내역', to: '/mypage/orders' },
  { label: '취소 / 교환 / 반품', to: '/mypage/claims' },
  { label: '내 리뷰', to: '/mypage/reviews' },
  { label: '쿠폰 및 혜택', to: '/mypage/coupons' },
  { label: '회원 정보 수정', to: '/mypage/profile' },
  { label: '배송지 관리', to: '/mypage/addresses' },
  { label: '문의 내역', to: '/mypage/inquiries' },
  { label: '찜한 상품', to: '/mypage/wishlist' },
];

function ProfileAvatar() {
  return (
    <div className="mypage-profile-avatar" aria-hidden="true">
      <svg viewBox="0 0 72 72" role="img">
        <circle cx="36" cy="36" r="36" />
        <circle cx="36" cy="28" r="13" fill="#fff" opacity="0.92" />
        <path d="M15 64c2.7-14.5 10.8-22 21-22s18.3 7.5 21 22" fill="#fff" opacity="0.92" />
      </svg>
    </div>
  );
}

function MyPageSidebar({ user, onLogout }) {
  const userName = user?.name ?? user?.nickname ?? user?.loginId ?? user?.id ?? '회원';
  const email = user?.email ?? user?.loginId ?? user?.identifier ?? '';

  return (
    <aside className="mypage-sidebar">
      <div className="mypage-user-panel">
        <ProfileAvatar />
        <strong className="mypage-user-name">{userName}님</strong>
        <span className="mypage-user-email">{email}</span>
      </div>

      <div className="mypage-sidebar-divider" />

      <nav className="mypage-nav" aria-label="마이페이지 메뉴">
        {MY_PAGE_MENU.map((item) => (
          <NavLink
            key={item.label}
            to={item.to}
            end={item.end}
            className={({ isActive }) => `mypage-nav-link${isActive ? ' is-active' : ''}`}
          >
            {item.label}
          </NavLink>
        ))}

        <button type="button" className="mypage-nav-link mypage-logout-button" onClick={onLogout}>
          로그아웃
        </button>
      </nav>
    </aside>
  );
}

export default MyPageSidebar;
