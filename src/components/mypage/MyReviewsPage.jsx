import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import ConfirmModal from '@/components/common/ConfirmModal';
import EmptyState from '@/components/common/EmptyState';
import ErrorState from '@/components/common/ErrorState';

import { getStoredClaims, getStoredReviews, setStoredReviews } from '@/utils/storage';
import useOrders from '@/hooks/useOrders';
import '@/styles/order-history.css';
import '@/styles/my-reviews.css';

const REVIEW_TABS = [
  { label: '작성 가능한 리뷰', value: 'available' },
  { label: '작성한 리뷰', value: 'written' },
];

const SIZE_FIT_OPTIONS = [
  { label: '작아요', value: 'small' },
  { label: '정사이즈', value: 'true' },
  { label: '커요', value: 'large' },
];

const INITIAL_REVIEWED_ORDER_ITEM_IDS = new Set(['OI-000004']);

const INITIAL_CLAIMED_ORDER_ITEM_IDS = new Set(['OI-000006', 'OI-000007']);

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

function StarIcon({ filled }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="m12 2.7 2.82 5.72 6.31.92-4.56 4.44 1.08 6.28L12 17.09l-5.65 2.97 1.08-6.28-4.56-4.44 6.31-.92L12 2.7Z"
        fill={filled ? 'currentColor' : 'none'}
      />
    </svg>
  );
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

function getOptionText(item) {
  if (!item) {
    return '';
  }

  const color =
    typeof item.color === 'string' ? item.color : (item.color?.label ?? item.color?.value ?? '');

  return [color ? String(color).toUpperCase() : '', item.size].filter(Boolean).join(' / ');
}

function getProductPath(item) {
  const query = item.productType === 'set' ? '?type=set' : '';

  return `/products/${item.productId}${query}`;
}

