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

/* 필터 옵션 */
const COLOR_OPTIONS = [
  {
    name: 'Black',
    color: '#111111',
    count: 12,
  },
];

const SIZE_OPTIONS = [230, 235, 240, 245, 250, 255, 260, 265, 270, 275, 280];

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

function FilterTag({ label, color, onRemove }) {
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

      <button
        type="button"
        className="filter-tag-remove"
        aria-label={`${label} 필터 제거`}
        onClick={onRemove}
      >
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

  /* 필터에서 현재 선택 중인 값 */
  const [selectedColors, setSelectedColors] = useState([]);
  const [selectedMaterials, setSelectedMaterials] = useState([]);
  const [selectedSleeves, setSelectedSleeves] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);

  /* 가격 필터 */
  const PRICE_MIN = 34300;
  const PRICE_MAX = 59000;

  const [minPrice, setMinPrice] = useState(PRICE_MIN);
  const [maxPrice, setMaxPrice] = useState(PRICE_MAX);

  /* '적용하기'를 눌렀을 때 실제로 적용된 필터 */
  const [appliedFilters, setAppliedFilters] = useState({
    colors: [],
    materials: [],
    sleeves: [],
    sizes: [],
    minPrice: PRICE_MIN,
    maxPrice: PRICE_MAX,
  });

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

    setSelectedColors([]);
    setSelectedMaterials([]);
    setSelectedSleeves([]);
    setSelectedSizes([]);
    setMinPrice(PRICE_MIN);
    setMaxPrice(PRICE_MAX);

    setAppliedFilters({
      colors: [],
      materials: [],
      sleeves: [],
      sizes: [],
      minPrice: PRICE_MIN,
      maxPrice: PRICE_MAX,
    });
  };

  const applyFilters = () => {
    setAppliedFilters({
      colors: [...selectedColors],
      materials: [...selectedMaterials],
      sleeves: [...selectedSleeves],
      sizes: [...selectedSizes],
      minPrice,
      maxPrice,
    });

    setIsFilterOpen(false);
  };

  const removeActiveFilter = (filter) => {
    if (filter.type === 'color') {
      setSelectedColors((prev) => prev.filter((item) => item !== filter.value));

      setAppliedFilters((prev) => ({
        ...prev,
        colors: prev.colors.filter((item) => item !== filter.value),
      }));
    }

    if (filter.type === 'material') {
      setSelectedMaterials((prev) => prev.filter((item) => item !== filter.value));

      setAppliedFilters((prev) => ({
        ...prev,
        materials: prev.materials.filter((item) => item !== filter.value),
      }));
    }

    if (filter.type === 'sleeve') {
      setSelectedSleeves((prev) => prev.filter((item) => item !== filter.value));

      setAppliedFilters((prev) => ({
        ...prev,
        sleeves: prev.sleeves.filter((item) => item !== filter.value),
      }));
    }

    if (filter.type === 'size') {
      setSelectedSizes((prev) => prev.filter((item) => item !== filter.value));

      setAppliedFilters((prev) => ({
        ...prev,
        sizes: prev.sizes.filter((item) => item !== filter.value),
      }));
    }

    if (filter.type === 'price') {
      setMinPrice(PRICE_MIN);
      setMaxPrice(PRICE_MAX);

      setAppliedFilters((prev) => ({
        ...prev,
        minPrice: PRICE_MIN,
        maxPrice: PRICE_MAX,
      }));
    }
  };

  const activeFilters = [];

  appliedFilters.colors.forEach((colorName) => {
    const colorOption = COLOR_OPTIONS.find((color) => color.name === colorName);

    if (colorOption) {
      activeFilters.push({
        id: `color-${colorName}`,
        type: 'color',
        value: colorName,
        label: colorOption.name,
        color: colorOption.color,
      });
    }
  });

  appliedFilters.materials.forEach((material) => {
    activeFilters.push({
      id: `material-${material}`,
      type: 'material',
      value: material,
      label: material,
    });
  });

  appliedFilters.sleeves.forEach((sleeve) => {
    activeFilters.push({
      id: `sleeve-${sleeve}`,
      type: 'sleeve',
      value: sleeve,
      label: sleeve,
    });
  });

  appliedFilters.sizes.forEach((size) => {
    activeFilters.push({
      id: `size-${size}`,
      type: 'size',
      value: size,
      label: `${size}`,
    });
  });

  if (appliedFilters.minPrice !== PRICE_MIN || appliedFilters.maxPrice !== PRICE_MAX) {
    activeFilters.push({
      id: 'price',
      type: 'price',
      label: `${appliedFilters.minPrice.toLocaleString()}~${appliedFilters.maxPrice.toLocaleString()}원`,
    });
  }

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

                {activeFilters.length > 0 && (
                  <span className="filter-btn-count">{activeFilters.length}</span>
                )}
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
                    {/* 전체 선택 */}
                    <label className="filter-select-all">
                      <input
                        type="checkbox"
                        checked={
                          COLOR_OPTIONS.length > 0 && selectedColors.length === COLOR_OPTIONS.length
                        }
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedColors(COLOR_OPTIONS.map((color) => color.name));
                          } else {
                            setSelectedColors([]);
                          }
                        }}
                      />

                      <span>전체 선택</span>
                    </label>

                    {/* 컬러 목록 */}
                    <div className="color-filter-list">
                      {COLOR_OPTIONS.map((color) => {
                        const isSelected = selectedColors.includes(color.name);

                        return (
                          <label className="color-filter-item" key={color.name}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {
                                setSelectedColors((prev) =>
                                  prev.includes(color.name)
                                    ? prev.filter((item) => item !== color.name)
                                    : [...prev, color.name]
                                );
                              }}
                            />

                            <span
                              className="color-filter-swatch"
                              style={{
                                backgroundColor: color.color,
                              }}
                            />

                            <span className="color-filter-name">{color.name}</span>

                            <span className="color-filter-count">({color.count})</span>
                          </label>
                        );
                      })}
                    </div>
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
                    <input
                      type="checkbox"
                      checked={selectedMaterials.includes('코튼')}
                      onChange={() => {
                        setSelectedMaterials((prev) =>
                          prev.includes('코튼')
                            ? prev.filter((item) => item !== '코튼')
                            : [...prev, '코튼']
                        );
                      }}
                    />
                    <span className="custom-check" />
                    코튼
                  </label>

                  <label>
                    <input
                      type="checkbox"
                      checked={selectedMaterials.includes('폴리에스터')}
                      onChange={() => {
                        setSelectedMaterials((prev) =>
                          prev.includes('폴리에스터')
                            ? prev.filter((item) => item !== '폴리에스터')
                            : [...prev, '폴리에스터']
                        );
                      }}
                    />
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
                    <input
                      type="checkbox"
                      checked={selectedSleeves.includes('긴팔')}
                      onChange={() => {
                        setSelectedSleeves((prev) =>
                          prev.includes('긴팔')
                            ? prev.filter((item) => item !== '긴팔')
                            : [...prev, '긴팔']
                        );
                      }}
                    />
                    <span className="custom-check" />
                    긴팔
                  </label>

                  <label>
                    <input
                      type="checkbox"
                      checked={selectedSleeves.includes('반팔')}
                      onChange={() => {
                        setSelectedSleeves((prev) =>
                          prev.includes('반팔')
                            ? prev.filter((item) => item !== '반팔')
                            : [...prev, '반팔']
                        );
                      }}
                    />
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

                {/* 전체 선택 */}
                <label className="filter-select-all size-select-all">
                  <input
                    type="checkbox"
                    checked={
                      SIZE_OPTIONS.length > 0 && selectedSizes.length === SIZE_OPTIONS.length
                    }
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedSizes(SIZE_OPTIONS);
                      } else {
                        setSelectedSizes([]);
                      }
                    }}
                  />

                  <span>전체 선택</span>
                </label>

                <div className="shoe-size-grid">
                  {SIZE_OPTIONS.map((size) => {
                    const isSelected = selectedSizes.includes(size);

                    return (
                      <button
                        type="button"
                        key={size}
                        className={isSelected ? 'is-selected' : ''}
                        onClick={() => {
                          setSelectedSizes((prev) =>
                            prev.includes(size)
                              ? prev.filter((item) => item !== size)
                              : [...prev, size]
                          );
                        }}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </section>
            </form>

            {/* ================================
      적용 버튼
  ================================ */}

            <div className="filter-drawer-footer">
              <button type="button" className="filter-apply-btn" onClick={applyFilters}>
                적용하기
              </button>
            </div>
          </aside>
          {/* ================================
              활성 필터
          ================================ */}

          <div className="product-active-filters">
            <div className="product-active-filters-list">
              {activeFilters.map((filter) => (
                <FilterTag
                  key={filter.id}
                  label={filter.label}
                  color={filter.color}
                  onRemove={() => removeActiveFilter(filter)}
                />
              ))}

              {activeFilters.length > 0 && (
                <button type="button" className="product-filter-clear" onClick={resetFilters}>
                  전체 해제
                </button>
              )}
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
