import { Link } from 'react-router-dom';

import '@/styles/trending.css';

function TrendingSkeleton() {
  return (
    <article className="trending-card trending-card--loading">
      <div className="trending-card__image-wrap">
        <div className="trending-card__placeholder" />
      </div>
    </article>
  );
}

function TrendingSection({ items = [], isLoading = false, error = null }) {
  const trendingItems = items.slice(0, 3);

  return (
    <section className="trending-section">
      <div className="trending-section__inner">
        <h2 className="trending-section__title">TRENDING NOW</h2>

        <div className="trending-section__grid">
          {isLoading &&
            Array.from({ length: 3 }, (_, index) => <TrendingSkeleton key={`loading-${index}`} />)}

          {!isLoading &&
            !error &&
            trendingItems.map((item) => {
              const destination =
                item.link ?? (item.productId ? `/products/${item.productId}` : '/products');

              return (
                <Link className="trending-card" to={destination} key={item.id}>
                  <div className="trending-card__image-wrap">
                    {item.imageUrl ? (
                      <img className="trending-card__image" src={item.imageUrl} alt={item.title} />
                    ) : (
                      <div className="trending-card__image-fallback">이미지가 없습니다.</div>
                    )}

                    <div className="trending-card__shade" />

                    <div className="trending-card__text">
                      {item.subtitle && <p>{item.subtitle}</p>}
                      <h3>{item.title}</h3>
                    </div>
                  </div>
                </Link>
              );
            })}

          {!isLoading && !error && trendingItems.length === 0 && (
            <div className="trending-section__empty">등록된 트렌딩 콘텐츠가 없습니다.</div>
          )}

          {!isLoading && error && (
            <div className="trending-section__error">
              <p>트렌딩 콘텐츠를 불러오지 못했습니다.</p>
              <span>잠시 후 다시 시도해주세요.</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default TrendingSection;
