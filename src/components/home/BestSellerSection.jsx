import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import '@/styles/best-seller.css';

const fallbackProducts = [
  {
    id: 'fallback-1',
    name: 'abc 멜로시티 자켓',
    rating: 4.8,
    reviewText:
      '가볍게 걸치기 좋은 재킷입니다. 움직임이 편하고 일상과 운동 사이에서 자연스럽게 활용할 수 있습니다.',
  },
  {
    id: 'fallback-2',
    name: 'abc 멜로시티 자켓',
    rating: 4.8,
    reviewText:
      '신축성과 착용감이 좋아 다양한 트레이닝에 어울립니다. 깔끔한 실루엣과 기능적인 디테일을 함께 담았습니다.',
  },
  {
    id: 'fallback-3',
    name: 'abc 멜로시티 자켓',
    rating: 4.8,
    reviewText:
      '가벼운 러닝부터 데일리 웨어까지 활용할 수 있습니다. 편안한 착용감과 절제된 디자인이 특징입니다.',
  },
  {
    id: 'fallback-4',
    name: 'ARC 러닝 윈드 자켓',
    rating: 4.7,
    reviewText: '가벼운 소재와 안정적인 착용감으로 러닝과 야외 활동에 편안하게 활용할 수 있습니다.',
  },
  {
    id: 'fallback-5',
    name: 'ARC 트레이닝 셋업',
    rating: 4.9,
    reviewText: '움직임을 방해하지 않는 실루엣과 기능적인 소재를 조합한 트레이닝 셋업입니다.',
  },
  {
    id: 'fallback-6',
    name: 'ARC 데일리 재킷',
    rating: 4.8,
    reviewText: '운동 전후와 일상에서 자연스럽게 이어 입을 수 있는 가벼운 데일리 재킷입니다.',
  },
];

function StarRating({ rating = 0 }) {
  const roundedRating = Math.round(Number(rating));

  return (
    <div className="best-seller-card__rating">
      <div className="best-seller-card__stars" aria-label={`평점 ${rating}`}>
        {Array.from({ length: 5 }, (_, index) => (
          <span key={index}>{index < roundedRating ? '★' : '☆'}</span>
        ))}
      </div>
      <span className="best-seller-card__rating-number">{rating}</span>
    </div>
  );
}

function BestSellerSection({ products = [] }) {
  const sourceProducts = products.length > 0 ? products : fallbackProducts;
  const [startIndex, setStartIndex] = useState(0);

  const visibleProducts = useMemo(() => {
    if (sourceProducts.length <= 3) {
      return sourceProducts;
    }

    return Array.from({ length: 3 }, (_, offset) => {
      const index = (startIndex + offset) % sourceProducts.length;
      return sourceProducts[index];
    });
  }, [sourceProducts, startIndex]);

  const movePrevious = () => {
    if (sourceProducts.length <= 3) {
      return;
    }

    setStartIndex((current) => (current === 0 ? sourceProducts.length - 1 : current - 1));
  };

  const moveNext = () => {
    if (sourceProducts.length <= 3) {
      return;
    }

    setStartIndex((current) => (current + 1) % sourceProducts.length);
  };

  return (
    <section className="best-seller">
      <div className="best-seller__background-text" aria-hidden="true">
        PRODUCT
      </div>

      <div className="best-seller__inner">
        <div className="best-seller__products">
          {visibleProducts.map((product, index) => {
            const isFallback = String(product.id).startsWith('fallback-');

            const content = (
              <>
                <div className="best-seller-card__image-wrap">
                  {product.imageUrl ? (
                    <img
                      className="best-seller-card__image"
                      src={product.imageUrl}
                      alt={product.name}
                    />
                  ) : (
                    <div className="best-seller-card__placeholder" />
                  )}
                </div>

                <div className="best-seller-card__content">
                  <h3 className="best-seller-card__name">{product.name}</h3>
                  <StarRating rating={product.rating ?? 0} />
                  <p className="best-seller-card__review">
                    {product.reviewText ?? product.description ?? ''}
                  </p>
                </div>
              </>
            );

            if (isFallback) {
              return (
                <article className="best-seller-card" key={`${product.id}-${startIndex}-${index}`}>
                  {content}
                </article>
              );
            }

            return (
              <Link
                className="best-seller-card"
                to={`/products/${product.id}`}
                key={`${product.id}-${startIndex}-${index}`}
              >
                {content}
              </Link>
            );
          })}
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
              disabled={sourceProducts.length <= 3}
              aria-label="이전 베스트셀러 보기"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={moveNext}
              disabled={sourceProducts.length <= 3}
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
