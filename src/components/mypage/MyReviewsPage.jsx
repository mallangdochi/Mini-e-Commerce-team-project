import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import {
  createReview,
  deleteReview as deleteReviewApi,
  getEligibleReviews,
  getMyReviews,
  updateReview,
} from '@/api/reviews';
import ConfirmModal from '@/components/common/ConfirmModal';
import EmptyState from '@/components/common/EmptyState';
import ErrorState from '@/components/common/ErrorState';
import LoadingState from '@/components/common/LoadingState';
import useOrders from '@/hooks/useOrders';
import '@/styles/order-history.css';
import '@/styles/my-reviews.css';

const REVIEW_TABS = [
  { label: '작성 가능한 리뷰', value: 'available' },
  { label: '작성한 리뷰', value: 'written' },
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
  return typeof url === 'string' ? url.trim().replace(/^<|>$/g, '') : '';
}

function formatDate(value) {
  const date = new Date(value);

  if (!value || Number.isNaN(date.getTime())) {
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
  const color =
    typeof item?.color === 'string' ? item.color : (item?.color?.label ?? item?.color?.value ?? '');

  return [color ? String(color).toUpperCase() : '', item?.size].filter(Boolean).join(' / ');
}

function getProductPath(item) {
  const query = item?.productType === 'set' ? '?type=set' : '';
  return `/products/${item?.productId}${query}`;
}

function extractArray(response, candidates = []) {
  const data = response?.data ?? response ?? [];

  if (Array.isArray(data)) {
    return data;
  }

  for (const key of candidates) {
    if (Array.isArray(data?.[key])) {
      return data[key];
    }
  }

  return [];
}

function normalizeReviewItem(item) {
  const product = item?.product ?? {};

  return {
    ...item,
    productId: Number(item?.productId ?? product?.productId ?? product?.id),
    productType: item?.productType ?? product?.productType ?? 'product',
    name: item?.name ?? item?.productName ?? product?.name ?? '구매 상품',
    imageUrl: item?.imageUrl ?? product?.imageUrl ?? product?.images?.thumbnail ?? '',
    price: Number(item?.price ?? product?.price ?? 0),
    color: item?.color ?? product?.color ?? '',
    size: item?.size ?? '',
  };
}

function MyReviewsPage() {
  const [searchParams] = useSearchParams();
  const { user, orders } = useOrders();

  const targetOrderId = searchParams.get('orderId');

  const [selectedTab, setSelectedTab] = useState('available');
  const [availableItems, setAvailableItems] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [reviewTarget, setReviewTarget] = useState(null);
  const [editingReview, setEditingReview] = useState(null);
  const [deleteReview, setDeleteReview] = useState(null);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const loadReviewData = async () => {
    setIsLoading(true);
    setLoadError('');

    try {
      const [eligibleResponse, myReviewsResponse] = await Promise.all([
        getEligibleReviews(),
        getMyReviews(),
      ]);

      setAvailableItems(
        extractArray(eligibleResponse, ['items', 'reviews']).map(normalizeReviewItem)
      );

      setReviews(extractArray(myReviewsResponse, ['items', 'reviews']).map(normalizeReviewItem));
    } catch (error) {
      setLoadError(error.message || '리뷰 정보를 불러오지 못했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadReviewData();
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  const couponCount = Number(user?.couponCount ?? user?.availableCouponCount ?? 0);

  const pointBalance = Number(user?.points ?? 0);

  const wishlistCount = Number(user?.wishlistCount ?? 0);

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

  const visibleAvailableItems = useMemo(() => {
    if (!targetOrderId) {
      return availableItems;
    }

    return availableItems.filter((item) => String(item.orderId) === String(targetOrderId));
  }, [availableItems, targetOrderId]);

  const visibleWrittenReviews = useMemo(() => {
    const sorted = [...reviews].sort(
      (a, b) =>
        new Date(b.updatedAt ?? b.createdAt).getTime() -
        new Date(a.updatedAt ?? a.createdAt).getTime()
    );

    if (!targetOrderId) {
      return sorted;
    }

    return sorted.filter((review) => String(review.orderId) === String(targetOrderId));
  }, [reviews, targetOrderId]);

  const openWriteReview = (item) => {
    setEditingReview(null);
    setReviewTarget(item);
    setRating(5);
    setReviewText('');
    setReviewError('');
  };

  const openEditReview = (review) => {
    setEditingReview(review);
    setReviewTarget(review);
    setRating(Number(review.rating ?? 5));
    setReviewText(review.content ?? '');
    setReviewError('');
  };

  const closeReviewModal = () => {
    setReviewTarget(null);
    setEditingReview(null);
    setReviewError('');
  };

  const handleReviewSave = async () => {
    const content = reviewText.trim();

    if (content.length < 10) {
      setReviewError('리뷰는 10자 이상 작성해주세요.');
      return;
    }

    if (!editingReview && !reviewTarget?.orderItemId) {
      setReviewError('리뷰 상품 정보를 확인할 수 없습니다.');
      return;
    }

    setIsSaving(true);

    try {
      if (editingReview) {
        await updateReview(editingReview.reviewId, {
          rating,
          content,
        });
      } else {
        await createReview({
          orderItemId: reviewTarget.orderItemId,
          rating,
          content,
        });
      }

      await loadReviewData();
      setSelectedTab('written');
      closeReviewModal();
    } catch (error) {
      setReviewError(error.message || '리뷰를 저장하지 못했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReviewDelete = async () => {
    if (!deleteReview) {
      return;
    }

    try {
      await deleteReviewApi(deleteReview.reviewId);
      setDeleteReview(null);
      await loadReviewData();
    } catch (error) {
      alert(error.message || '리뷰를 삭제하지 못했습니다.');
    }
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

        <div className="my-reviews-tabs">
          {REVIEW_TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              className={selectedTab === tab.value ? 'is-active' : ''}
              onClick={() => setSelectedTab(tab.value)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loadError ? (
          <ErrorState className="my-reviews-empty" message={loadError} />
        ) : isLoading ? (
          <LoadingState className="my-reviews-empty" message="리뷰 정보를 불러오는 중입니다." />
        ) : selectedTab === 'available' ? (
          visibleAvailableItems.length === 0 ? (
            <EmptyState
              className="my-reviews-empty"
              title="작성 가능한 리뷰가 없습니다."
              description="배송 완료 후 리뷰 작성이 가능한 상품이 이곳에 표시됩니다."
            />
          ) : (
            <div className="my-reviews-list">
              {visibleAvailableItems.map((item) => {
                const imageUrl = normalizeImageUrl(item.imageUrl);

                return (
                  <article className="my-review-card" key={item.orderItemId}>
                    <div className="my-review-card-head">
                      <div>
                        <strong>{formatDate(item.orderDate ?? item.deliveredAt)}</strong>

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
                        <Link to={getProductPath(item)}>{item.name}</Link>

                        {getOptionText(item) && <p>{getOptionText(item)}</p>}

                        <span>구매가 ₩ {item.price.toLocaleString()}</span>
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
        ) : visibleWrittenReviews.length === 0 ? (
          <EmptyState
            className="my-reviews-empty"
            title="아직 작성한 리뷰가 없습니다."
            description="작성 완료한 리뷰가 이곳에 기록됩니다."
          />
        ) : (
          <div className="my-reviews-list">
            {visibleWrittenReviews.map((review) => {
              const imageUrl = normalizeImageUrl(review.imageUrl);

              return (
                <article className="my-review-card is-written" key={review.reviewId}>
                  <div className="my-review-card-head">
                    <div>
                      <strong>{formatDate(review.createdAt)}</strong>

                      {review.updatedAt && review.updatedAt !== review.createdAt && (
                        <span>수정됨</span>
                      )}
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
                      <Link to={getProductPath(review)} className="my-review-product-image">
                        {imageUrl ? <img src={imageUrl} alt={review.name} /> : <span>IMAGE</span>}
                      </Link>

                      <div className="my-review-product-info">
                        <Link to={getProductPath(review)}>{review.name}</Link>

                        {getOptionText(review) && <p>{getOptionText(review)}</p>}

                        <span>주문번호 {review.orderId ?? '-'}</span>
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

              <button
                type="button"
                className="is-primary"
                disabled={isSaving}
                onClick={handleReviewSave}
              >
                {isSaving ? '저장 중' : editingReview ? '수정 저장' : '리뷰 등록'}
              </button>
            </div>
          </section>
        </div>
      )}

      <ConfirmModal
        open={Boolean(deleteReview)}
        title="리뷰를 삭제하시겠어요?"
        description="삭제한 리뷰는 복구할 수 없습니다."
        confirmText="삭제"
        cancelText="취소"
        onConfirm={handleReviewDelete}
        onClose={() => setDeleteReview(null)}
        titleId="deleteReviewConfirmTitle"
      />
    </>
  );
}

export default MyReviewsPage;
