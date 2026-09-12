import { useEffect, useRef, useState } from 'react';
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

const ACTIVE_FILTERS = [
  {
    id: 'color-pink',
    label: '핑크',
    color: '#e8aeb7',
  },
  {
    id: 'price-1',
    label: '100,000~150,000원',
  },
];

/* ================================
   테스트용 상품 
================================ */

const PRODUCT_IMAGES = [
  '/images/products/product01.jpg',
  '/images/products/product02.jpg',
  '/images/products/product03.jpg',
  '/images/products/product04.jpg',
  '/images/products/product09.jpg',
  '/images/products/product10.jpg',
  '/images/products/product11.jpg',
  '/images/products/product12.jpg',
];

const products = Array.from({ length: 30 }, (_, index) => {
  const id = index + 1;

  return {
    id,
    name: `LOVE YOU SO MUCH ${id}`,
    category: 'LOVE YOU',
    price: id === 1 ? '₩ 49,000' : '₩ 40,000',

    image: PRODUCT_IMAGES[index % PRODUCT_IMAGES.length],

    colors: id % 3 === 0 ? ['blue', null] : ['black', 'blue', null],
  };
});

/* 처음에는 4개씩 추가 */
const PRODUCTS_PER_LOAD = 4;

/* ================================
   아이콘
================================ */

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

/* ================================
   컬러
================================ */

function ColorSwatch({ color }) {
  if (!color) {
    return <span className="product-color product-color--empty" />;
  }

  return <span className={`product-color color-${color}`} />;
}

/* ================================
   필터 태그
================================ */

function FilterTag({ label, color }) {
  return (
    <span className="filter-tag">
      {color && (
        <span
          className="filter-tag-dot"
          style={{
            backgroundColor: color,
          }}
        />
      )}

      <span className="filter-tag-label">{label}</span>

      <button type="button" className="filter-tag-remove" aria-label={`${label} 필터 제거`}>
        <IconClose />
      </button>
    </span>
  );
}

/* ================================
   Product Page
================================ */

