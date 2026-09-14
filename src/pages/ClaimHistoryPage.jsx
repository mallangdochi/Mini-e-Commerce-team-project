import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { getMe } from '@/api/authApi';
import { getOrder, getOrders } from '@/api/orders';
import '@/styles/order-history.css';
import '@/styles/claim-history.css';

const MY_PAGE_MENU = [
  { label: '마이페이지 홈', to: '/mypage' },
  { label: '주문 내역', to: '/mypage/orders' },
  { label: '취소 / 교환 / 반품', to: '/mypage/claims' },
  { label: '내 리뷰', to: '/mypage/reviews' },
  { label: '쿠폰 및 혜택', to: '/mypage/coupons' },
  { label: '회원 정보 수정', to: '/mypage/profile' },
  { label: '배송지 관리', to: '/mypage/addresses' },
  { label: '문의 내역', to: '/mypage/inquiries' },
  { label: '찜한 상품', to: '/mypage/wishlist' },
];

const CLAIM_TABS = [
  { label: '전체', value: 'all' },
  { label: '취소', value: 'cancel' },
  { label: '교환', value: 'exchange' },
  { label: '반품', value: 'return' },
];

const PERIOD_OPTIONS = [
  { label: '최근 3개월', value: 3 },
  { label: '최근 6개월', value: 6 },
  { label: '최근 1년', value: 12 },
  { label: '전체 기간', value: 0 },
];

const CLAIM_TYPE_META = {
  cancel: '취소',
  exchange: '교환',
  return: '반품',
};

const CLAIM_STATUS_META = {
  requested: '신청접수',
  processing: '처리중',
  completed: '처리완료',
  rejected: '신청반려',
};

function IconBag() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5.5 8.5h13l-.8 11h-11.4l-.8-11Z" />
      <path d="M9 9V6.7a3 3 0 0 1 6 0V9" />
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

function ProfileAvatar() {
  return (
    <div className="order-profile-avatar" aria-hidden="true">
      <svg viewBox="0 0 80 80">
        <circle cx="40" cy="27" r="16" />
        <path d="M16 68c3.5-16 13.6-24 24-24s20.5 8 24 24" />
      </svg>
    </div>
  );
}

function getProfile(response) {
  return response?.data?.user ?? response?.data ?? response?.user ?? response?.userInfo ?? null;
}

function normalizeImageUrl(url) {
  if (!url || typeof url !== 'string') {
    return '';
  }

  return url.trim().replace(/^<|>$/g, '');
}

function formatDate(dateString) {
  if (!dateString) {
    return '-';
  }

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
    .format(date)
    .replace(/\s/g, '');
}

function isWithinPeriod(dateString, months) {
  if (!months) {
    return true;
  }

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return false;
  }

  const boundary = new Date();
  boundary.setMonth(boundary.getMonth() - months);

  return date >= boundary;
}

function getStoredCancelReasons() {
  try {
    const value = JSON.parse(localStorage.getItem('arc-order-cancel-reasons') ?? '{}');

    return value && typeof value === 'object' ? value : {};
  } catch {
    return {};
  }
}

