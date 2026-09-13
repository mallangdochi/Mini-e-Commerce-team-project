import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import { getProductFilters, getProducts, getSets } from '@/api/products';
import '@/styles/product-page.css';

const CATEGORY_NAV = [
  { label: 'OUTER', to: '/products?category=outer', value: 'outer' },
  { label: 'TOP', to: '/products?category=top', value: 'top' },
  { label: 'BOTTOM', to: '/products?category=bottom', value: 'bottom' },
  { label: 'SETS', to: '/products?category=sets', value: 'sets' },
  { label: 'SHOES', to: '/products?category=shoes', value: 'shoes' },
];

const CATEGORY_CONFIG = {
  outer: {
    categoryId: 'outer',
    subCategoryId: null,
    label: 'OUTER',
    sidebarValue: 'outer',
  },
  jacket: {
    categoryId: 'outer',
    subCategoryId: 'jacket',
    label: 'JACKET',
    sidebarValue: 'outer',
  },
  windbreaker: {
    categoryId: 'outer',
    subCategoryId: 'windbreaker',
    label: 'WINDBREAKER',
    sidebarValue: 'outer',
  },
  top: {
    categoryId: 'top',
    subCategoryId: null,
    label: 'TOP',
    sidebarValue: 'top',
  },
  tshirt: {
    categoryId: 'top',
    subCategoryId: 'tshirt',
    label: 'T-SHIRT',
    sidebarValue: 'top',
  },
  'long-sleeve': {
    categoryId: 'top',
    subCategoryId: 'tshirt',
    label: 'TOP',
    sidebarValue: 'top',
  },
  'hoodie-sweat': {
    categoryId: 'top',
    subCategoryId: null,
    label: 'TOP',
    sidebarValue: 'top',
  },
  bottom: {
    categoryId: 'bottom',
    subCategoryId: null,
    label: 'BOTTOM',
    sidebarValue: 'bottom',
  },
  pants: {
    categoryId: 'bottom',
    subCategoryId: 'pants',
    label: 'PANTS',
    sidebarValue: 'bottom',
  },
  shorts: {
    categoryId: 'bottom',
    subCategoryId: 'shorts',
    label: 'SHORTS',
    sidebarValue: 'bottom',
  },
  shoes: {
    categoryId: 'shoes',
    subCategoryId: null,
    label: 'SHOES',
    sidebarValue: 'shoes',
  },
  'running-shoes': {
    categoryId: 'shoes',
    subCategoryId: 'running',
    label: 'RUNNING',
    sidebarValue: 'shoes',
  },
  'training-shoes': {
    categoryId: 'shoes',
    subCategoryId: 'training',
    label: 'TRAINING',
    sidebarValue: 'shoes',
  },
  sets: {
    categoryId: 'sets',
    subCategoryId: null,
    label: 'SETS',
    sidebarValue: 'sets',
  },
  accessories: {
    categoryId: 'accessories',
    subCategoryId: null,
    label: 'ACCESSORIES',
    sidebarValue: null,
  },
  sunglasses: {
    categoryId: 'accessories',
    subCategoryId: 'sunglasses',
    label: 'SUNGLASSES',
    sidebarValue: null,
  },
  cap: {
    categoryId: 'accessories',
    subCategoryId: 'hat',
    label: 'HAT',
    sidebarValue: null,
  },
  hat: {
    categoryId: 'accessories',
    subCategoryId: 'hat',
    label: 'HAT',
    sidebarValue: null,
  },
};

/* ================================
   테스트용 상품 
================================ */

const SORT_OPTIONS = [
  { label: '인기순', value: 'popular' },
  { label: '신상품', value: 'new' },
  { label: '낮은 가격순', value: 'priceAsc' },
  { label: '높은 가격순', value: 'priceDesc' },
];