function ProductPage() {
  /* 필터 열림 / 닫힘 */
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [isColorOpen, setIsColorOpen] = useState(true);

  /* 가격 필터 */
  const PRICE_MIN = 34300;
  const PRICE_MAX = 59000;

  const [minPrice, setMinPrice] = useState(PRICE_MIN);
  const [maxPrice, setMaxPrice] = useState(PRICE_MAX);

  /* 현재 몇 개까지 보여줄지 */
  const [visibleCount, setVisibleCount] = useState(PRODUCTS_PER_LOAD);

  /* 무한스크롤 감지 DIV */
  const loadMoreRef = useRef(null);

  /* 현재 보여주는 상품 */
  const visibleProducts = products.slice(0, visibleCount);

  /* 아직 불러올 상품이 남았는지 */
  const hasMore = visibleCount < products.length;

  /* 정렬 메뉴 */
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [sortType, setSortType] = useState('인기순');

  const SORT_OPTIONS = ['인기순', '신상품', '낮은 가격순', '높은 가격순'];

  const filterFormRef = useRef(null);

  const resetFilters = () => {
    filterFormRef.current?.reset();

    setMinPrice(PRICE_MIN);
    setMaxPrice(PRICE_MAX);
  };

  /* ================================
     무한 스크롤
  ================================ */

  useEffect(() => {
    const target = loadMoreRef.current;

    if (!target) {
      return;
    }

    if (!hasMore) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          return;
        }

        setVisibleCount((prev) => {
          return Math.min(prev + PRODUCTS_PER_LOAD, products.length);
        });
      },
      {
        root: null,

        /*
            화면 끝까지 정확히 내려가기 전에
            다음 상품을 미리 추가
          */
        rootMargin: '150px 0px',

        threshold: 0,
      }
    );

    observer.observe(target);

    return () => {
      observer.disconnect();
    };
  }, [visibleCount, hasMore]);

  return (
    <main className="product-page">
      {/* ================================
          상단 배너
      ================================ */}

      <section className="product-hero">
        <div className="product-hero-content">
          <span className="hero-small-text">NEW COLLECTION</span>

          <h1 className="hero-title">
            RELENTLESS
            <br />
            PURSUIT
          </h1>
        </div>
      </section>

      {/* ================================
          사이드바 + 상품
      ================================ */}

      <div className="product-layout">
        {/* 사이드바 */}

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

        {/* ================================
            본문
        ================================ */}

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

          {/* ================================
              필터
          ================================ */}

          <div className="product-filter-bar">
            <div className="product-filter-bar-left">
              <div className="product-sort">
                <button
                  type="button"
                  className={`filter-btn product-sort-btn ${isSortOpen ? 'is-open' : ''}`}
                  onClick={() => setIsSortOpen((prev) => !prev)}
                  aria-expanded={isSortOpen}
                >
                  <span>{sortType}</span>

                  <IconChevronDown />
                </button>

                {isSortOpen && (
                  <div className="product-sort-menu">
                    {SORT_OPTIONS.map((option) => (
                      <button
                        type="button"
                        key={option}
                        className={`product-sort-option ${sortType === option ? 'is-active' : ''}`}
                        onClick={() => {
                          setSortType(option);
                          setIsSortOpen(false);
                        }}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button type="button" className="filter-btn" onClick={() => setIsFilterOpen(true)}>
                <IconFilter />

                <span>전체 필터</span>

                <span className="filter-btn-count">2</span>
              </button>
            </div>

            {/* 검색 */}

            <div className="product-search-box">
              <IconSearch />

              <span>상품 검색</span>
            </div>
          </div>

          {/* ================================
    오른쪽 전체 필터
================================ */}

          <div
            className={`filter-overlay ${isFilterOpen ? 'is-open' : ''}`}
            onClick={() => setIsFilterOpen(false)}
          />

          <aside className={`filter-drawer ${isFilterOpen ? 'is-open' : ''}`}>
            {/* ================================
      필터 헤더
  ================================ */}

            <div className="filter-drawer-header">
              <h2>전체 필터</h2>

              <div className="filter-drawer-header-actions">
                <button type="button" className="filter-reset-btn" onClick={resetFilters}>
                  초기화
                </button>

                <button
                  type="button"
                  className="filter-close-btn"
                  aria-label="필터 닫기"
                  onClick={() => setIsFilterOpen(false)}
                >
                  <IconClose />
                </button>
              </div>
            </div>

            {/* ================================
      필터 본문
  ================================ */}

            <form
              ref={filterFormRef}
              className="filter-drawer-body"
              onSubmit={(e) => e.preventDefault()}
            >
              {/* ================================
        컬러
    ================================ */}

              <section
                className={`filter-section color-filter-section ${
                  !isColorOpen ? 'is-collapsed' : ''
                }`}
              >
                <div className="filter-section-header">
                  <h3>컬러</h3>

                  <button
                    type="button"
                    className={`filter-section-toggle ${isColorOpen ? 'is-open' : ''}`}
                    onClick={() => setIsColorOpen((prev) => !prev)}
                    aria-expanded={isColorOpen}
                    aria-label="컬러 필터 열기/닫기"
                  >
                    <IconChevronDown />
                  </button>
                </div>

                {isColorOpen && (
                  <div className="filter-section-content">
                    <label className="color-filter-item">
                      <input type="checkbox" />

                      <span
                        className="color-filter-swatch"
                        style={{ backgroundColor: '#111111' }}
                      />

                      <span className="color-filter-name">Black</span>

                      <span className="color-filter-count">(12)</span>
                    </label>
                  </div>
                )}
              </section>

              {/* ================================
        소재
    ================================ */}

              <section className="filter-section">
                <h3>소재</h3>

                <div className="filter-check-list">
                  <label>
                    <input type="checkbox" />
                    <span className="custom-check" />
                    코튼
                  </label>

                  <label>
                    <input type="checkbox" />
                    <span className="custom-check" />
                    폴리에스터
                  </label>
                </div>
              </section>

              {/* ================================
        긴팔 / 반팔
    ================================ */}

              <section className="filter-section">
                <h3>긴팔 / 반팔</h3>

                <div className="filter-check-list">
                  <label>
                    <input type="checkbox" />
                    <span className="custom-check" />
                    긴팔
                  </label>

                  <label>
                    <input type="checkbox" />
                    <span className="custom-check" />
                    반팔
                  </label>
                </div>
              </section>

              {/* ================================
        가격
    ================================ */}

              <section className="filter-section filter-price-section">
                <div className="price-section-header">
                  <h3>가격</h3>
                </div>

                <div
                  className="price-range"
                  style={{
                    '--min-position': `${
                      ((minPrice - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100
                    }%`,

                    '--max-position': `${
                      ((maxPrice - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100
                    }%`,
                  }}
                >
                  <div className="price-range-track" />

                  <input
                    type="range"
                    className="price-range-input price-range-min"
                    min={PRICE_MIN}
                    max={PRICE_MAX}
                    step="100"
                    value={minPrice}
                    onChange={(e) => {
                      const value = Math.min(Number(e.target.value), maxPrice - 100);

                      setMinPrice(value);
                    }}
                  />

                  <input
                    type="range"
                    className="price-range-input price-range-max"
                    min={PRICE_MIN}
                    max={PRICE_MAX}
                    step="100"
                    value={maxPrice}
                    onChange={(e) => {
                      const value = Math.max(Number(e.target.value), minPrice + 100);

                      setMaxPrice(value);
                    }}
                  />
                </div>

                <div className="price-range-values">
                  <span>{minPrice.toLocaleString()} 원</span>

                  <span>{maxPrice.toLocaleString()} 원</span>
                </div>

                <div className="price-inputs">
                  <label>
                    <strong>낮은 가격 (KRW)</strong>

                    <input
                      type="number"
                      value={minPrice}
                      onChange={(e) => {
                        const value = Number(e.target.value);

                        setMinPrice(Math.max(PRICE_MIN, Math.min(value, maxPrice - 100)));
                      }}
                    />
                  </label>

                  <label>
                    <strong>높은 가격 (KRW)</strong>

                    <input
                      type="number"
                      value={maxPrice}
                      onChange={(e) => {
                        const value = Number(e.target.value);

                        setMaxPrice(Math.min(PRICE_MAX, Math.max(value, minPrice + 100)));
                      }}
                    />
                  </label>
                </div>
              </section>

              {/* ================================
        사이즈
    ================================ */}

              <section className="filter-section">
                <h3>사이즈</h3>

                <div className="shoe-size-grid">
                  {[230, 235, 240, 245, 250, 255, 260, 265, 270, 275, 280].map((size) => (
                    <button type="button" key={size}>
                      {size}
                    </button>
                  ))}
                </div>
              </section>
            </form>

            {/* ================================
      적용 버튼
  ================================ */}

            <div className="filter-drawer-footer">
              <button
                type="button"
                className="filter-apply-btn"
                onClick={() => setIsFilterOpen(false)}
              >
                적용하기
              </button>
            </div>
          </aside>
          {/* ================================
              활성 필터
          ================================ */}

          <div className="product-active-filters">
            <div className="product-active-filters-list">
              {ACTIVE_FILTERS.map((filter) => (
                <FilterTag key={filter.id} label={filter.label} color={filter.color} />
              ))}

              <button type="button" className="product-filter-clear">
                전체 해제
              </button>
            </div>

            {/* 품절 제외 */}

            <label className="product-stock-toggle">
              <input type="checkbox" defaultChecked />

              <span className="product-stock-toggle-track" aria-hidden="true" />
              <span>품절 제외</span>
            </label>
          </div>

          {/* ================================
              상품 그리드
          ================================ */}

          <div className="product-grid">
            {visibleProducts.map((product) => (
              <article className="product-card" key={product.id}>
                {/* 이미지 */}

                <Link to={`/products/${product.id}`} className="product-image-link">
                  <div className="product-image">
                    {product.image ? (
                      <img src={product.image} alt={product.name} />
                    ) : (
                      <div className="product-image-placeholder" />
                    )}
                  </div>
                </Link>

                {/* 상품 정보 */}

                <div className="product-card-info">
                  <div className="product-card-top">
                    <h4>{product.name}</h4>

                    <div className="product-colors">
                      {product.colors.map((color, index) => (
                        <ColorSwatch key={color ?? `empty-${index}`} color={color} />
                      ))}
                    </div>
                  </div>

                  <p className="product-card-category">{product.category}</p>

                  <strong className="product-card-price">{product.price}</strong>
                </div>
              </article>
            ))}
          </div>

          {/* ================================
              무한스크롤 감지 영역
          ================================ */}

          {hasMore && (
            <div ref={loadMoreRef} className="product-scroll-trigger">
              <span>상품 불러오는 중...</span>
            </div>
          )}

          {/* ================================
              끝
          ================================ */}

          {!hasMore && <div className="product-scroll-end">모든 상품을 불러왔습니다.</div>}
        </div>
      </div>
    </main>
  );
}

export default ProductPage;
