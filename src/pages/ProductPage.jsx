import { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getProductFilters, getProducts, getSets, searchProducts } from '@/api/products';
import { addWishlist, getWishlist, removeWishlist } from '@/api/wishlist';
import '@/styles/product-page.css';

const SEARCH_DEBOUNCE_DELAY = 700;
const CATEGORY_NAV = [
  { label: 'ALL', to: '/products?category=ALL', value: 'all' },
  { label: 'OUTER', to: '/products?category=outer', value: 'outer' },
  { label: 'TOP', to: '/products?category=top', value: 'top' },
  { label: 'BOTTOM', to: '/products?category=bottom', value: 'bottom' },
  { label: 'SETS', to: '/products?category=sets', value: 'sets' },
  { label: 'SHOES', to: '/products?category=shoes', value: 'shoes' },
];

const CATEGORY_CONFIG = {
  all: {
    categoryId: null,
    subCategoryId: null,
    label: 'ALL',
    sidebarValue: 'all',
  },
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
  color: [],
  size: [],
  lengthType: null,
  minPrice: null,
  maxPrice: null,
};

const LENGTH_LABELS = {
  long: '롱',
  short: '숏',
};

const WISHLIST_HEART_PATHS = {
  filled:
    'M240,102c0,70-103.79,126.66-108.21,129a8,8,0,0,1-7.58,0C119.79,228.66,16,172,16,102A62.07,62.07,0,0,1,78,40c20.65,0,38.73,8.88,50,23.89C139.27,48.88,157.35,40,178,40A62.07,62.07,0,0,1,240,102Z',
  outline:
    'M178,40c-20.65,0-38.73,8.88-50,23.89C116.73,48.88,98.65,40,78,40a62.07,62.07,0,0,0-62,62c0,70,103.79,126.66,108.21,129a8,8,0,0,0,7.58,0C136.21,228.66,240,172,240,102A62.07,62.07,0,0,0,178,40ZM128,214.8C109.74,204.16,32,155.69,32,102A46.06,46.06,0,0,1,78,56c19.45,0,35.78,10.36,42.6,27a8,8,0,0,0,14.8,0c6.82-16.67,23.15-27,42.6-27a46.06,46.06,0,0,1,46,46C224,155.61,146.24,204.15,128,214.8Z',
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

function getMultiValues(value) {
  if (!value) {
    return [];
  }

  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function toggleMultiValue(currentValues, nextValue) {
  if (currentValues.includes(nextValue)) {
    return currentValues.filter((value) => value !== nextValue);
  }

  return [...currentValues, nextValue];
}

function getWishlistItems(response) {
  const data = response?.data ?? response;

  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.items)) {
    return data.items;
  }

  if (Array.isArray(data?.wishlist)) {
    return data.wishlist;
  }

  return [];
}

function getWishlistId(item, productId) {
  return item?.id ?? item?.wishlistId ?? item?.wishId ?? productId;
}

function getSortTypeFromParams(searchParams) {
  const sortParam = searchParams.get('sort');

  return SORT_OPTIONS.some((option) => option.value === sortParam) ? sortParam : 'popular';
}

function getAppliedFiltersFromParams(searchParams) {
  const rawMinPrice = searchParams.get('minPrice');
  const rawMaxPrice = searchParams.get('maxPrice');
  const minPriceParam = Number(rawMinPrice);
  const maxPriceParam = Number(rawMaxPrice);
  const hasMinPrice = Number.isFinite(minPriceParam) && minPriceParam > PRICE_MIN;
  const hasMaxPrice =
    rawMaxPrice !== null && Number.isFinite(maxPriceParam) && maxPriceParam < PRICE_MAX;

  return {
    color: getMultiValues(searchParams.get('color')),
    size: getMultiValues(searchParams.get('size')),
    lengthType: searchParams.get('lengthType') || null,
    minPrice: hasMinPrice ? minPriceParam : null,
    maxPrice: hasMaxPrice ? maxPriceParam : null,
  };
}

function getPriceValueFromParams(searchParams, key, fallback) {
  const rawValue = searchParams.get(key);
  const value = Number(rawValue);

  return rawValue !== null && Number.isFinite(value) ? value : fallback;
}

