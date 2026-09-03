import { Link } from 'react-router-dom';

import '@/styles/trending.css';

function TrendingSection({ items = [] }) {
  const trendingItems = items.slice(0, 3);

  return (
    <section className="trending-section">
      <div className="trending-section__inner">
        <h2 className="trending-section__title">TRENDING NOW</h2>

        <div className="trending-section__grid">
          {trendingItems.length > 0
            ? trendingItems.map((item) => {
                const destination =
                  item.link ?? (item.productId ? `/products/${item.productId}` : '/products');

                return (
                  <Link className="trending-card" to={destination} key={item.id}>
                    <div className="trending-card__image-wrap">
                      {item.imageUrl ? (
                        <img
                          className="trending-card__image"
                          src={item.imageUrl}
                          alt={item.title}
                        />
                      ) : (
                        <div className="trending-card__placeholder" />
                      )}

                      <div className="trending-card__shade" />

                      <div className="trending-card__text">
                        <p>{item.subtitle ?? 'ARC EDIT'}</p>
                        <h3>{item.title}</h3>
                      </div>
                    </div>
                  </Link>
                );
              })
            : Array.from({ length: 3 }, (_, index) => (
                <div className="trending-card trending-card--empty" key={index}>
                  <div className="trending-card__image-wrap">
                    <div className="trending-card__placeholder" />
                  </div>
                </div>
              ))}
        </div>
      </div>
    </section>
  );
}

export default TrendingSection;
