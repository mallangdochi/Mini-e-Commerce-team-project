import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { getCoupons } from '@/api/coupons';
import EmptyState from '@/components/common/EmptyState';
import ErrorState from '@/components/common/ErrorState';
import LoadingState from '@/components/common/LoadingState';
import useOrders from '@/hooks/useOrders';
import useAuthStore from '@/store/authStore';
import '@/styles/order-history.css';
import '@/styles/coupon-benefits.css';

const COUPON_TABS = [
  { label: '사용 가능', value: 'available' },
  { label: '사용 완료', value: 'used' },
  { label: '기간 만료', value: 'expired' },
];

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

function normalizeServerCoupons(userCoupons) {
  if (Array.isArray(userCoupons) && userCoupons.length > 0) {
    return userCoupons.map((coupon, index) => {
      const expiresAt = coupon.expiresAt ?? coupon.expiredAt ?? coupon.endDate ?? null;
      const isExpired =
        coupon.status === 'expired' ||
        Boolean(expiresAt && new Date(expiresAt).getTime() < Date.now());
      const isUsed = coupon.status === 'used' || Boolean(coupon.usedAt) || Boolean(coupon.isUsed);

      let status = 'available';

      if (isExpired) {
        status = 'expired';
      } else if (isUsed) {
        status = 'used';
      }

      return {
        couponId: coupon.couponId ?? coupon.id ?? `coupon-${index}`,
        name: coupon.name ?? coupon.couponName ?? coupon.title ?? 'ARC 쿠폰',
        description: coupon.description ?? coupon.desc ?? '',
        discountType: coupon.discountType ?? coupon.type ?? 'fixed',
        discountValue: Number(
          coupon.discountValue ?? coupon.amount ?? coupon.discountAmount ?? coupon.discountRate ?? 0
        ),
        maxDiscount: Number(coupon.maxDiscount ?? coupon.maximumDiscount ?? 0),
        minOrderAmount: Number(coupon.minOrderAmount ?? coupon.minimumAmount ?? 0),
        expiresAt,
        usedAt: coupon.usedAt ?? null,
        status,
      };
    });
  }

  return [];
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

function getDiscountLabel(coupon) {
  if (coupon.discountType === 'percent' || coupon.discountType === 'rate') {
    return `${coupon.discountValue}%`;
  }

  return `${coupon.discountValue.toLocaleString()}원`;
}

function CouponBenefitsPage() {
  const patchUserSummary = useAuthStore((state) => state.patchUserSummary);

  const { user, orders, errorMessage: orderErrorMessage } = useOrders();

  const [selectedTab, setSelectedTab] = useState('available');
  const [couponItems, setCouponItems] = useState([]);
  const [isCouponLoading, setIsCouponLoading] = useState(true);
  const [couponErrorMessage, setCouponErrorMessage] = useState('');

  const coupons = useMemo(() => normalizeServerCoupons(couponItems), [couponItems]);

  useEffect(() => {
    let isActive = true;

    const loadCoupons = async () => {
      setIsCouponLoading(true);
      setCouponErrorMessage('');

      try {
        const response = await getCoupons();

        const nextCoupons = Array.isArray(response?.data) ? response.data : [];

        if (isActive) {
          setCouponItems(nextCoupons);
        }
      } catch (error) {
        if (isActive) {
          setCouponItems([]);
          setCouponErrorMessage(error.message || '쿠폰 정보를 불러오지 못했습니다.');
        }
      } finally {
        if (isActive) {
          setIsCouponLoading(false);
        }
      }
    };

    void loadCoupons();

    return () => {
      isActive = false;
    };
  }, []);

  const filteredCoupons = useMemo(() => {
    return coupons.filter((coupon) => coupon.status === selectedTab);
  }, [coupons, selectedTab]);

  const counts = useMemo(() => {
    return coupons.reduce(
      (acc, coupon) => {
        acc[coupon.status] += 1;
        return acc;
      },
      {
        available: 0,
        used: 0,
        expired: 0,
      }
    );
  }, [coupons]);

  useEffect(() => {
    patchUserSummary({
      availableCouponCount: counts.available,
      couponCount: counts.available,
    });
  }, [counts.available, patchUserSummary]);

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
      value: `${counts.available}개`,
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

  return (
    <>
      <section className="order-history-content coupon-benefits-page">
        <header className="coupon-heading">
          <h1>쿠폰 및 혜택</h1>
          <p>보유 쿠폰과 적립금 혜택을 확인하세요.</p>
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

        <section className="benefit-balance">
          <div>
            <span>사용 가능한 쿠폰</span>
            <strong>{counts.available}개</strong>
          </div>

          <div className="benefit-balance-divider" />

          <div>
            <span>보유 적립금</span>
            <strong>{pointBalance.toLocaleString()}원</strong>
          </div>

          <p>결제 단계에서 사용 가능한 쿠폰과 적립금을 적용할 수 있습니다.</p>
        </section>

        <div className="coupon-tabs">
          {COUPON_TABS.map((tab) => (
            <button
              type="button"
              key={tab.value}
              className={selectedTab === tab.value ? 'is-active' : ''}
              onClick={() => setSelectedTab(tab.value)}
            >
              {tab.label}
              <span>{counts[tab.value]}</span>
            </button>
          ))}
        </div>

        {isCouponLoading ? (
          <LoadingState className="coupon-empty" message="쿠폰 정보를 불러오는 중입니다." />
        ) : couponErrorMessage || orderErrorMessage ? (
          <ErrorState className="coupon-empty" message={couponErrorMessage || orderErrorMessage} />
        ) : filteredCoupons.length === 0 ? (
          <EmptyState
            className="coupon-empty"
            icon={<IconCoupon />}
            title={
              selectedTab === 'available'
                ? '사용 가능한 쿠폰이 없습니다.'
                : selectedTab === 'used'
                  ? '사용 완료된 쿠폰이 없습니다.'
                  : '기간 만료된 쿠폰이 없습니다.'
            }
            description={
              selectedTab === 'available'
                ? '새로운 쿠폰이 발급되면 이곳에서 확인할 수 있습니다.'
                : '해당 쿠폰 내역이 없습니다.'
            }
          />
        ) : (
          <div className="coupon-list">
            {filteredCoupons.map((coupon) => (
              <article className={`coupon-card coupon-card-${coupon.status}`} key={coupon.couponId}>
                <div className="coupon-card-discount">
                  <strong>{getDiscountLabel(coupon)}</strong>
                  <span>DISCOUNT</span>
                </div>

                <div className="coupon-card-info">
                  <span className="coupon-card-status">
                    {coupon.status === 'available' && '사용 가능'}
                    {coupon.status === 'used' && '사용 완료'}
                    {coupon.status === 'expired' && '기간 만료'}
                  </span>

                  <h2>{coupon.name}</h2>

                  {coupon.description && <p>{coupon.description}</p>}

                  <dl>
                    {coupon.minOrderAmount > 0 && (
                      <div>
                        <dt>사용 조건</dt>
                        <dd>{coupon.minOrderAmount.toLocaleString()}원 이상 구매 시</dd>
                      </div>
                    )}

                    {coupon.maxDiscount > 0 && (
                      <div>
                        <dt>최대 할인</dt>
                        <dd>{coupon.maxDiscount.toLocaleString()}원</dd>
                      </div>
                    )}

                    <div>
                      <dt>유효기간</dt>
                      <dd>{coupon.expiresAt ? formatDate(coupon.expiresAt) : '별도 표기 없음'}</dd>
                    </div>
                  </dl>
                </div>
              </article>
            ))}
          </div>
        )}

        <section className="point-guide">
          <div>
            <h2>적립금 안내</h2>
            <p>현재 보유 적립금과 사용 안내를 확인하세요.</p>
          </div>

          <dl>
            <div>
              <dt>현재 적립금</dt>
              <dd>{pointBalance.toLocaleString()}원</dd>
            </div>

            <div>
              <dt>사용 방법</dt>
              <dd>결제 페이지에서 사용할 적립금을 선택할 수 있습니다.</dd>
            </div>
          </dl>
        </section>
      </section>
    </>
  );
}

export default CouponBenefitsPage;
