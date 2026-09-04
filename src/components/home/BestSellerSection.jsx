import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import '@/styles/best-seller.css';

function StarRating({ rating = 0, reviewCount = 0 }) {
  const safeRating = Number.isFinite(Number(rating)) ? Number(rating) : 0;
  const roundedRating = Math.round(safeRating);

  return (
    <div className="best-seller-card__rating">
      <div className="best-seller-card__stars" aria-label={`평점 ${safeRating}점`}>
        {Array.from({ length: 5 }, (_, index) => (
          <span key={index}>{index < roundedRating ? '★' : '☆'}</span>
        ))}
      </div>

      <span className="best-seller-card__rating-number">{safeRating.toFixed(1)}</span>

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

  useEffect(() => {
    setStartIndex(0);
  }, [products]);

  const visibleProducts = useMemo(() => {
    if (products.length <= 3) {
      return products;
    }

    return Array.from({ length: 3 }, (_, offset) => {
      const index = (startIndex + offset) % products.length;
      return products[index];
    });
  }, [products, startIndex]);

  const movePrevious = () => {
    if (products.length <= 3) {
      return;
    }

    setStartIndex((current) => (current === 0 ? products.length - 1 : current - 1));
  };

  const moveNext = () => {
    if (products.length <= 3) {
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
        <div className="best-seller__products">
          {isLoading &&
            Array.from({ length: 3 }, (_, index) => (
              <BestSellerSkeleton key={`loading-${index}`} />
            ))}

          {!isLoading &&
            !error &&
            visibleProducts.map((product) => (
              <Link className="best-seller-card" to={`/products/${product.id}`} key={product.id}>
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

        <aside className="best-seller__statement">
          <p className="best-seller__eyebrow">BEST SELLERS</p>

          <h2 className="best-seller__title">
            TRUSTED
            <br />
            BY
            <br />
            ATHLETES
          </h2>

          <div className="best-seller__controls">
            <button
              type="button"
              onClick={movePrevious}
              disabled={isLoading || Boolean(error) || products.length <= 3}
              aria-label="이전 베스트셀러 보기"
            >
              ‹
            </button>

            <button
              type="button"
              onClick={moveNext}
              disabled={isLoading || Boolean(error) || products.length <= 3}
              aria-label="다음 베스트셀러 보기"
            >
              ›
            </button>
          </div>
        </aside>
      </div>
    </section>
  );
}

export default BestSellerSection;
