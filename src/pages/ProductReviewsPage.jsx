import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';

import { getProduct, getSet } from '@/api/products';
import { getProductReviews, getSetReviews } from '@/api/reviews';
import ErrorState from '@/components/common/ErrorState';
import LoadingState from '@/components/common/LoadingState';
import { getAccessToken } from '@/utils/storage';
import '@/styles/product-reviews.css';

const REVIEW_PAGE_LIMIT = 10;

function normalizeImageUrl(url) {
  if (!url || typeof url !== 'string') {
    return '';
  }

  return url.trim().replace(/^<|>$/g, '');
}

function formatDate(value) {
  if (!value) {
    return '-';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

function StarIcon({ filled }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="m12 3.6 2.58 5.23 5.77.84-4.18 4.07.99 5.75L12 16.77 6.84 19.5l.99-5.75-4.18-4.07 5.77-.84L12 3.6Z"
        fill={filled ? 'currentColor' : 'none'}
      />
    </svg>
  );
}

function ReviewStars({ rating }) {
  const safeRating = Math.max(0, Math.min(5, Number(rating) || 0));

  return (
    <div className="product-reviews-stars" aria-label={`별점 ${safeRating}점`}>
      {Array.from({ length: 5 }, (_, index) => (
        <span key={index} className={index < safeRating ? 'is-filled' : ''}>
          <StarIcon filled={index < safeRating} />
        </span>
      ))}
    </div>
  );
}

function ProductReviewsPage() {
  const navigate = useNavigate();
  const { productId } = useParams();
  const [searchParams] = useSearchParams();
  const isSet = searchParams.get('type') === 'set';

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [summary, setSummary] = useState({
    averageRating: 0,
    reviewCount: 0,
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    hasNextPage: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadPage = async () => {
      try {
        setIsLoading(true);
        setLoadError('');

        const [productResponse, reviewResponse] = await Promise.all([
          isSet ? getSet(productId) : getProduct(productId),
          isSet
            ? getSetReviews(productId, { page: 1, limit: REVIEW_PAGE_LIMIT })
            : getProductReviews(productId, { page: 1, limit: REVIEW_PAGE_LIMIT }),
        ]);

        if (!isMounted) {
          return;
        }

        const productData = productResponse?.data ?? null;
        const reviewData = reviewResponse?.data ?? {};

        setProduct(productData);
        setReviews(Array.isArray(reviewData.reviews) ? reviewData.reviews : []);
        setSummary({
          averageRating: Number(reviewData.averageRating ?? 0),
          reviewCount: Number(reviewData.reviewCount ?? 0),
        });
        setPagination({
          currentPage: Number(reviewData.pagination?.currentPage ?? 1),
          hasNextPage: Boolean(reviewData.pagination?.hasNextPage),
        });
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setLoadError(error.message || '리뷰 정보를 불러오지 못했습니다.');
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadPage();

    return () => {
      isMounted = false;
    };
  }, [isSet, productId]);

  const productImage = useMemo(
    () =>
      normalizeImageUrl(
        product?.images?.thumbnail ||
          product?.imageUrl ||
          product?.images?.front ||
          product?.images?.styled
      ),
    [product]
  );

  const productPath = `/products/${productId}${isSet ? '?type=set' : ''}`;

  const handleWriteReview = () => {
    if (!getAccessToken()) {
      navigate('/login');
      return;
    }

    navigate('/mypage/reviews');
  };

  const handleLoadMore = async () => {
    if (!pagination.hasNextPage || isLoadingMore) {
      return;
    }

    try {
      setIsLoadingMore(true);

      const nextPage = pagination.currentPage + 1;

      const response = isSet
        ? await getSetReviews(productId, {
            page: nextPage,
            limit: REVIEW_PAGE_LIMIT,
          })
        : await getProductReviews(productId, {
            page: nextPage,
            limit: REVIEW_PAGE_LIMIT,
          });

      const data = response?.data ?? {};
      const nextReviews = Array.isArray(data.reviews) ? data.reviews : [];

      setReviews((current) => [...current, ...nextReviews]);

      setSummary({
        averageRating: Number(data.averageRating ?? summary.averageRating),
        reviewCount: Number(data.reviewCount ?? summary.reviewCount),
      });

      setPagination({
        currentPage: Number(data.pagination?.currentPage ?? nextPage),
        hasNextPage: Boolean(data.pagination?.hasNextPage),
      });
    } catch (error) {
      setLoadError(error.message || '추가 리뷰를 불러오지 못했습니다.');
    } finally {
      setIsLoadingMore(false);
    }
  };

  if (isLoading) {
    return (
      <main className="product-reviews-page">
        <LoadingState className="product-reviews-state" message="리뷰 정보를 불러오는 중입니다." />
      </main>
    );
  }

  if (loadError && !product) {
    return (
      <main className="product-reviews-page">
        <ErrorState className="product-reviews-state" message={loadError} />
      </main>
    );
  }

  return (
    <main className="product-reviews-page">
      <div className="product-reviews-shell">
        <aside className="product-reviews-sidebar">
          <Link to={productPath} className="product-reviews-product-image">
            {productImage ? (
              <img src={productImage} alt={product?.name ?? '상품'} />
            ) : (
              <span>IMAGE</span>
            )}
          </Link>

          <div className="product-reviews-product-meta">
            <span>{isSet ? 'SETS' : (product?.categoryId ?? 'PRODUCT').toUpperCase()}</span>

            <strong>{product?.name ?? '상품 정보'}</strong>

            <p>₩ {Number(product?.price ?? 0).toLocaleString()}</p>
          </div>

          <div className="product-reviews-sidebar-divider" />

          <Link to={productPath} className="product-reviews-back-link">
            상품 상세로 돌아가기
          </Link>

          <button
            type="button"
            className="product-reviews-write-button"
            onClick={handleWriteReview}
          >
            리뷰 작성
          </button>
        </aside>

        <section className="product-reviews-content">
          <header className="product-reviews-heading">
            <div>
              <h1>상품 리뷰</h1>
              <p>구매한 고객들이 남긴 실제 상품 후기를 확인하세요.</p>
            </div>

            <Link to={productPath}>상품 보기</Link>
          </header>

          <section className="product-reviews-summary">
            <div className="product-reviews-score-card">
              <span>평균 만족도</span>

              <div>
                <strong>{summary.averageRating.toFixed(1)}</strong>

                <ReviewStars rating={Math.round(summary.averageRating)} />
              </div>
            </div>

            <div className="product-reviews-count-card">
              <span>등록된 리뷰</span>

              <strong>{summary.reviewCount}</strong>

              <small>구매 완료 고객 리뷰</small>
            </div>
          </section>

          <div className="product-reviews-list-heading">
            <strong>전체 리뷰</strong>
            <span>{summary.reviewCount}개</span>
          </div>

          {loadError && reviews.length > 0 && (
            <ErrorState className="product-reviews-inline-error" message={loadError} />
          )}

          {reviews.length === 0 ? (
            <div className="product-reviews-empty">
              <strong>아직 등록된 리뷰가 없습니다.</strong>

              <span>이 상품의 첫 번째 리뷰가 등록되면 이곳에 표시됩니다.</span>
            </div>
          ) : (
            <div className="product-reviews-list">
              {reviews.map((review) => (
                <article className="product-review-card" key={review.reviewId}>
                  <div className="product-review-card-head">
                    <div>
                      <strong>{review.userName || '구매 고객'}</strong>

                      <span>{formatDate(review.createdAt)}</span>
                    </div>

                    <span className="product-review-verified-badge">구매 리뷰</span>
                  </div>

                  <div className="product-review-card-body">
                    <div className="product-review-rating-area">
                      <ReviewStars rating={review.rating} />

                      <strong>{Number(review.rating ?? 0).toFixed(1)}</strong>
                    </div>

                    <p>{review.content}</p>

                    {review.updatedAt && review.updatedAt !== review.createdAt && (
                      <span className="product-review-updated">수정된 리뷰</span>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}

          {pagination.hasNextPage && (
            <button
              type="button"
              className="product-reviews-more-button"
              disabled={isLoadingMore}
              onClick={handleLoadMore}
            >
              {isLoadingMore ? '불러오는 중' : '리뷰 더보기'}
            </button>
          )}
        </section>
      </div>
    </main>
  );
}

export default ProductReviewsPage;