const COLOR_MAP = {
  black: '#111111',
  white: '#ffffff',
  gray: '#9ca3af',
  navy: '#1f2a44',
  blue: '#5875bf',
  green: '#657a5a',
  khaki: '#7b8062',
  brown: '#7a5541',
  beige: '#d8c6a5',
  pink: '#e8aeb7',
  red: '#b94b4b',
  orange: '#d98245',
  yellow: '#d6b74c',
  purple: '#80649a',
  silver: '#c3c7cc',
};

const COLOR_LABELS = {
  black: '블랙',
  white: '화이트',
  gray: '그레이',
  navy: '네이비',
  blue: '블루',
  green: '그린',
  khaki: '카키',
  brown: '브라운',
  beige: '베이지',
  pink: '핑크',
  red: '레드',
  orange: '오렌지',
  yellow: '옐로우',
  purple: '퍼플',
  silver: '실버',
};

/* 처음에는 4개씩 추가 */
const PRODUCTS_PER_LOAD = 4;

const PRICE_MIN = 0;
const PRICE_MAX = 300000;

const EMPTY_APPLIED_FILTERS = {
  color: null,
  size: null,
  lengthType: null,
  minPrice: null,
  maxPrice: null,
};

const LENGTH_LABELS = {
  long: '롱',
  short: '숏',
};

function normalizeColorOption(color) {
  if (typeof color === 'string') {
    return {
      value: color,
      label: COLOR_LABELS[color] ?? color,
      filterGroup: color,
    };
  }

  return color;
}