function syncFilterParams(searchParams, filters) {
  const nextParams = new URLSearchParams(searchParams);

  if (filters.color.length > 0) {
    nextParams.set('color', filters.color.join(','));
  } else {
    nextParams.delete('color');
  }

  if (filters.size.length > 0) {
    nextParams.set('size', filters.size.join(','));
  } else {
    nextParams.delete('size');
  }

  if (filters.lengthType) {
    nextParams.set('lengthType', filters.lengthType);
  } else {
    nextParams.delete('lengthType');
  }

  if (filters.minPrice !== null) {
    nextParams.set('minPrice', String(filters.minPrice));
  } else {
    nextParams.delete('minPrice');
  }

  if (filters.maxPrice !== null) {
    nextParams.set('maxPrice', String(filters.maxPrice));
  } else {
    nextParams.delete('maxPrice');
  }

  return nextParams;
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

function IconChevronLeft() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M15 18L9 12L15 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconChevronRight() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M9 18L15 12L9 6"
        stroke="currentColor"
        strokeWidth="2"
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
  const [searchParams, setSearchParams] = useSearchParams();

  const categoryParam = (
    searchParams.get('categoryId') ??
    searchParams.get('category') ??
    'all'
  ).toLowerCase();

  const gender = searchParams.get('gender') ?? 'women';
  const searchQuery = searchParams.get('q')?.trim() ?? '';
  const sortType = getSortTypeFromParams(searchParams);
  const searchParamsKey = searchParams.toString();
  const requestGender = gender;

  const activeCategory = CATEGORY_CONFIG[categoryParam] ?? CATEGORY_CONFIG.all;
  const isAccessorySearchScope = activeCategory.categoryId === 'accessories';
  const searchScopeLabel = isAccessorySearchScope
    ? '악세사리'
    : gender === 'men'
      ? '남성복'
      : '여성복';

  /* 필터 열림 / 닫힘 */
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [isColorOpen, setIsColorOpen] = useState(true);

  /* 가격 필터 */
  const [minPrice, setMinPrice] = useState(() =>
    getPriceValueFromParams(searchParams, 'minPrice', PRICE_MIN)
  );
  const [maxPrice, setMaxPrice] = useState(() =>
    getPriceValueFromParams(searchParams, 'maxPrice', PRICE_MAX)
  );

  const [filterOptions, setFilterOptions] = useState({
    colors: [],
    sizes: [],
    lengthTypes: [],
  });

  const [selectedColor, setSelectedColor] = useState(() =>
    getMultiValues(searchParams.get('color'))
  );
  const [selectedSize, setSelectedSize] = useState(() => getMultiValues(searchParams.get('size')));
  const [selectedLengthType, setSelectedLengthType] = useState(
    () => searchParams.get('lengthType') || null
  );

  const appliedFilters = useMemo(() => getAppliedFiltersFromParams(searchParams), [searchParams]);

  /* 현재 몇 개까지 보여줄지 */
  const [page, setPage] = useState(1);

  /* 무한스크롤 감지 DIV */
  const loadMoreRef = useRef(null);
  const requestIdRef = useRef(0);
  const requestInFlightRef = useRef(false);
  const filterRequestIdRef = useRef(0);
  const sortRef = useRef(null);
  const responsiveCategoryRef = useRef(null);
  const searchParamsRef = useRef(searchParams);
  const searchDebounceTimerRef = useRef(null);

  /* 현재 보여주는 상품 */
  const [productItems, setProductItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState('');

  /* 아직 불러올 상품이 남았는지 */
  const [hasMore, setHasMore] = useState(true);

  /* 정렬 메뉴 */
  const [isSortOpen, setIsSortOpen] = useState(false);

  const [excludeSoldOut, setExcludeSoldOut] = useState(true);
  const [wishlistByProductId, setWishlistByProductId] = useState({});
  const [wishlistLoadingIds, setWishlistLoadingIds] = useState(() => new Set());
  const [searchInput, setSearchInput] = useState(searchQuery);

  const resetFilters = () => {
    setSelectedColor([]);
    setSelectedSize([]);
    setSelectedLengthType(null);
    setMinPrice(PRICE_MIN);
    setMaxPrice(PRICE_MAX);
  };

  const applyFilters = () => {
    const hasPriceFilter = minPrice !== PRICE_MIN || maxPrice !== PRICE_MAX;
    const nextFilters = {
      color: selectedColor,
      size: selectedSize,
      lengthType: selectedLengthType,
      minPrice: hasPriceFilter ? minPrice : null,
      maxPrice: hasPriceFilter ? maxPrice : null,
    };

    setSearchParams(syncFilterParams(searchParams, nextFilters));

    setIsFilterOpen(false);
  };

  const clearAllFilters = () => {
    resetFilters();
    setSearchParams(syncFilterParams(searchParams, EMPTY_APPLIED_FILTERS));
  };

  const cancelPendingSearchSync = () => {
    if (searchDebounceTimerRef.current) {
      window.clearTimeout(searchDebounceTimerRef.current);
      searchDebounceTimerRef.current = null;
    }
  };

  const syncSearchQueryToUrl = (value) => {
    cancelPendingSearchSync();

    const nextQuery = value.trim();

    if (nextQuery === (searchParamsRef.current.get('q')?.trim() ?? '')) {
      return;
    }

    const nextParams = new URLSearchParams(searchParamsRef.current);

    if (nextQuery) {
      nextParams.set('q', nextQuery);

      if (isAccessorySearchScope) {
        nextParams.set('category', 'accessories');
        nextParams.delete('categoryId');
        nextParams.delete('gender');
      } else {
        nextParams.set('gender', gender);
        nextParams.set('category', 'ALL');
        nextParams.delete('categoryId');
      }
    } else {
      nextParams.delete('q');
    }

    setSearchParams(nextParams);
  };

  const scheduleSearchSync = (value) => {
    cancelPendingSearchSync();

    searchDebounceTimerRef.current = window.setTimeout(() => {
      searchDebounceTimerRef.current = null;
      syncSearchQueryToUrl(value);
    }, SEARCH_DEBOUNCE_DELAY);
  };

  const getCategoryLink = (item) => {
    const nextParams = new URLSearchParams(searchParams);
    const [, queryString = ''] = item.to.split('?');
    const itemParams = new URLSearchParams(queryString);

    nextParams.delete('q');
    nextParams.delete('category');
    nextParams.delete('categoryId');
    nextParams.set('gender', gender);

    itemParams.forEach((value, key) => {
      nextParams.set(key, value);
    });

    return `/products?${nextParams.toString()}`;
  };

  const handleCategoryClick = () => {
    cancelPendingSearchSync();
    setSearchInput('');
  };

  const scrollResponsiveCategory = (direction) => {
    responsiveCategoryRef.current?.scrollBy({
      left: direction * 140,
      behavior: 'smooth',
    });
  };

  const selectSortType = (nextSortType) => {
    const nextParams = new URLSearchParams(searchParams);

    if (nextSortType === 'popular') {
      nextParams.delete('sort');
    } else {
      nextParams.set('sort', nextSortType);
    }

    setSearchParams(nextParams);
    setIsSortOpen(false);
  };

  useEffect(() => {
    if (!isSortOpen) return undefined;

    const handlePointerDown = (event) => {
      if (!sortRef.current?.contains(event.target)) {
        setIsSortOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [isSortOpen]);

  useEffect(() => {
    searchParamsRef.current = searchParams;
  }, [searchParams]);

  useEffect(() => {
    return () => {
      cancelPendingSearchSync();
    };
  }, []);

  const removeAppliedFilter = (type) => {
    const nextFilters = { ...appliedFilters };

    if (type === 'color') {
      setSelectedColor([]);
      nextFilters.color = [];
      setSearchParams(syncFilterParams(searchParams, nextFilters));

      return;
    }

    if (type === 'size') {
      setSelectedSize([]);
      nextFilters.size = [];
      setSearchParams(syncFilterParams(searchParams, nextFilters));

      return;
    }

    if (type === 'lengthType') {
      setSelectedLengthType(null);
      nextFilters.lengthType = null;
      setSearchParams(syncFilterParams(searchParams, nextFilters));

      return;
    }

    if (type === 'price') {
      setMinPrice(PRICE_MIN);
      setMaxPrice(PRICE_MAX);
      nextFilters.minPrice = null;
      nextFilters.maxPrice = null;
      setSearchParams(syncFilterParams(searchParams, nextFilters));
    }
  };

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setMinPrice(getPriceValueFromParams(searchParams, 'minPrice', PRICE_MIN));
      setMaxPrice(getPriceValueFromParams(searchParams, 'maxPrice', PRICE_MAX));
      setSelectedColor(appliedFilters.color);
      setSelectedSize(appliedFilters.size);
      setSelectedLengthType(appliedFilters.lengthType);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [searchParams, appliedFilters]);

  useEffect(() => {
    const requestId = filterRequestIdRef.current + 1;

    filterRequestIdRef.current = requestId;

    const fetchFilterOptions = async () => {
      if (activeCategory.categoryId === 'sets' && requestGender === 'men') {
        setFilterOptions({
          colors: [],
          sizes: [],
          lengthTypes: [],
        });

        return;
      }

      try {
        const params = {
          gender: requestGender,
        };

        if (activeCategory.categoryId) {
          params.categoryId = activeCategory.categoryId;
        }

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
      } catch {
        if (requestId !== filterRequestIdRef.current) {
          return;
        }

        setFilterOptions({
          colors: [],
          sizes: [],
          lengthTypes: [],
        });
      }
    };

    const timeoutId = window.setTimeout(fetchFilterOptions, 0);

    return () => {
      window.clearTimeout(timeoutId);
      filterRequestIdRef.current += 1;
    };
  }, [activeCategory.categoryId, activeCategory.subCategoryId, requestGender]);

  const fetchProductsPage = useCallback(
    async (targetPage, replace = false) => {
      const requestId = requestIdRef.current + 1;
      const currentSearchParams = new URLSearchParams(searchParamsKey);
      const currentGender = currentSearchParams.get('gender') ?? 'women';

      requestIdRef.current = requestId;
      requestInFlightRef.current = true;

      if (activeCategory.categoryId === 'sets' && currentGender === 'men') {
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
          gender: currentGender,
          sort: sortType,
          page: targetPage,
          limit: PRODUCTS_PER_LOAD,
        };

        if (activeCategory.subCategoryId) {
          params.subCategoryId = activeCategory.subCategoryId;
        }

        if (appliedFilters.color.length > 0) {
          params.color = appliedFilters.color.join(',');
        }

        if (appliedFilters.size.length > 0) {
          params.size = appliedFilters.size.join(',');
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

        let response;

        if (searchQuery) {
          const searchRequestParams = { ...params };

          delete searchRequestParams.subCategoryId;

          if (isAccessorySearchScope) {
            delete searchRequestParams.gender;
          }

          response = await searchProducts({
            ...searchRequestParams,
            q: searchQuery,
            ...(isAccessorySearchScope ? { categoryId: 'accessories' } : { gender: currentGender }),
          });
        } else if (activeCategory.categoryId === 'sets') {
          response = await getSets(params);
        } else if (activeCategory.categoryId) {
          response = await getProducts({
            ...params,
            categoryId: activeCategory.categoryId,
          });
        } else {
          response = await getProducts(params);
        }

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
    [
      activeCategory.categoryId,
      activeCategory.subCategoryId,
      appliedFilters,
      isAccessorySearchScope,
      searchQuery,
      searchParamsKey,
      sortType,
    ]
  );

  useEffect(() => {
    requestInFlightRef.current = true;
    const timeoutId = window.setTimeout(() => {
      fetchProductsPage(1, true);
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
      requestIdRef.current += 1;
    };
  }, [fetchProductsPage]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setSearchInput(searchQuery);
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [searchQuery]);

  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');

    if (!accessToken) {
      return;
    }

    let isMounted = true;

    const fetchWishlist = async () => {
      try {
        const response = await getWishlist();

        if (!isMounted) {
          return;
        }

        const nextWishlist = getWishlistItems(response).reduce((acc, item) => {
          const productId = Number(
            item?.productId ?? item?.product?.productId ?? item?.product?.id
          );

          if (Number.isFinite(productId)) {
            acc[productId] = getWishlistId(item, productId);
          }

          return acc;
        }, {});

        setWishlistByProductId(nextWishlist);
      } catch {
        if (isMounted) {
          setWishlistByProductId({});
        }
      }
    };

    fetchWishlist();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleWishlist = async (product) => {
    const accessToken = localStorage.getItem('accessToken');

    if (!accessToken) {
      alert('로그인 후 찜할 수 있습니다.');
      return;
    }

    const productId = Number(product.productId);

    if (!Number.isFinite(productId) || wishlistLoadingIds.has(productId)) {
      return;
    }

    const wishlistId = wishlistByProductId[productId];
    const isFavorite = Boolean(wishlistId);

    setWishlistLoadingIds((prev) => new Set(prev).add(productId));

    try {
      if (isFavorite) {
        await removeWishlist(wishlistId);

        setWishlistByProductId((prev) => {
          const next = { ...prev };

          delete next[productId];

          return next;
        });

        return;
      }

      const response = await addWishlist(productId);
      const responseData = response?.data ?? response;
      const nextWishlistId = getWishlistId(responseData, productId);

      setWishlistByProductId((prev) => ({
        ...prev,
        [productId]: nextWishlistId,
      }));
    } catch (error) {
      alert(error.message || '찜 상태를 변경하지 못했습니다.');
    } finally {
      setWishlistLoadingIds((prev) => {
        const next = new Set(prev);

        next.delete(productId);

        return next;
      });
    }
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
  };

  const handleSearchClear = () => {
    setSearchInput('');
    syncSearchQueryToUrl('');
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

  useEffect(() => {
    if (isLoading || !hasMore || requestInFlightRef.current) {
      return;
    }

    const target = loadMoreRef.current;

    if (!target) {
      return;
    }

    const targetTop = target.getBoundingClientRect().top;
    const preloadBoundary = window.innerHeight + 150;

    if (targetTop > preloadBoundary) {
      return;
    }

    const nextPage = page + 1;

    setPage(nextPage);
    fetchProductsPage(nextPage);
  }, [fetchProductsPage, hasMore, isLoading, page, productItems.length]);

  const activeFilterTags = [
    ...appliedFilters.color.map((color) => ({
      id: `color-${color}`,
      type: 'color',
      label: filterOptions.colors.find((item) => item.filterGroup === color)?.label ?? color,
      color: COLOR_MAP[color] ?? '#d9d9d9',
    })),

    ...appliedFilters.size.map((size) => ({
      id: `size-${size}`,
      type: 'size',
      label: size,
    })),

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

  const hasActiveFilters = activeFilterTags.length > 0;
  const isLengthFilterVisible =
    activeCategory.categoryId === null || activeCategory.categoryId === 'bottom';
  const emptyMessage = searchQuery
    ? `"${searchQuery}"에 대한 검색 결과가 없습니다.`
    : hasActiveFilters
      ? '조건에 맞는 상품이 없습니다.'
      : '등록된 상품이 없습니다.';
  const emptySubMessage = searchQuery
    ? `${searchScopeLabel} 안에서 다른 검색어를 입력해 보세요.`
    : hasActiveFilters
      ? '필터를 조정하거나 전체 해제해 주세요.'
      : '';

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
                  to={getCategoryLink(item)}
                  onClick={handleCategoryClick}
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
          </div>

          {/* ================================
              필터
          ================================ */}

          <div className="product-filter-bar">
            <span className="product-mobile-result-count">{displayedProducts.length}개</span>

            <div className="product-filter-bar-left">
              <div className="product-sort" ref={sortRef}>
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
                          selectSortType(option.value);
                        }}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="button"
                className="filter-btn product-filter-open-btn"
                onClick={() => setIsFilterOpen(true)}
              >
                <IconFilter />

                <span>전체 필터</span>

                {activeFilterTags.length > 0 && (
                  <span className="filter-btn-count">{activeFilterTags.length}</span>
                )}
              </button>
            </div>

            {/* 검색 */}

            <form className="product-search-box" onSubmit={handleSearchSubmit}>
              <IconSearch />

              <input
                type="search"
                name="q"
                value={searchInput}
                onChange={(event) => {
                  const { value } = event.target;

                  setSearchInput(value);

                  scheduleSearchSync(value);
                }}

                placeholder={`${searchScopeLabel} 검색`}
                aria-label={`${searchScopeLabel} 상품 검색`}
              />

              {searchInput && (
                <button type="button" onClick={handleSearchClear} aria-label="검색어 지우기">
                  <IconClose />
                </button>
              )}
            </form>
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
              <h2>
                전체 필터
                {activeFilterTags.length > 0 && (
                  <span className="filter-drawer-count">{activeFilterTags.length}</span>
                )}
              </h2>

              <div className="filter-drawer-header-actions">
                <button type="button" className="filter-reset-btn" onClick={clearAllFilters}>
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
              <section className="filter-section filter-mobile-summary-section">
                <div className="filter-mobile-summary-row">
                  <label className="product-stock-toggle product-stock-toggle--drawer">
                    <input
                      type="checkbox"
                      checked={excludeSoldOut}
                      onChange={(e) => setExcludeSoldOut(e.target.checked)}
                    />

                    <span className="product-stock-toggle-track" aria-hidden="true" />

                    <span>품절 제외</span>
                  </label>
                </div>

                {activeFilterTags.length > 0 && (
                  <div className="filter-drawer-tags">
                    {activeFilterTags.map((filter) => (
                      <FilterTag
                        key={`drawer-${filter.id}`}
                        label={filter.label}
                        color={filter.color}
                        onRemove={() => removeAppliedFilter(filter.type)}
                      />
                    ))}

                    <button type="button" className="product-filter-clear" onClick={clearAllFilters}>
                      전체 해제
                    </button>
                  </div>
                )}
              </section>

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

                        const checked = selectedColor.includes(value);

                        const backgroundColor = COLOR_MAP[value] ?? '#d9d9d9';

                        return (
                          <label className="color-filter-item" key={value}>
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => {
                                setSelectedColor((prev) => toggleMultiValue(prev, value));
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

              {isLengthFilterVisible && filterOptions.lengthTypes.length > 0 && (
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
                        className={selectedSize.includes(size) ? 'is-selected' : ''}
                        onClick={() => {
                          setSelectedSize((prev) => toggleMultiValue(prev, size));
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
              <span className="product-result-count">{displayedProducts.length}개 상품</span>

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
            <button
              type="button"
              className="responsive-category-arrow"
              onClick={() => scrollResponsiveCategory(-1)}
              aria-label="이전 카테고리"
            >
              <IconChevronLeft />
            </button>

            <div className="responsive-category-track" ref={responsiveCategoryRef}>
              {CATEGORY_NAV.map((item) => {
                const active = item.value === activeCategory.sidebarValue;

                return (
                  <Link
                    key={`responsive-${item.label}`}
                    to={getCategoryLink(item)}
                    onClick={handleCategoryClick}
                    className={`responsive-category-link${active ? ' is-active' : ''}`}
                    aria-current={active ? 'page' : undefined}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>

            <button
              type="button"
              className="responsive-category-arrow"
              onClick={() => scrollResponsiveCategory(1)}
              aria-label="다음 카테고리"
            >
              <IconChevronRight />
            </button>
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
              const isFavorite = Boolean(wishlistByProductId[product.productId]);
              const isWishlistLoading = wishlistLoadingIds.has(product.productId);
              const heartPath = isFavorite
                ? WISHLIST_HEART_PATHS.filled
                : WISHLIST_HEART_PATHS.outline;

              return (
                <article className="product-card" key={product.productId}>
                  {/* 이미지 */}

                  <div className="product-image">
                    <Link to={detailPath} className="product-image-link">
                      {product.imageUrl ? (
                        <img src={product.imageUrl} alt={product.name} />
                      ) : (
                        <div className="product-image-placeholder" />
                      )}
                    </Link>

                    <button
                      type="button"
                      onClick={() => handleWishlist(product)}
                      aria-label={isFavorite ? `${product.name} 찜 해제` : `${product.name} 찜하기`}
                      aria-pressed={isFavorite}
                      disabled={isWishlistLoading}
                      className={`product-wishlist-button${isFavorite ? ' is-active' : ''}`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 256 256"
                        aria-hidden="true"
                      >
                        <path className="product-wishlist-icon-shadow" d={heartPath} />
                        <path className="product-wishlist-icon-shape" d={heartPath} />
                      </svg>
                    </button>
                  </div>

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

            {isLoading &&
              Array.from({ length: 4 }).map((_, index) => (
                <article className="product-card product-card-skeleton" key={`loading-${index}`}>
                  <div className="product-image product-skeleton-image" />

                  <div className="product-card-info">
                    <div className="product-skeleton-line product-skeleton-name" />
                    <div className="product-skeleton-line product-skeleton-category" />
                    <div className="product-skeleton-line product-skeleton-price" />
                  </div>
                </article>
              ))}
          </div>

          {/* ================================
              무한스크롤 감지 영역
          ================================ */}

          {hasMore && !loadError && (
            <div ref={loadMoreRef} className="product-scroll-trigger">
              {isLoading && (
                <div className="product-loading-motion" aria-live="polite">
                  <span className="product-loading-dot" />
                  <span className="product-loading-dot" />
                  <span className="product-loading-dot" />
                  <span className="product-loading-text">상품 불러오는 중</span>
                </div>
              )}
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
            <div className="product-scroll-end product-empty-state">
              <strong>{emptyMessage}</strong>

              {emptySubMessage && <span>{emptySubMessage}</span>}

              {hasActiveFilters && (
                <button type="button" onClick={clearAllFilters}>
                  전체 필터 해제
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default ProductPage;