function getStoredClaims() {
  try {
    const value = JSON.parse(localStorage.getItem('arc-order-claims') ?? '[]');

    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function getOptionText(item) {
  if (!item) {
    return '';
  }

  const color =
    typeof item.color === 'string' ? item.color : (item.color?.label ?? item.color?.value ?? '');

  return [color, item.size].filter(Boolean).join(' / ');
}

function ClaimHistoryPage() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [orderDetails, setOrderDetails] = useState({});
  const [cancelReasons, setCancelReasons] = useState({});
  const [localClaims, setLocalClaims] = useState([]);
  const [selectedTab, setSelectedTab] = useState('all');
  const [periodMonths, setPeriodMonths] = useState(3);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');

    if (!accessToken) {
      navigate('/login', { replace: true });
      return;
    }

    const loadData = async () => {
      setIsLoading(true);
      setErrorMessage('');

      try {
        const [profileResponse, ordersResponse] = await Promise.all([
          getMe(accessToken),
          getOrders({ page: 1, limit: 50 }),
        ]);

        const profile = getProfile(profileResponse);
        const orderList = ordersResponse?.data?.orders ?? [];

        setUser(profile);
        setOrders(orderList);
        setCancelReasons(getStoredCancelReasons());
        setLocalClaims(getStoredClaims());

        const detailResults = await Promise.allSettled(
          orderList.map((order) => getOrder(order.orderId))
        );
        const nextDetails = {};

        detailResults.forEach((result, index) => {
          if (result.status === 'fulfilled') {
            nextDetails[orderList[index].orderId] = result.value?.data ?? null;
          }
        });

        setOrderDetails(nextDetails);
      } catch (error) {
        setErrorMessage(error.message || '취소/교환/반품 내역을 불러오지 못했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [navigate]);

  const userName = user?.name ?? user?.nickname ?? user?.loginId ?? user?.id ?? '회원';
  const email = user?.email ?? '';
  const couponCount = Number(user?.couponCount ?? user?.availableCouponCount ?? 0);
  const pointBalance = Number(user?.points ?? user?.pointBalance ?? user?.mileage ?? 0);
  const wishlistCount = Number(user?.wishlistCount ?? user?.wishCount ?? 0);

  const summaryItems = [
    {
      label: '주문 내역',
      value: `${orders.length}건`,
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
  ];

  const claims = useMemo(() => {
    const cancelledClaims = orders
      .filter((order) => order.orderStatus === 'cancelled')
      .map((order) => ({
        claimId: `cancel-${order.orderId}`,
        orderId: order.orderId,
        type: 'cancel',
        status: 'completed',
        reason: cancelReasons[order.orderId] ?? '취소 사유 정보 없음',
        requestedAt:
          orderDetails[order.orderId]?.cancelledAt ?? order.cancelledAt ?? order.orderDate,
      }));

    const exchangeReturnClaims = localClaims
      .filter((claim) => claim?.type === 'exchange' || claim?.type === 'return')
      .map((claim, index) => ({
        claimId: claim.claimId ?? `claim-${index}`,
        orderId: claim.orderId,
        type: claim.type,
        status: claim.status ?? 'requested',
        reason: claim.reason ?? '사유 정보 없음',
        requestedAt: claim.requestedAt ?? claim.createdAt ?? new Date().toISOString(),
      }));

    return [...cancelledClaims, ...exchangeReturnClaims].sort(
      (a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime()
    );
  }, [cancelReasons, localClaims, orderDetails, orders]);

  const filteredClaims = useMemo(() => {
    return claims.filter((claim) => {
      const matchesType = selectedTab === 'all' || claim.type === selectedTab;
      const matchesPeriod = isWithinPeriod(claim.requestedAt, periodMonths);

      return matchesType && matchesPeriod;
    });
  }, [claims, periodMonths, selectedTab]);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userInfo');
    window.dispatchEvent(new Event('auth-change'));
    navigate('/login');
  };

  if (isLoading) {
    return (
      <main className="order-history-page">
        <div className="order-history-loading">취소/교환/반품 내역을 불러오는 중입니다.</div>
      </main>
    );
  }

  return (
    <main className="order-history-page claim-history-page">
      <div className="order-history-shell">
        <aside className="order-history-sidebar">
          <div className="order-history-user">
            <ProfileAvatar />
            <strong>{userName}님</strong>
            <span>{email}</span>
          </div>

          <div className="order-history-sidebar-divider" />

          <nav className="order-history-nav" aria-label="마이페이지 메뉴">
            {MY_PAGE_MENU.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                className={`order-history-nav-link${
                  item.to === '/mypage/claims' ? ' is-active' : ''
                }`}
              >
                {item.label}
              </Link>
            ))}

            <button
              type="button"
              className="order-history-nav-link order-history-logout"
              onClick={handleLogout}
            >
              로그아웃
            </button>
          </nav>
        </aside>

        <section className="order-history-content">
          <header className="order-history-heading">
            <h1>취소 / 교환 / 반품</h1>
            <p>신청한 취소, 교환, 반품 내역과 처리 상태를 확인하세요.</p>
          </header>

          <section className="order-history-summary">
            {summaryItems.map((item) => (
              <Link key={item.label} to={item.to} className="order-history-summary-card">
                <div className="order-history-summary-top">
                  <span className="order-history-summary-icon">{item.icon}</span>
                  <span aria-hidden="true">›</span>
                </div>

                <span>{item.label}</span>
                <strong>{item.value}</strong>
              </Link>
            ))}
          </section>

          <div className="order-history-toolbar">
            <div className="order-history-tabs">
              {CLAIM_TABS.map((tab) => (
                <button
                  type="button"
                  key={tab.value}
                  className={selectedTab === tab.value ? 'is-active' : ''}
                  onClick={() => setSelectedTab(tab.value)}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <select
              value={periodMonths}
              onChange={(event) => setPeriodMonths(Number(event.target.value))}
              aria-label="취소 교환 반품 조회 기간"
            >
              {PERIOD_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {errorMessage ? (
            <div className="order-history-empty">{errorMessage}</div>
          ) : filteredClaims.length === 0 ? (
            <div className="claim-history-empty">
              <strong>해당 내역이 없습니다.</strong>
              <span>
                {selectedTab === 'exchange' || selectedTab === 'return'
                  ? '신청된 교환/반품 내역이 없습니다.'
                  : '취소/교환/반품 내역이 없습니다.'}
              </span>
            </div>
          ) : (
            <div className="order-history-list">
              {filteredClaims.map((claim) => {
                const order = orders.find((item) => item.orderId === claim.orderId);
                const detail = orderDetails[claim.orderId];
                const firstItem = detail?.items?.[0];
                const imageUrl = normalizeImageUrl(
                  firstItem?.imageUrl ?? order?.representativeProduct?.imageUrl
                );
                const productName =
                  firstItem?.name ?? order?.representativeProduct?.name ?? '상품 정보 없음';
                const totalItemCount = Number(order?.totalItemCount ?? detail?.items?.length ?? 1);
                const optionText = getOptionText(firstItem);
                const amount = Number(order?.finalAmount ?? detail?.finalAmount ?? 0);

                return (
                  <article className="order-history-card claim-order-card" key={claim.claimId}>
                    <div className="order-history-card-head">
                      <div>
                        <strong>{formatDate(claim.requestedAt)}</strong>
                        <span className="order-history-head-divider">|</span>
                        <span>주문번호 {claim.orderId}</span>
                      </div>

                      <button type="button" onClick={() => setSelectedClaim(claim)}>
                        처리 상세보기
                        <span aria-hidden="true">›</span>
                      </button>
                    </div>

                    <div className="claim-order-card-body">
                      <div className="order-history-product">
                        <div className="order-history-product-image">
                          {imageUrl ? <img src={imageUrl} alt={productName} /> : <span>IMAGE</span>}
                        </div>

                        <div className="order-history-product-info">
                          <h2>
                            {totalItemCount > 1
                              ? `${productName} 외 ${totalItemCount - 1}개`
                              : productName}
                          </h2>

                          {optionText && <p>{optionText}</p>}

                          <div>
                            <strong>₩ {amount.toLocaleString()}</strong>
                            <span>|</span>
                            <span>수량 {firstItem?.quantity ?? totalItemCount}</span>
                          </div>
                        </div>
                      </div>

                      <div className="claim-order-state">
                        <span>{CLAIM_TYPE_META[claim.type] ?? claim.type}</span>
                        <strong>{CLAIM_STATUS_META[claim.status] ?? claim.status}</strong>
                      </div>

                      <div className="claim-order-reason">
                        <span>신청 사유</span>
                        <strong>{claim.reason}</strong>
                      </div>

                      <div className="claim-order-actions">
                        <button type="button" onClick={() => setSelectedClaim(claim)}>
                          상세보기
                        </button>
                        <Link to="/mypage/orders">주문 내역 보기</Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {selectedClaim && (
        <div className="claim-detail-backdrop" onClick={() => setSelectedClaim(null)}>
          <section
            className="claim-detail-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="claimDetailTitle"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="claim-detail-header">
              <div>
                <h2 id="claimDetailTitle">{CLAIM_TYPE_META[selectedClaim.type] ?? '처리'} 상세</h2>
                <p>주문번호 {selectedClaim.orderId}</p>
              </div>

              <button
                type="button"
                aria-label="처리 상세 닫기"
                onClick={() => setSelectedClaim(null)}
              >
                ×
              </button>
            </div>

            <div className="claim-detail-body">
              <dl>
                <div>
                  <dt>구분</dt>
                  <dd>{CLAIM_TYPE_META[selectedClaim.type] ?? selectedClaim.type}</dd>
                </div>
                <div>
                  <dt>처리 상태</dt>
                  <dd>{CLAIM_STATUS_META[selectedClaim.status] ?? selectedClaim.status}</dd>
                </div>
                <div>
                  <dt>신청일</dt>
                  <dd>{formatDate(selectedClaim.requestedAt)}</dd>
                </div>
                <div>
                  <dt>신청 사유</dt>
                  <dd>{selectedClaim.reason}</dd>
                </div>
              </dl>

              <div className="claim-detail-guide">
                {selectedClaim.type === 'cancel'
                  ? '취소가 완료된 주문은 주문 내역에서 다시 확인할 수 있습니다.'
                  : '교환/반품 처리 상태가 변경되면 이 화면에서 확인할 수 있습니다.'}
              </div>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}

export default ClaimHistoryPage;
