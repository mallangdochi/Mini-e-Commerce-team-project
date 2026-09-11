import { Link } from 'react-router-dom';

import '@/styles/product-page.css';

const CATEGORY_NAV = [
  { label: 'OUTER', to: '/products?category=outer' },
  { label: 'TOP', to: '/products?category=top' },
  { label: 'BOTTOM', to: '/products?category=bottom' },
  { label: 'SETS', to: '/products?category=sets' },
  { label: 'SHOES', to: '/products?category=shoes' },
];

const ACTIVE_CATEGORY = 'TOP';

// TODO: 활성 필터는 쿼리스트링/상태에서. color 없으면 색 점 미표시
const ACTIVE_FILTERS = [
  { id: 'color-pink', label: '핑크', color: '#e8aeb7' },
  { id: 'price-1', label: '100,000~150,000원' },
];

const products = [
  {
    id: 1,
    name: 'LOVE YOU SO MUCH',
    category: 'LOVE YOU',
    price: '₩ 49,000',
    image: '/images/products/product01.jpg',
    colors: ['black', 'blue', null],
  },
  {
    id: 2,
    name: 'LOVE YOU SO MUCH',
    category: 'LOVE YOU',
    price: '₩ 40,000',
    image: '/images/products/product02.jpg',
    colors: ['black', 'blue', null],
  },
  {
    id: 3,
    name: 'LOVE YOU SO MUCH',
    category: 'LOVE YOU',
    price: '₩ 40,000',
    image: '/images/products/product03.jpg',
    colors: ['blue', null],
  },
  {
    id: 4,
    name: 'LOVE YOU SO MUCH',
    category: 'LOVE YOU',
    price: '₩ 40,000',
    image: '/images/products/product04.jpg',
    colors: ['black', 'blue', null],
  },
  {
    id: 5,
    name: 'LOVE YOU SO MUCH',
    category: 'LOVE YOU',
    price: '₩ 40,000',
    image: '',
    colors: ['black', 'blue', null],
  },
  {
    id: 6,
    name: 'LOVE YOU SO MUCH',
    category: 'LOVE YOU',
    price: '₩ 40,000',
    image: '',
    colors: ['black', 'blue', null],
  },
  {
    id: 7,
    name: 'LOVE YOU SO MUCH',
    category: 'LOVE YOU',
    price: '₩ 40,000',
    image: '',
    colors: ['black', 'blue', null],
  },
  {
    id: 8,
    name: 'LOVE YOU SO MUCH',
    category: 'LOVE YOU',
    price: '₩ 40,000',
    image: '',
    colors: ['black', 'blue', null],
  },
  {
    id: 9,
    name: 'LOVE YOU SO MUCH',
    category: 'LOVE YOU',
    price: '₩ 40,000',
    image: '/images/products/product09.jpg',
    colors: ['black', 'blue', null],
  },
  {
    id: 10,
    name: 'LOVE YOU SO MUCH',
    category: 'LOVE YOU',
    price: '₩ 40,000',
    image: '/images/products/product10.jpg',
    colors: ['black', 'blue', null],
  },
  {
    id: 11,
    name: 'LOVE YOU SO MUCH',
    category: 'LOVE YOU',
    price: '₩ 40,000',
    image: '/images/products/product11.jpg',
    colors: ['black', 'blue', null],
  },
  {
    id: 12,
    name: 'LOVE YOU SO MUCH',
    category: 'LOVE YOU',
    price: '₩ 40,000',
    image: '/images/products/product12.jpg',
    colors: ['black', 'blue', null],
  },
];

function IconChevronDown() {
  return (
    <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden="true">
      <path
        d="M2.75 4.13 5.5 6.88l2.75-2.75"
        stroke="#90959D"
        strokeWidth="1.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconFilter() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
      <path
        d="M1 3.75h13M3.5 7.5h8M6 11.25h3"
        stroke="#2B2F36"
        strokeWidth="1.0625"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconSearch() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
      <circle cx="6.5" cy="6.5" r="4.75" stroke="#90959D" strokeWidth="1.125" />
      <path d="M12.81 12.81 10 10" stroke="#90959D" strokeWidth="1.125" strokeLinecap="round" />
    </svg>
  );
}

function IconClose() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
      <path d="m1.5 1.5 7 7m0-7-7 7" stroke="#6B7078" strokeWidth="1.08" strokeLinecap="round" />
    </svg>
  );
}

function ColorSwatch({ color }) {
  if (!color) {
    return <span className="product-color product-color--empty" />;
  }
  return <span className={`product-color color-${color}`} />;
}

function FilterTag({ label, color }) {
  return (
    <span className="filter-tag">
      {color && <span className="filter-tag-dot" style={{ backgroundColor: color }} />}
      <span className="filter-tag-label">{label}</span>
      <button type="button" className="filter-tag-remove" aria-label={`${label} 필터 제거`}>
        <IconClose />
      </button>
    </span>
  );
}

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

      {/* 사이드바 + 본문 */}
      <div className="product-layout">
        <aside className="product-sidebar">
          <nav className="product-sidebar-nav" aria-label="카테고리">
            {CATEGORY_NAV.map((item) => {
              const active = item.label === ACTIVE_CATEGORY;
              return (
                <Link
                  key={item.label}
                  to={item.to}
                  className={`product-sidebar-link${active ? ' is-active' : ''}`}
                  aria-current={active ? 'page' : undefined}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <div className="product-main">
          {/* breadcrumb */}
          <nav className="product-breadcrumb" aria-label="위치">
            <span>WOMAN</span>
            <span className="product-breadcrumb-sep">›</span>
            <span className="is-current">TOPS</span>
          </nav>

          {/* 제목 */}
          <div className="category-heading">
            <h2>여성복</h2>
          </div>

          {/* 필터 바 */}
          <div className="product-filter-bar">
            <div className="product-filter-bar-left">
              <button type="button" className="filter-btn">
                <span>인기순</span>
                <IconChevronDown />
              </button>

              <button type="button" className="filter-btn">
                <IconFilter />
                <span>전체 필터</span>
                <span className="filter-btn-count">2</span>
              </button>
            </div>

            <div className="product-search-box">
              <IconSearch />
              <span>상품 검색</span>
            </div>
          </div>

          {/* 활성 필터 + 품절 제외 토글 */}
          <div className="product-active-filters">
            <div className="product-active-filters-list">
              {ACTIVE_FILTERS.map((f) => (
                <FilterTag key={f.id} label={f.label} color={f.color} />
              ))}
              <button type="button" className="product-filter-clear">
                전체 해제
              </button>
            </div>

            <label className="product-stock-toggle">
              <input type="checkbox" defaultChecked />
              <span className="product-stock-toggle-track" aria-hidden="true" />
              <span>품절 상품 지우기</span>
            </label>
          </div>

          {/* 상품 그리드 */}
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
                      {product.colors.map((color, i) => (
                        <ColorSwatch key={color ?? `empty-${i}`} color={color} />
                      ))}
                    </div>
                  </div>

                  <p className="product-card-category">{product.category}</p>

                  <strong className="product-card-price">{product.price}</strong>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

export default ProductPage;
