import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import '@/styles/best-seller.css';

function ChevronLeft({ size = 20, className }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

function ChevronRight({ size = 20, className }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

const COMPACT_QUERY = '(max-width: 767px)';
const TABLET_QUERY = '(min-width: 768px) and (max-width: 1024px)';
const MOBILE_INITIAL_COUNT = 4;

function useMatchMedia(query) {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);

  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = (e) => setMatches(e.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, [query]);

  return matches;
}

function useIsCompact() {
  return useMatchMedia(COMPACT_QUERY);
}

function useIsTablet() {
  return useMatchMedia(TABLET_QUERY);
}

function StarRating({ rating = 0, reviewCount = 0 }) {
  const safeRating = Number.isFinite(Number(rating)) ? Number(rating) : 0;
  const roundedRating = Math.round(safeRating);

  return (
    <div className="best-seller-card__rating">
      <div className="best-seller-card__rating-main">
        <div className="best-seller-card__stars" aria-label={`평점 ${safeRating}점`}>
          {Array.from({ length: 1 }, (_, index) => (
            <span key={index}>{index < roundedRating ? '★' : '☆'}</span>
          ))}
        </div>

        <span className="best-seller-card__rating-number">{safeRating.toFixed(1)}</span>
      </div>

      {reviewCount > 0 && (
        <span className="best-seller-card__review-count">리뷰 {reviewCount}</span>
      )}
    </div>
  );
}

function BestSellerSkeleton() {
  return (
    <article className="best-seller-card best-seller-card--loading">
      <div className="best-seller-card__image-wrap">
        <div className="best-seller-card__placeholder" />
      </div>

      <div className="best-seller-card__content">
        <div className="best-seller-card__text-skeleton best-seller-card__text-skeleton--name" />
        <div className="best-seller-card__text-skeleton best-seller-card__text-skeleton--rating" />
        <div className="best-seller-card__text-skeleton best-seller-card__text-skeleton--description" />
      </div>
    </article>
  );
}

function BestSellerSection({ products = [], isLoading = false, error = null }) {
  const [startIndex, setStartIndex] = useState(0);
  const [showAllMobile, setShowAllMobile] = useState(false);
  const isCompact = useIsCompact();
  const isTablet = useIsTablet();
  const visibleCount = isTablet ? 2 : 3;

  const visibleProducts = useMemo(() => {
    if (products.length <= visibleCount) {
      return products;
    }

    return Array.from({ length: visibleCount }, (_, offset) => {
      const index = (startIndex + offset) % products.length;
      return products[index];
    });
  }, [products, startIndex, visibleCount]);

  const hasMoreForMobile = products.length > MOBILE_INITIAL_COUNT;

  const displayedProducts = isCompact
    ? showAllMobile
      ? products
      : products.slice(0, MOBILE_INITIAL_COUNT + 2)
    : visibleProducts;

  const movePrevious = () => {
    if (products.length <= visibleCount) {
      return;
    }

    setStartIndex((current) => (current === 0 ? products.length - 1 : current - 1));
  };

  const moveNext = () => {
    if (products.length <= visibleCount) {
      return;
    }

    setStartIndex((current) => (current + 1) % products.length);
  };

  return (
    <section className="best-seller">
      <div className="best-seller__background-text" aria-hidden="true">
        PRODUCT
      </div>

      <div className="best-seller__inner">
        <div
          className={`best-seller__products-shell ${
            !showAllMobile && hasMoreForMobile ? 'best-seller__products-shell--collapsed' : ''
          }`}
        >
          <div className="best-seller__products">
            {isLoading &&
              Array.from({ length: 3 }, (_, index) => (
                <BestSellerSkeleton key={`loading-${index}`} />
              ))}

            {!isLoading &&
              !error &&
              displayedProducts.map((product, index) => (
                <Link
                  className={`best-seller-card ${
                    isCompact && !showAllMobile && index >= MOBILE_INITIAL_COUNT
                      ? 'best-seller-card--peek'
                      : ''
                  }`}
                  to={`/products/${product.id}`}
                  key={product.id}
                >
                  <div className="best-seller-card__image-wrap">
                    {product.imageUrl ? (
                      <img
                        className="best-seller-card__image"
                        src={product.imageUrl}
                        alt={product.name}
                      />
                    ) : (
                      <div className="best-seller-card__image-fallback">이미지가 없습니다.</div>
                    )}
                    <div className="best-seller-card__scrim" />

                    <div className="best-seller-card__overlay">
                      <span className="best-seller-card__handle">{product.name}</span>
                      <span className="best-seller-card__mini-rating">
                        ★ {Number(product.rating ?? 0).toFixed(1)}
                      </span>
                      <p className="best-seller-card__mini-review">{product.description}</p>
                    </div>
                  </div>

                  <div className="best-seller-card__content">
                    <h3 className="best-seller-card__name">{product.name}</h3>

                    <StarRating rating={product.rating} reviewCount={product.reviewCount} />

                    <p className="best-seller-card__review">{product.description}</p>
                  </div>
                </Link>
              ))}

            {!isLoading && !error && products.length === 0 && (
              <div className="best-seller__empty">등록된 베스트 상품이 없습니다.</div>
            )}

            {!isLoading && error && (
              <div className="best-seller__error">
                <p>베스트 상품을 불러오지 못했습니다.</p>
                <span>잠시 후 다시 시도해주세요.</span>
              </div>
            )}
          </div>

          {!isLoading && !error && !showAllMobile && hasMoreForMobile && (
            <button
              type="button"
              onClick={() => setShowAllMobile(true)}
              className="best-seller__more"
            >
              더보기
            </button>
          )}
        </div>

        <aside className="best-seller__statement">
          <h2 className="best-seller__title">STYLE REVIEWS</h2>

          <div className="best-seller__controls">
            <button
              type="button"
              onClick={movePrevious}
              disabled={isLoading || Boolean(error) || products.length <= visibleCount}
              aria-label="이전 베스트셀러 보기"
            >
              <ChevronLeft />
            </button>

            <button
              type="button"
              onClick={moveNext}
              disabled={isLoading || Boolean(error) || products.length <= visibleCount}
              aria-label="다음 베스트셀러 보기"
            >
              <ChevronRight />
            </button>
          </div>
        </aside>
      </div>
    </section>
  );
}

export default BestSellerSection;
