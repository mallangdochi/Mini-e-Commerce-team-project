import { useMemo } from 'react';
import { Link } from 'react-router-dom';

import ErrorState from '@/components/common/ErrorState';
import useOrders from '@/hooks/useOrders';

function IconBag() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5.5 8.5h13l-.8 11h-11.4l-.8-11Z" />
      <path d="M9 9V6.7a3 3 0 0 1 6 0V9" />
      <path d="M9 12.5h6" />
    </svg>
  );
}

function IconCoupon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 7.5A2.5 2.5 0 0 0 6.5 10 2.5 2.5 0 0 0 4 12.5V17h16v-4.5A2.5 2.5 0 0 0 17.5 10 2.5 2.5 0 0 0 20 7.5V3H4v4.5Z" />
    </svg>
  );
}

function IconCoin() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <ellipse cx="12" cy="6" rx="7" ry="3" />
      <path d="M5 6v4c0 1.7 3.1 3 7 3s7-1.3 7-3V6" />
      <path d="M5 10v4c0 1.7 3.1 3 7 3s7-1.3 7-3v-4" />
      <path d="M5 14v4c0 1.7 3.1 3 7 3s7-1.3 7-3v-4" />
    </svg>
  );
}

function IconHeart() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20.8 5.9a5.2 5.2 0 0 0-7.4 0L12 7.3l-1.4-1.4a5.2 5.2 0 1 0-7.4 7.4L12 22l8.8-8.7a5.2 5.2 0 0 0 0-7.4Z" />
    </svg>
  );
}

