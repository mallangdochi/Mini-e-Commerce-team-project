import { Link } from 'react-router-dom';

import '@/styles/product-page.css';

const products = [
  {
    id: 1,
    name: 'LOVE YOU SO MUCH',
    category: 'LOVE YOU',
    price: '₩ 49,000',
    image: '/images/products/product01.jpg',
    colors: ['black', 'blue', 'white'],
  },
  {
    id: 2,
    name: 'LOVE YOU SO MUCH',
    category: 'LOVE YOU',
    price: '₩ 40,000',
    image: '/images/products/product02.jpg',
    colors: ['black', 'blue', 'white'],
  },
  {
    id: 3,
    name: 'LOVE YOU SO MUCH',
    category: 'LOVE YOU',
    price: '₩ 40,000',
    image: '/images/products/product03.jpg',
    colors: ['blue', 'white'],
  },
  {
    id: 4,
    name: 'LOVE YOU SO MUCH',
    category: 'LOVE YOU',
    price: '₩ 40,000',
    image: '/images/products/product04.jpg',
    colors: ['black', 'blue', 'white'],
  },

  {
    id: 5,
    name: 'LOVE YOU SO MUCH',
    category: 'LOVE YOU',
    price: '₩ 40,000',
    image: '',
    colors: ['black', 'blue', 'white'],
  },
  {
    id: 6,
    name: 'LOVE YOU SO MUCH',
    category: 'LOVE YOU',
    price: '₩ 40,000',
    image: '',
    colors: ['black', 'blue', 'white'],
  },
  {
    id: 7,
    name: 'LOVE YOU SO MUCH',
    category: 'LOVE YOU',
    price: '₩ 40,000',
    image: '',
    colors: ['black', 'blue', 'white'],
  },
  {
    id: 8,
    name: 'LOVE YOU SO MUCH',
    category: 'LOVE YOU',
    price: '₩ 40,000',
    image: '',
    colors: ['black', 'blue', 'white'],
  },

  {
    id: 9,
    name: 'LOVE YOU SO MUCH',
    category: 'LOVE YOU',
    price: '₩ 40,000',
    image: '/images/products/product09.jpg',
    colors: ['black', 'blue', 'white'],
  },
  {
    id: 10,
    name: 'LOVE YOU SO MUCH',
    category: 'LOVE YOU',
    price: '₩ 40,000',
    image: '/images/products/product10.jpg',
    colors: ['black', 'blue', 'white'],
  },
  {
    id: 11,
    name: 'LOVE YOU SO MUCH',
    category: 'LOVE YOU',
    price: '₩ 40,000',
    image: '/images/products/product11.jpg',
    colors: ['black', 'blue', 'white'],
  },
  {
    id: 12,
    name: 'LOVE YOU SO MUCH',
    category: 'LOVE YOU',
    price: '₩ 40,000',
    image: '/images/products/product12.jpg',
    colors: ['black', 'blue', 'white'],
  },
];

function ProductPage() {
  return (
    <main className="product-page">
      {/* 상단 배너 */}
      <section className="product-hero">
        <div className="product-hero-content">
          <span className="hero-small-text">NEW COLLECTION</span>

          <h1 className="hero-title">
            RELENTLESS
            <br />
            PURSUIT
          </h1>

          <Link to="/products" className="hero-link">
            SHOP NOW
            <span>→</span>
          </Link>
        </div>
      </section>

      {/* 상품 영역 */}
      <section className="product-section">
        <div className="category-heading">
          <span>의류 / 남성</span>
          <h2>남성복</h2>
        </div>

        <div className="product-section-header">
          <h3>BEST SELLERS</h3>

          <button type="button" className="view-all-button">
            VIEW ALL
            <span>→</span>
          </button>
        </div>

        <div className="product-grid">
          {products.map((product) => (
            <article className="product-card" key={product.id}>
              <Link to={`/products/${product.id}`} className="product-image-link">
                <div className="product-image">
                  {product.image ? (
                    <img src={product.image} alt={product.name} />
                  ) : (
                    <div className="product-image-placeholder" />
                  )}
                </div>
              </Link>

              <div className="product-card-info">
                <div className="product-card-top">
                  <h4>{product.name}</h4>

                  <div className="product-colors">
                    {product.colors.map((color) => (
                      <span key={color} className={`product-color color-${color}`} />
                    ))}
                  </div>
                </div>

                <p className="product-card-category">{product.category}</p>

                <strong className="product-card-price">{product.price}</strong>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

export default ProductPage;