function MyReviewsPage() {
  const { user, orders, orderDetails, errorMessage, loadOrderDetails } = useOrders();
  const [reviews, setReviews] = useState(() => getStoredReviews());
  const [claims] = useState(() => getStoredClaims());
  const [selectedTab, setSelectedTab] = useState('available');
  const [detailErrorMessage, setDetailErrorMessage] = useState('');
  const [reviewTarget, setReviewTarget] = useState(null);
  const [editingReview, setEditingReview] = useState(null);
  const [deleteReview, setDeleteReview] = useState(null);
  const [rating, setRating] = useState(5);
  const [sizeFit, setSizeFit] = useState('true');
  const [reviewText, setReviewText] = useState('');
  const [reviewError, setReviewError] = useState('');

  useEffect(() => {
    const missingDetailIds = orders
      .filter((order) => order.orderStatus === 'delivered')
      .filter((order) => !Array.isArray(order.items) || order.items.length === 0)
      .filter((order) => !orderDetails[order.orderId])
      .map((order) => order.orderId);

    if (missingDetailIds.length === 0) {
      return;
    }

    let isActive = true;

    const loadMissingDetails = async () => {
      try {
        await loadOrderDetails(missingDetailIds);

        if (isActive) {
          setDetailErrorMessage('');
        }
      } catch (error) {
        if (isActive) {
          setDetailErrorMessage(error.message || '리뷰 상품 정보를 불러오지 못했습니다.');
        }
      }
    };

    void loadMissingDetails();

    return () => {
      isActive = false;
    };
  }, [loadOrderDetails, orderDetails, orders]);

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

  const deliveredItems = useMemo(() => {
    return orders
      .filter((order) => order.orderStatus === 'delivered')
      .flatMap((order) => {
        const detail = orderDetails[order.orderId];

        if (detail?.orderStatus && detail.orderStatus !== 'delivered') {
          return [];
        }

        const items = detail?.items ?? order.items ?? [];

        return items.map((item, index) => {
          const fallbackOrderItemId = [
            order.orderId,
            item.productType ?? 'product',
            item.productId,
            typeof item.color === 'string' ? item.color : (item.color?.value ?? 'none'),
            item.size ?? 'none',
            index,
          ].join(':');

          return {
            ...item,
            orderItemId: item.orderItemId ?? fallbackOrderItemId,
            orderId: order.orderId,
            orderDate: detail?.orderDate ?? order.orderDate,
            orderStatus: detail?.orderStatus ?? order.orderStatus,
          };
        });
      });
  }, [orderDetails, orders]);

  const claimItemIds = useMemo(() => {
    const ids = new Set(INITIAL_CLAIMED_ORDER_ITEM_IDS);

    claims
      .filter(
        (claim) =>
          (claim.type === 'exchange' || claim.type === 'return') && claim.status !== 'rejected'
      )
      .map((claim) => claim.orderItemId)
      .filter(Boolean)
      .forEach((orderItemId) => {
        ids.add(orderItemId);
      });

    return ids;
  }, [claims]);

  const reviewedItemIds = useMemo(() => {
    const ids = new Set(INITIAL_REVIEWED_ORDER_ITEM_IDS);

    reviews
      .map((review) => review.orderItemId)
      .filter(Boolean)
      .forEach((orderItemId) => {
        ids.add(orderItemId);
      });

    return ids;
  }, [reviews]);

  const availableItems = useMemo(() => {
    return deliveredItems.filter((item) => {
      if (item.orderStatus !== 'delivered') {
        return false;
      }

      if (reviewedItemIds.has(item.orderItemId)) {
        return false;
      }

      if (claimItemIds.has(item.orderItemId)) {
        return false;
      }

      return true;
    });
  }, [claimItemIds, deliveredItems, reviewedItemIds]);

  const writtenReviews = useMemo(() => {
    return [...reviews]
      .map((review) => {
        const orderItem = deliveredItems.find((item) => item.orderItemId === review.orderItemId);

        return {
          ...review,
          orderItem,
        };
      })
      .sort((a, b) => {
        return (
          new Date(b.updatedAt ?? b.createdAt).getTime() -
          new Date(a.updatedAt ?? a.createdAt).getTime()
        );
      });
  }, [deliveredItems, reviews]);

  const openWriteReview = (item) => {
    setEditingReview(null);
    setReviewTarget(item);
    setRating(5);
    setSizeFit('true');
    setReviewText('');
    setReviewError('');
  };

  const openEditReview = (review) => {
    setEditingReview(review);
    setReviewTarget(review.orderItem ?? null);
    setRating(Number(review.rating ?? 5));
    setSizeFit(review.sizeFit ?? 'true');
    setReviewText(review.content ?? '');
    setReviewError('');
  };

  const closeReviewModal = () => {
    setReviewTarget(null);
    setEditingReview(null);
    setReviewError('');
  };

  const saveReviews = (nextReviews) => {
    setStoredReviews(nextReviews);
    setReviews(nextReviews);
  };

  const handleReviewSave = () => {
    const content = reviewText.trim();

    if (!reviewTarget?.orderItemId && !editingReview?.orderItemId) {
      setReviewError('리뷰 상품 정보를 확인할 수 없습니다.');
      return;
    }

    if (content.length < 10) {
      setReviewError('리뷰는 10자 이상 작성해주세요.');
      return;
    }

    const now = new Date().toISOString();

    if (editingReview) {
      const nextReviews = reviews.map((review) =>
        review.reviewId === editingReview.reviewId
          ? {
              ...review,
              rating,
              sizeFit,
              content,
              updatedAt: now,
            }
          : review
      );

      saveReviews(nextReviews);
    } else {
      const nextReview = {
        reviewId: `RV-${Date.now()}`,
        orderId: reviewTarget.orderId,
        orderItemId: reviewTarget.orderItemId,
        productId: reviewTarget.productId,
        productType: reviewTarget.productType ?? 'product',
        rating,
        sizeFit,
        content,
        createdAt: now,
        updatedAt: now,
      };

      saveReviews([nextReview, ...reviews]);
    }

    setSelectedTab('written');
    closeReviewModal();
  };

  const handleReviewDelete = () => {
    if (!deleteReview) {
      return;
    }

    const nextReviews = reviews.filter((review) => review.reviewId !== deleteReview.reviewId);

    saveReviews(nextReviews);
    setDeleteReview(null);
  };

  return (
    <>
      <section className="order-history-content my-reviews-page">
        <header className="order-history-heading">
          <h1>내 리뷰</h1>
          <p>구매한 상품의 리뷰를 작성하고 내가 남긴 리뷰를 관리하세요.</p>
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

        <section className="my-reviews-overview">
          <div>
            <span>작성 가능한 리뷰</span>
            <strong>{availableItems.length}</strong>
            <small>배송 완료 상품</small>
          </div>

          <div>
            <span>작성한 리뷰</span>
            <strong>{writtenReviews.length}</strong>
            <small>수정 및 삭제 가능</small>
          </div>
        </section>

        <div className="order-history-toolbar my-reviews-toolbar">
          <div className="order-history-tabs">
            {REVIEW_TABS.map((tab) => {
              const count =
                tab.value === 'available' ? availableItems.length : writtenReviews.length;

              return (
                <button
                  type="button"
                  key={tab.value}
                  className={selectedTab === tab.value ? 'is-active' : ''}
                  onClick={() => setSelectedTab(tab.value)}
                >
                  {tab.label}
                  <span className="my-reviews-tab-count">{count}</span>
                </button>
              );
            })}
          </div>
        </div>

        {errorMessage || detailErrorMessage ? (
          <ErrorState className="my-reviews-empty" message={errorMessage || detailErrorMessage} />
        ) : selectedTab === 'available' ? (
          availableItems.length === 0 ? (
            <EmptyState
              className="my-reviews-empty"
              title="작성 가능한 리뷰가 없습니다."
              description="주문 내역에서 배송 완료된 상품이 생기면 이곳에 자동으로 표시됩니다."
            />
          ) : (
            <div className="my-reviews-list">
              {availableItems.map((item) => {
                const imageUrl = normalizeImageUrl(item.imageUrl);
                const optionText = getOptionText(item);

                return (
                  <article className="my-review-card" key={item.orderItemId}>
                    <div className="my-review-card-head">
                      <div>
                        <strong>{formatDate(item.orderDate)}</strong>
                        <span>|</span>
                        <span>주문번호 {item.orderId}</span>
                      </div>
                      <span className="my-review-status-badge">리뷰 작성 가능</span>
                    </div>

                    <div className="my-review-card-body">
                      <Link to={getProductPath(item)} className="my-review-product-image">
                        {imageUrl ? <img src={imageUrl} alt={item.name} /> : <span>IMAGE</span>}
                      </Link>

                      <div className="my-review-product-info">
                        <Link to={getProductPath(item)}>{item.name ?? '상품 정보 없음'}</Link>
                        {optionText && <p>{optionText}</p>}
                        <span>구매가 ₩ {Number(item.price ?? 0).toLocaleString()}</span>
                      </div>

                      <div className="my-review-write-guide">
                        <strong>상품은 어떠셨나요?</strong>
                        <span>별점과 착용 후기를 남겨주세요.</span>
                      </div>

                      <button
                        type="button"
                        className="my-review-primary-button"
                        onClick={() => openWriteReview(item)}
                      >
                        리뷰 작성
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )
        ) : writtenReviews.length === 0 ? (
          <EmptyState
            className="my-reviews-empty"
            title="아직 작성한 리뷰가 없습니다."
            description="작성 완료한 리뷰가 이곳에 기록됩니다."
          />
        ) : (
          <div className="my-reviews-list">
            {writtenReviews.map((review) => {
              const item = review.orderItem;
              const imageUrl = normalizeImageUrl(item?.imageUrl);
              const optionText = getOptionText(item);
              const fitLabel =
                SIZE_FIT_OPTIONS.find((option) => option.value === review.sizeFit)?.label ??
                '정사이즈';

              return (
                <article className="my-review-card is-written" key={review.reviewId}>
                  <div className="my-review-card-head">
                    <div>
                      <strong>{formatDate(review.createdAt)}</strong>
                      {review.updatedAt !== review.createdAt && <span>수정됨</span>}
                    </div>

                    <div className="my-review-card-menu">
                      <button type="button" onClick={() => openEditReview(review)}>
                        수정
                      </button>
                      <button type="button" onClick={() => setDeleteReview(review)}>
                        삭제
                      </button>
                    </div>
                  </div>

                  <div className="my-review-written-body">
                    <div className="my-review-written-product">
                      <Link
                        to={item ? getProductPath(item) : '/mypage/orders'}
                        className="my-review-product-image"
                      >
                        {imageUrl ? (
                          <img src={imageUrl} alt={item?.name ?? '리뷰 상품'} />
                        ) : (
                          <span>IMAGE</span>
                        )}
                      </Link>

                      <div className="my-review-product-info">
                        <Link to={item ? getProductPath(item) : '/mypage/orders'}>
                          {item?.name ?? '구매 상품'}
                        </Link>
                        {optionText && <p>{optionText}</p>}
                        <span>주문번호 {review.orderId}</span>
                      </div>
                    </div>

                    <div className="my-review-record">
                      <div className="my-review-stars" aria-label={`별점 ${review.rating}점`}>
                        {Array.from({ length: 5 }, (_, index) => (
                          <span key={index} className={index < review.rating ? 'is-filled' : ''}>
                            <StarIcon filled={index < review.rating} />
                          </span>
                        ))}
                        <strong>{review.rating}.0</strong>
                      </div>

                      <div className="my-review-fit-row">
                        <span>사이즈</span>
                        <strong>{fitLabel}</strong>
                      </div>

                      <p>{review.content}</p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {(reviewTarget || editingReview) && (
        <div className="my-review-modal-backdrop" onClick={closeReviewModal}>
          <section
            className="my-review-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="reviewModalTitle"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="my-review-modal-head">
              <div>
                <h2 id="reviewModalTitle">{editingReview ? '리뷰 수정' : '리뷰 작성'}</h2>
                <p>구매한 상품에 대한 솔직한 경험을 남겨주세요.</p>
              </div>

              <button type="button" aria-label="리뷰 창 닫기" onClick={closeReviewModal}>
                ×
              </button>
            </div>

            <div className="my-review-modal-product">
              <div className="my-review-modal-image">
                {normalizeImageUrl(reviewTarget?.imageUrl) ? (
                  <img
                    src={normalizeImageUrl(reviewTarget.imageUrl)}
                    alt={reviewTarget?.name ?? '리뷰 상품'}
                  />
                ) : (
                  <span>IMAGE</span>
                )}
              </div>

              <div>
                <strong>{reviewTarget?.name ?? '구매 상품'}</strong>
                <span>{getOptionText(reviewTarget)}</span>
              </div>
            </div>

            <div className="my-review-modal-body">
              <div className="my-review-form-section">
                <label>전체 만족도</label>
                <div className="my-review-rating-buttons">
                  {Array.from({ length: 5 }, (_, index) => {
                    const value = index + 1;

                    return (
                      <button
                        type="button"
                        key={value}
                        className={value <= rating ? 'is-active' : ''}
                        aria-label={`${value}점`}
                        onClick={() => setRating(value)}
                      >
                        <StarIcon filled={value <= rating} />
                      </button>
                    );
                  })}
                  <strong>{rating}.0</strong>
                </div>
              </div>

              <div className="my-review-form-section">
                <label>사이즈는 어떠셨나요?</label>
                <div className="my-review-fit-buttons">
                  {SIZE_FIT_OPTIONS.map((option) => (
                    <button
                      type="button"
                      key={option.value}
                      className={sizeFit === option.value ? 'is-active' : ''}
                      onClick={() => setSizeFit(option.value)}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="my-review-form-section">
                <div className="my-review-textarea-label">
                  <label htmlFor="myReviewText">상품 리뷰</label>
                  <span>{reviewText.length}/500</span>
                </div>

                <textarea
                  id="myReviewText"
                  maxLength={500}
                  value={reviewText}
                  placeholder="착용감, 사이즈, 소재 등 상품을 사용하며 느낀 점을 작성해주세요."
                  onChange={(event) => {
                    setReviewText(event.target.value);
                    setReviewError('');
                  }}
                />

                {reviewError && <p className="my-review-form-error">{reviewError}</p>}
              </div>
            </div>

            <div className="my-review-modal-actions">
              <button type="button" onClick={closeReviewModal}>
                취소
              </button>
              <button type="button" className="is-primary" onClick={handleReviewSave}>
                {editingReview ? '수정 저장' : '리뷰 등록'}
              </button>
            </div>
          </section>
        </div>
      )}

      <ConfirmModal
        open={Boolean(deleteReview)}
        title="리뷰를 삭제하시겠어요?"
        description="삭제한 리뷰는 작성 가능한 리뷰 목록으로 다시 이동합니다."
        confirmText="삭제하기"
        cancelText="계속 보관하기"
        onConfirm={handleReviewDelete}
        onClose={() => setDeleteReview(null)}
        titleId="deleteReviewTitle"
        backdropClassName="my-review-modal-backdrop"
        modalClassName="my-review-delete-modal"
        confirmClassName="is-danger"
      />
    </>
  );
}

export default MyReviewsPage;
