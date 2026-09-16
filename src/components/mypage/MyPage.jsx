import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import ErrorState from '@/components/common/ErrorState';
import { getStoredAddresses } from '@/utils/storage';
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

function IconLock() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="5" y="10" width="14" height="10" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

function IconEdit() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m4 20 4.2-1 10.9-10.9a2.1 2.1 0 0 0-3-3L5.2 16 4 20Z" />
      <path d="m14.8 6.4 2.8 2.8" />
    </svg>
  );
}

function maskName(name) {
  if (!name) return '-';
  if (name.length === 1) return name;
  return `${name.slice(0, 2)}${'*'.repeat(Math.max(1, name.length - 2))}`;
}

function maskLoginId(loginId) {
  if (!loginId) return '-';
  if (loginId.length <= 3) return `${loginId.charAt(0)}***`;
  return `${loginId.slice(0, 3)}***`;
}

function maskEmail(email) {
  if (!email || !email.includes('@')) return email || '-';

  const [localPart, domain] = email.split('@');
  const visible = localPart.slice(0, Math.min(3, localPart.length));

  return `${visible}***@${domain}`;
}

function maskPhone(phone) {
  if (!phone) return '-';

  const numbers = String(phone).replace(/\D/g, '');

  if (numbers.length === 11) {
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 8)}***`;
  }

  if (numbers.length === 10) {
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 6)}-${numbers.slice(6, 7)}***`;
  }

  return `${numbers.slice(0, 3)}-****`;
}

function maskPostcode(postcode) {
  if (!postcode) return '-';

  const value = String(postcode);

  if (value.length <= 2) return `${value}*`;

  return `${value.slice(0, Math.max(1, value.length - 1))}*`;
}

function maskAddress(address) {
  if (!address) return '-';

  const words = String(address).trim().split(' ').filter(Boolean);

  if (words.length <= 3) {
    return `${words.join(' ')} ***`;
  }

  return `${words.slice(0, 3).join(' ')} ***`;
}

function maskDetailAddress(detailAddress) {
  if (!detailAddress) return '-';

  const value = String(detailAddress);

  if (value.length <= 2) return `${value.charAt(0)}*`;

  return `${value.slice(0, Math.max(1, value.length - 1))}*`;
}

function MyPage({ onLogout }) {
  const { user, orders = [], totalCount: orderCount, errorMessage } = useOrders();
  const [addresses] = useState(getStoredAddresses);

  const userName = user?.name ?? user?.nickname ?? user?.loginId ?? user?.id ?? '회원';
  const loginId = user?.loginId ?? user?.identifier ?? user?.id ?? '';
  const email = user?.email ?? '';
  const phone = user?.phone ?? user?.phoneNumber ?? user?.mobile ?? '';
  const couponCount = Number(user?.couponCount ?? user?.availableCouponCount ?? 0);
  const pointBalance = Number(user?.points ?? user?.pointBalance ?? user?.mileage ?? 0);
  const wishlistCount = Number(user?.wishlistCount ?? user?.wishCount ?? 0);
  const defaultAddress = addresses.find((item) => item.isDefault) ?? addresses[0] ?? null;

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

      <section className="mypage-info-card">
        <div className="mypage-info-toolbar">
          <div className="mypage-security-badge">
            <span className="mypage-security-icon">
              <IconLock />
            </span>
            <span>비밀번호 확인 후 수정 가능</span>
          </div>

          <Link to="/mypage/profile" className="mypage-edit-button">
            <IconEdit />
            <span>수정하기</span>
          </Link>
        </div>

        <section className="mypage-info-section">
          <h2>기본 회원 정보</h2>

          <div className="mypage-info-grid">
            <div className="mypage-info-item">
              <span className="mypage-info-label">이름</span>
              <strong>{maskName(userName)}</strong>
            </div>

            <div className="mypage-info-item">
              <span className="mypage-info-label">아이디</span>
              <strong>{maskLoginId(loginId)}</strong>
            </div>

            <div className="mypage-info-item">
              <span className="mypage-info-label">이메일</span>
              <strong>{maskEmail(email)}</strong>
            </div>

            <div className="mypage-info-item">
              <span className="mypage-info-label">휴대폰 번호</span>
              <strong>{maskPhone(phone)}</strong>
            </div>
          </div>
        </section>

        <section className="mypage-info-section mypage-address-section">
          <h2>기본 배송지</h2>

          <div className="mypage-info-grid">
            <div className="mypage-info-item">
              <span className="mypage-info-label">수령인</span>
              <strong>{maskName(defaultAddress?.receiverName ?? userName)}</strong>
            </div>

            <div className="mypage-info-item">
              <span className="mypage-info-label">우편번호</span>
              <strong>{maskPostcode(defaultAddress?.postcode)}</strong>
            </div>

            <div className="mypage-info-item">
              <span className="mypage-info-label">주소</span>
              <strong>{maskAddress(defaultAddress?.address)}</strong>
            </div>

            <div className="mypage-info-item">
              <span className="mypage-info-label">상세 주소</span>
              <strong>{maskDetailAddress(defaultAddress?.detailAddress)}</strong>
            </div>
          </div>
        </section>
      </section>
    </section>
  );
}

export default MyPage;