function MyPage({ onLogout }) {
  const { user, orders = [], totalCount: orderCount, errorMessage } = useOrders();
  const userName = user?.name ?? user?.nickname ?? user?.loginId ?? user?.id ?? '회원';
  const loginId = user?.loginId ?? user?.identifier ?? user?.id ?? '';
  const email = user?.email ?? '';
  const couponCount = Number(user?.couponCount ?? user?.availableCouponCount ?? 0);
  const pointBalance = Number(user?.points ?? user?.pointBalance ?? user?.mileage ?? 0);
  const wishlistCount = Number(user?.wishlistCount ?? user?.wishCount ?? 0);

  const summaryItems = useMemo(
    () => [
      {
        label: '주문 내역',
        value: `${orderCount}건`,
        to: '/mypage/orders',
        icon: <IconBag />,
      },
      {
        label: '보유 쿠폰',
        value: `${couponCount}개`,
        to: '/mypage/coupons',
        icon: <IconCoupon />,
      },
      {
        label: '적립금',
        value: `${pointBalance.toLocaleString()}원`,
        to: '/mypage/coupons',
        icon: <IconCoin />,
      },
      {
        label: '찜한 상품',
        value: `${wishlistCount}개`,
        to: '/mypage/wishlist',
        icon: <IconHeart />,
      },
    ],
    [couponCount, orderCount, pointBalance, wishlistCount]
  );

  const orderStepItems = useMemo(() => {
    const counts = orders.reduce(
      (acc, order) => {
        if (order.orderStatus in acc) {
          acc[order.orderStatus] += 1;
        }

        return acc;
      },
      {
        paymentCompleted: 0,
        preparing: 0,
        shipping: 0,
        delivered: 0,
      }
    );

    return [
      { label: '결제완료', value: counts.paymentCompleted, to: '/mypage/orders?tab=order' },
      { label: '상품준비', value: counts.preparing, to: '/mypage/orders?tab=order' },
      { label: '배송중', value: counts.shipping, to: '/mypage/orders?tab=shipping' },
      { label: '배송완료', value: counts.delivered, to: '/mypage/orders?tab=delivered' },
    ];
  }, [orders]);

  const mobileMenuGroups = useMemo(
    () => [
      {
        title: '쇼핑정보',
        items: [
          { label: '주문 내역', to: '/mypage/orders', meta: `${orderCount}건` },
          { label: '취소 / 교환 / 반품', to: '/mypage/claims' },
          { label: '내 리뷰', to: '/mypage/reviews' },
          { label: '쿠폰 및 혜택', to: '/mypage/coupons', meta: `${couponCount}개` },
        ],
      },
      {
        title: '회원정보',
        items: [
          { label: '회원 정보 수정', to: '/mypage/profile' },
          { label: '배송지 관리', to: '/mypage/addresses' },
        ],
      },
      {
        title: '활동',
        items: [
          { label: '문의 내역', to: '/mypage/inquiries' },
          { label: '찜한 상품', to: '/mypage/wishlist', meta: `${wishlistCount}개` },
        ],
      },
    ],
    [couponCount, orderCount, wishlistCount]
  );

  return (
    <section className="mypage-content">
      {errorMessage && <ErrorState className="mypage-error" message={errorMessage} />}

      <section className="mypage-mobile-home" aria-label="모바일 마이페이지 홈">
        <section className="mypage-mobile-greeting">
          <div>
            <h1>
              <strong>{userName}</strong>님 안녕하세요!
            </h1>
            <p>{email || loginId || 'ARC와 함께 더 나은 움직임을 만들어가요.'}</p>
          </div>

          <div className="mypage-mobile-grade" aria-label="회원 등급 ARC">
            ARC
          </div>
        </section>

        <section className="mypage-mobile-stat-grid" aria-label="내 활동 요약">
          {summaryItems.map((item) => (
            <Link key={item.label} to={item.to} className="mypage-mobile-stat-item">
              <span className="mypage-mobile-stat-icon">{item.icon}</span>
              <span className="mypage-mobile-stat-label">{item.label}</span>
              <strong>{item.value}</strong>
            </Link>
          ))}
        </section>

        <section className="mypage-mobile-order-status" aria-label="진행 중인 주문">
          <div className="mypage-mobile-section-head">
            <h2>진행 중인 주문</h2>
            <Link to="/mypage/orders">
              자세히 보기
              <span aria-hidden="true">›</span>
            </Link>
          </div>

          <div className="mypage-mobile-step-track">
            {orderStepItems.map((step, index) => (
              <Link className="mypage-mobile-step-item" key={step.label} to={step.to}>
                <strong>{step.value}</strong>
                <span>{step.label}</span>
                {index < orderStepItems.length - 1 && <i aria-hidden="true">›</i>}
              </Link>
            ))}
          </div>
        </section>

        <main className="mypage-mobile-menu-groups">
          {mobileMenuGroups.map((group) => (
            <section className="mypage-mobile-menu-group" key={group.title}>
              <h2>{group.title}</h2>

              <ul>
                {group.items.map((item) => (
                  <li key={item.label}>
                    <Link to={item.to}>
                      <span>{item.label}</span>
                      <span className="mypage-mobile-menu-meta">
                        {item.meta && <em>{item.meta}</em>}
                        <b aria-hidden="true">›</b>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </main>

        <section className="mypage-mobile-bottom-actions">
          <button type="button" onClick={onLogout}>
            로그아웃
          </button>
        </section>
      </section>

      <header className="mypage-heading">
        <h1>MY PAGE</h1>
        <p>ARC와 함께 더 나은 움직임을 만들어가요.</p>
      </header>

      <section className="mypage-summary-grid" aria-label="내 활동 요약">
        {summaryItems.map((item) => (
          <Link key={item.label} to={item.to} className="mypage-summary-card">
            <div className="mypage-summary-top">
              <span className="mypage-summary-icon">{item.icon}</span>
              <span className="mypage-summary-arrow" aria-hidden="true">
                ›
              </span>
            </div>

            <span className="mypage-summary-label">{item.label}</span>
            <strong className="mypage-summary-value">{item.value}</strong>
          </Link>
        ))}
      </section>

      <section
        className="mypage-mobile-order-status mypage-desktop-order-status"
        aria-label="진행 중인 주문"
      >
        <div className="mypage-mobile-section-head">
          <h2>진행 중인 주문</h2>
          <Link to="/mypage/orders">
            자세히 보기
            <span aria-hidden="true">›</span>
          </Link>
        </div>

        <div className="mypage-mobile-step-track">
          {orderStepItems.map((step, index) => (
            <Link className="mypage-mobile-step-item" key={step.label} to={step.to}>
              <strong>{step.value}</strong>
              <span>{step.label}</span>
              {index < orderStepItems.length - 1 && <i aria-hidden="true">›</i>}
            </Link>
          ))}
        </div>
      </section>
    </section>
  );
}

export default MyPage;