function toggleSingleValue(currentValue, nextValue) {
  if (currentValue === nextValue) {
    return null;
  }

  return nextValue;
}

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
  const [searchParams] = useSearchParams();

  const categoryParam = searchParams.get('categoryId') ?? searchParams.get('category') ?? 'top';

  const gender = searchParams.get('gender') ?? 'women';

  const activeCategory = CATEGORY_CONFIG[categoryParam] ?? CATEGORY_CONFIG.top;

  /* 필터 열림 / 닫힘 */
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [isColorOpen, setIsColorOpen] = useState(true);

  /* 가격 필터 */
  const [minPrice, setMinPrice] = useState(PRICE_MIN);
  const [maxPrice, setMaxPrice] = useState(PRICE_MAX);

  const [filterOptions, setFilterOptions] = useState({
    colors: [],
    sizes: [],
    lengthTypes: [],
  });

  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedLengthType, setSelectedLengthType] = useState(null);

  const [appliedFilters, setAppliedFilters] = useState(EMPTY_APPLIED_FILTERS);

  /* 현재 몇 개까지 보여줄지 */
  const [page, setPage] = useState(1);

  /* 무한스크롤 감지 DIV */
  const loadMoreRef = useRef(null);
  const requestIdRef = useRef(0);
  const requestInFlightRef = useRef(false);
  const filterRequestIdRef = useRef(0);

  /* 현재 보여주는 상품 */
  const [productItems, setProductItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState('');

  /* 아직 불러올 상품이 남았는지 */
  const [hasMore, setHasMore] = useState(true);

  /* 정렬 메뉴 */
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [sortType, setSortType] = useState('popular');

  const [excludeSoldOut, setExcludeSoldOut] = useState(true);

  const resetFilters = () => {
    setSelectedColor(null);
    setSelectedSize(null);
    setSelectedLengthType(null);

    setMinPrice(PRICE_MIN);
    setMaxPrice(PRICE_MAX);

    setAppliedFilters(EMPTY_APPLIED_FILTERS);
  };

  const applyFilters = () => {
    const hasPriceFilter = minPrice !== PRICE_MIN || maxPrice !== PRICE_MAX;

    setAppliedFilters({
      color: selectedColor,
      size: selectedSize,
      lengthType: selectedLengthType,
      minPrice: hasPriceFilter ? minPrice : null,
      maxPrice: hasPriceFilter ? maxPrice : null,
    });

    setIsFilterOpen(false);
  };

  const clearAllFilters = () => {
    resetFilters();
  };

  const removeAppliedFilter = (type) => {
    if (type === 'color') {
      setSelectedColor(null);

      setAppliedFilters((prev) => ({
        ...prev,
        color: null,
      }));

      return;
    }

    if (type === 'size') {
      setSelectedSize(null);

      setAppliedFilters((prev) => ({
        ...prev,
        size: null,
      }));

      return;
    }

    if (type === 'lengthType') {
      setSelectedLengthType(null);

      setAppliedFilters((prev) => ({
        ...prev,
        lengthType: null,
      }));

      return;
    }

    if (type === 'price') {
      setMinPrice(PRICE_MIN);
      setMaxPrice(PRICE_MAX);

      setAppliedFilters((prev) => ({
        ...prev,
        minPrice: null,
        maxPrice: null,
      }));
    }
  };

  useEffect(() => {
    const requestId = filterRequestIdRef.current + 1;

    filterRequestIdRef.current = requestId;

    const fetchFilterOptions = async () => {
      if (activeCategory.categoryId === 'sets' && gender === 'men') {
        setFilterOptions({
          colors: [],
          sizes: [],
          lengthTypes: [],
        });

        setMinPrice(PRICE_MIN);
        setMaxPrice(PRICE_MAX);
        setSelectedColor(null);
        setSelectedSize(null);
        setSelectedLengthType(null);
        setAppliedFilters(EMPTY_APPLIED_FILTERS);

        return;
      }

      try {
        const params = {
          categoryId: activeCategory.categoryId,
          gender,
        };

        if (activeCategory.subCategoryId) {
          params.subCategoryId = activeCategory.subCategoryId;
        }

        const response = await getProductFilters(params);

        if (requestId !== filterRequestIdRef.current) {
          return;
        }

        const data = response?.data ?? {};

        const colors = (data.colors ?? []).map(normalizeColorOption);

        const sizes = (data.sizes ?? []).map((size) => String(size));

        const lengthTypes = (data.lengthTypes ?? []).map((type) => String(type));

        setFilterOptions({
          colors,
          sizes,
          lengthTypes,
        });

        setMinPrice(PRICE_MIN);
        setMaxPrice(PRICE_MAX);

        setSelectedColor(null);
        setSelectedSize(null);
        setSelectedLengthType(null);

        setAppliedFilters(EMPTY_APPLIED_FILTERS);
      } catch {
        if (requestId !== filterRequestIdRef.current) {
          return;
        }

        setFilterOptions({
          colors: [],
          sizes: [],
          lengthTypes: [],
        });

        setMinPrice(PRICE_MIN);
        setMaxPrice(PRICE_MAX);

        setSelectedColor(null);
        setSelectedSize(null);
        setSelectedLengthType(null);

        setAppliedFilters(EMPTY_APPLIED_FILTERS);
      }
    };

    fetchFilterOptions();
  }, [activeCategory.categoryId, activeCategory.subCategoryId, gender]);

  const fetchProductsPage = useCallback(
    async (targetPage, replace = false) => {
      const requestId = requestIdRef.current + 1;

      requestIdRef.current = requestId;
      requestInFlightRef.current = true;

      if (activeCategory.categoryId === 'sets' && gender === 'men') {
        if (replace) {
          setPage(1);
        }

        setProductItems([]);
        setHasMore(false);
        setLoadError('');
        setIsLoading(false);
        requestInFlightRef.current = false;

        return;
      }

      try {
        setIsLoading(true);
        setLoadError('');

        const params = {
          gender,
          sort: sortType,
          page: targetPage,
          limit: PRODUCTS_PER_LOAD,
        };

        if (activeCategory.subCategoryId) {
          params.subCategoryId = activeCategory.subCategoryId;
        }

        if (appliedFilters.color) {
          params.color = appliedFilters.color;
        }

        if (appliedFilters.size) {
          params.size = appliedFilters.size;
        }

        if (appliedFilters.lengthType) {
          params.lengthType = appliedFilters.lengthType;
        }

        if (appliedFilters.minPrice !== null) {
          params.minPrice = appliedFilters.minPrice;
        }

        if (appliedFilters.maxPrice !== null) {
          params.maxPrice = appliedFilters.maxPrice;
        }

        const response =
          activeCategory.categoryId === 'sets'
            ? await getSets(params)
            : await getProducts({
                ...params,
                categoryId: activeCategory.categoryId,
              });

        if (requestId !== requestIdRef.current) {
          return;
        }

        const data = response?.data ?? {};

        const nextProducts = data.products ?? data.sets ?? [];

        const pagination = data.pagination ?? data.pageInfo ?? {};

        if (replace) {
          setPage(1);
        }

        setProductItems((prev) => {
          if (replace) {
            return nextProducts;
          }

          const existingIds = new Set(prev.map((product) => product.productId));

          return [
            ...prev,
            ...nextProducts.filter((product) => !existingIds.has(product.productId)),
          ];
        });

        if (typeof pagination.hasNextPage === 'boolean') {
          setHasMore(pagination.hasNextPage);
        } else {
          setHasMore(nextProducts.length === PRODUCTS_PER_LOAD);
        }
      } catch {
        if (requestId !== requestIdRef.current) {
          return;
        }

        setLoadError('상품 정보를 불러오지 못했습니다.');

        setHasMore(false);
      } finally {
        if (requestId === requestIdRef.current) {
          requestInFlightRef.current = false;
          setIsLoading(false);
        }
      }
    },
    [activeCategory.categoryId, activeCategory.subCategoryId, appliedFilters, gender, sortType]
  );

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      fetchProductsPage(1, true);
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [fetchProductsPage]);

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

        if (requestInFlightRef.current) {
          return;
        }

        const nextPage = page + 1;

        setPage(nextPage);
        fetchProductsPage(nextPage);
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
  }, [fetchProductsPage, hasMore, page]);

  const activeFilterTags = [
    ...(appliedFilters.color
      ? [
          {
            id: `color-${appliedFilters.color}`,
            type: 'color',
            label:
              filterOptions.colors.find((item) => item.filterGroup === appliedFilters.color)
                ?.label ?? appliedFilters.color,
            color: COLOR_MAP[appliedFilters.color] ?? '#d9d9d9',
          },
        ]
      : []),

    ...(appliedFilters.size
      ? [
          {
            id: `size-${appliedFilters.size}`,
            type: 'size',
            label: appliedFilters.size,
          },
        ]
      : []),

    ...(appliedFilters.lengthType
      ? [
          {
            id: `length-${appliedFilters.lengthType}`,
            type: 'lengthType',
            label: LENGTH_LABELS[appliedFilters.lengthType] ?? appliedFilters.lengthType,
          },
        ]
      : []),

    ...(appliedFilters.minPrice !== null || appliedFilters.maxPrice !== null
      ? [
          {
            id: 'price',
            type: 'price',
            label: `${Number(appliedFilters.minPrice ?? PRICE_MIN).toLocaleString()}~${Number(
              appliedFilters.maxPrice ?? PRICE_MAX
            ).toLocaleString()}원`,
          },
        ]
      : []),
  ];

  const displayedProducts = excludeSoldOut
    ? productItems.filter((product) => !product.isSoldOut)
    : productItems;

  const priceRangeSpan = PRICE_MAX - PRICE_MIN;

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
              const active = item.value === activeCategory.sidebarValue;

              return (
                <Link
                  key={item.label}
                  to={`${item.to}&gender=${gender}`}
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
            <span>{gender.toUpperCase()}</span>

            <span className="product-breadcrumb-sep">›</span>

            <span className="is-current">{activeCategory.label}</span>
          </nav>

          {/* 제목 */}

          <div className="mobile-category-row">
            <div className="category-heading">
              <h2>{gender === 'men' ? '남성복' : '여성복'}</h2>
            </div>

            <div className="mobile-category-actions" />
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
                  <span>{SORT_OPTIONS.find((option) => option.value === sortType)?.label}</span>

                  <IconChevronDown />
                </button>

                {isSortOpen && (
                  <div className="product-sort-menu">
                    {SORT_OPTIONS.map((option) => (
                      <button
                        type="button"
                        key={option.value}
                        className={`product-sort-option ${
                          sortType === option.value ? 'is-active' : ''
                        }`}
                        onClick={() => {
                          setSortType(option.value);
                          setIsSortOpen(false);
                        }}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button type="button" className="filter-btn" onClick={() => setIsFilterOpen(true)}>
                <IconFilter />

                <span>전체 필터</span>

                {activeFilterTags.length > 0 && (
                  <span className="filter-btn-count">{activeFilterTags.length}</span>
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

            <form className="filter-drawer-body" onSubmit={(e) => e.preventDefault()}>
              {/* ================================
        컬러
    ================================ */}

              {filterOptions.colors.length > 0 && (
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
                      {filterOptions.colors.map((color) => {
                        const value = color.filterGroup;

                        const checked = selectedColor === value;

                        const backgroundColor = COLOR_MAP[value] ?? '#d9d9d9';

                        return (
                          <label className="color-filter-item" key={value}>
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => {
                                setSelectedColor((prev) => toggleSingleValue(prev, value));
                              }}
                            />

                            <span
                              className="color-filter-swatch"
                              style={{
                                backgroundColor,
                                border: value === 'white' ? '1px solid #d1d1d1' : undefined,
                              }}
                            />

                            <span className="color-filter-name">{color.label}</span>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </section>
              )}

              {/* ================================
        소재
    ================================ */}

              {/* ================================
        긴팔 / 반팔
    ================================ */}

              {activeCategory.categoryId === 'bottom' && filterOptions.lengthTypes.length > 0 && (
                <section className="filter-section">
                  <h3>길이</h3>

                  <div className="filter-check-list">
                    {filterOptions.lengthTypes.map((lengthType) => (
                      <label key={lengthType}>
                        <input
                          type="checkbox"
                          checked={selectedLengthType === lengthType}
                          onChange={() => {
                            setSelectedLengthType((prev) => toggleSingleValue(prev, lengthType));
                          }}
                        />

                        <span className="custom-check" />

                        {LENGTH_LABELS[lengthType] ?? lengthType}
                      </label>
                    ))}
                  </div>
                </section>
              )}

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
                    '--min-position': `${((minPrice - PRICE_MIN) / priceRangeSpan) * 100}%`,

                    '--max-position': `${((maxPrice - PRICE_MIN) / priceRangeSpan) * 100}%`,
                  }}
                >
                  <div className="price-range-track" />

                  <input
                    type="range"
                    className="price-range-input price-range-min"
                    min={PRICE_MIN}
                    max={PRICE_MAX}
                    step="1000"
                    value={minPrice}
                    onChange={(e) => {
                      const value = Math.min(Number(e.target.value), maxPrice - 1000);

                      setMinPrice(Math.max(PRICE_MIN, value));
                    }}
                  />

                  <input
                    type="range"
                    className="price-range-input price-range-max"
                    min={PRICE_MIN}
                    max={PRICE_MAX}
                    step="1000"
                    value={maxPrice}
                    onChange={(e) => {
                      const value = Math.max(Number(e.target.value), minPrice + 1000);

                      setMaxPrice(Math.min(PRICE_MAX, value));
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

                        setMinPrice(Math.max(PRICE_MIN, Math.min(value, maxPrice - 1000)));
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

                        setMaxPrice(Math.min(PRICE_MAX, Math.max(value, minPrice + 1000)));
                      }}
                    />
                  </label>
                </div>
              </section>

              {/* ================================
        사이즈
    ================================ */}

              {filterOptions.sizes.length > 0 && (
                <section className="filter-section">
                  <h3>사이즈</h3>

                  <div className="shoe-size-grid">
                    {filterOptions.sizes.map((size) => (
                      <button
                        type="button"
                        key={size}
                        className={selectedSize === size ? 'is-selected' : ''}
                        onClick={() => {
                          setSelectedSize((prev) => toggleSingleValue(prev, size));
                        }}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </section>
              )}
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
              {activeFilterTags.map((filter) => (
                <FilterTag
                  key={filter.id}
                  label={filter.label}
                  color={filter.color}
                  onRemove={() => removeAppliedFilter(filter.type)}
                />
              ))}

              {activeFilterTags.length > 0 && (
                <button type="button" className="product-filter-clear" onClick={clearAllFilters}>
                  전체 해제
                </button>
              )}
            </div>

            {/* 품절 제외 */}

            <label className="product-stock-toggle">
              <input
                type="checkbox"
                checked={excludeSoldOut}
                onChange={(e) => setExcludeSoldOut(e.target.checked)}
              />

              <span className="product-stock-toggle-track" aria-hidden="true" />

              <span>품절 제외</span>
            </label>
          </div>

          {/* ================================
    태블릿 / 모바일 카테고리
================================ */}
          <nav className="responsive-category-nav" aria-label="카테고리">
            {CATEGORY_NAV.map((item) => {
              const active = item.value === activeCategory.sidebarValue;

              return (
                <Link
                  key={`responsive-${item.label}`}
                  to={`${item.to}&gender=${gender}`}
                  className={`responsive-category-link${active ? ' is-active' : ''}`}
                  aria-current={active ? 'page' : undefined}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* ================================
              상품 그리드
          ================================ */}

          <div className="product-grid">
            {displayedProducts.map((product) => {
              const price = Number(product.price ?? 0);

              const originalPrice =
                product.originalPrice === null || product.originalPrice === undefined
                  ? null
                  : Number(product.originalPrice);

              const discountRate =
                originalPrice && originalPrice > price
                  ? Math.round((1 - price / originalPrice) * 100)
                  : null;

              const detailPath =
                product.productType === 'set'
                  ? `/products/${product.productId}?type=set`
                  : `/products/${product.productId}`;

              return (
                <article className="product-card" key={product.productId}>
                  {/* 이미지 */}

                  <Link to={detailPath} className="product-image-link">
                    <div className="product-image">
                      {product.imageUrl ? (
                        <img src={product.imageUrl} alt={product.name} />
                      ) : (
                        <div className="product-image-placeholder" />
                      )}
                    </div>
                  </Link>

                  {/* 상품 정보 */}

                  <div className="product-card-info">
                    <div className="product-card-top">
                      <h4>{product.name}</h4>
                    </div>

                    <p className="product-card-category">{product.subCategoryId?.toUpperCase()}</p>

                    <div className="product-card-price-wrap">
                      {discountRate !== null && (
                        <span className="product-card-discount">{discountRate}%</span>
                      )}

                      <strong className="product-card-price">₩ {price.toLocaleString()}</strong>

                      {originalPrice !== null && originalPrice > price && (
                        <del className="product-card-original-price">
                          ₩ {originalPrice.toLocaleString()}
                        </del>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          {/* ================================
              무한스크롤 감지 영역
          ================================ */}

          {hasMore && !loadError && (
            <div ref={loadMoreRef} className="product-scroll-trigger">
              {isLoading && <span>상품 불러오는 중...</span>}
            </div>
          )}

          {/* ================================
              끝
          ================================ */}

          {loadError && <div className="product-scroll-end">{loadError}</div>}

          {!hasMore && !isLoading && !loadError && displayedProducts.length > 0 && (
            <div className="product-scroll-end">모든 상품을 불러왔습니다.</div>
          )}

          {!isLoading && !loadError && !hasMore && displayedProducts.length === 0 && (
            <div className="product-scroll-end">등록된 상품이 없습니다.</div>
          )}
        </div>
      </div>
    </main>
  );
}

export default ProductPage;
