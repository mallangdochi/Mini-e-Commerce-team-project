import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

import { getProduct, getSet } from '@/api/products';
import modelFull from '@/assets/home/featured-look/arc-model-full.png';
import partTop from '@/assets/home/featured-look/arc-top.png';
import partBottom from '@/assets/home/featured-look/arc-bottom.png';
import partShoes from '@/assets/home/featured-look/arc-shoes.png';
import model10513Full from '@/assets/home/featured-look/arc-model-10513-full.png';
import model10513Top from '@/assets/home/featured-look/arc-model-10513-top.png';
import model10513Bottom from '@/assets/home/featured-look/arc-model-10513-bottom.png';
import model10513Shoes from '@/assets/home/featured-look/arc-model-10513-shoes.png';
import model10515Full from '@/assets/home/featured-look/arc-model-10515-full.png';
import model10515Top from '@/assets/home/featured-look/arc-model-10515-top.png';
import model10515Bottom from '@/assets/home/featured-look/arc-model-10515-bottom.png';
import model10515Shoes from '@/assets/home/featured-look/arc-model-10515-shoes.png';
import '@/styles/featured-look.css';

const VIEW_ORDER = ['full', 'top', 'bottom', 'shoes'];
const PARTS = VIEW_ORDER.slice(1);

const VIEW_LABELS = {
  full: '전체 착장',
  top: '상의',
  bottom: '하의',
  shoes: '신발',
};

const HOTSPOT_LABELS = {
  top: 'TOP',
  bottom: 'BOTTOM',
  shoes: 'SHOES',
};

function HotspotIconTop() {
  return (
    <svg viewBox="0 0 1254 1254" fill="currentColor" aria-hidden="true">
      <path d="M397.25,591.04c-.55-7.27-1.43-2.59-3.43-.48-13.07,13.72-25.56,28.69-39.86,40.81l-140.6-99.28c37.73-45.16,74.85-90.98,113.44-135.41,12.62-14.53,34.49-42.87,49.81-52.11,7.8-4.71,19.14-9.66,27.65-13.32,37.33-16.08,77.63-28.65,115.9-42.47,6.49,44.19,39.86,77.18,83.74,84.64,54.66,9.3,111.32-14.91,127.37-70.89.66-2.3,2.31-13.69,3.32-13.78,39.12,14.12,79.15,26.9,117.29,43.53,11.93,5.2,24.04,10.63,34.48,18.48,52.85,58.94,103.61,119.75,154.03,180.8.6,1.15.17,1.67-.53,2.56-1.42,1.81-10.11,7.39-12.76,9.27-41.97,29.76-85.07,58-126.86,88.03l-41.83-42.88c-.42.54-1.49,3.3-1.49,3.49v373.2h-457.14c-.33,0-1.52-1.32-2.5-1v-373.2Z" />
    </svg>
  );
}

function HotspotIconBottom() {
  return (
    <svg viewBox="0 0 1254 1254" fill="currentColor" aria-hidden="true">
      <path d="M860.5,310.64c5.5,20.15,5.96,41.18,7.59,61.87,53.22,89.42,68.33,192.96,81.87,293.39,11.31,83.87,21.47,171.48,27.56,255.8.31,4.26,1.63,14.41-.99,17.14-3.82,3.97-14.3,2.04-19.86,2.32-90.26,4.54-180.54,4.26-271.17,3.89l-5.51-1.5-53.35-326.78-53.23,326.9-4.6,1.4c-80.63-.57-161.47,1.22-241.82-1.92-13.14-.51-29.84-.6-42.61-1.94-4.23-.45-7.88-1.72-8.5-6.13,7.91-84.41,15.51-168.89,26.4-253,11.92-92.14,24.89-191.13,65.71-276.19,4-8.33,16.34-26.43,18.22-33.36,2.83-10.47,1.8-28.65,3.42-40.56.84-6.16,1.16-21.65,8.45-22.53,12.71-1.53,32.2.15,45.8.09,128.32-.61,256.62-1.05,384.83,0,5.13.04,29.62-.97,31.8,1.13Z" />
    </svg>
  );
}

function HotspotIconShoes() {
  return (
    <svg viewBox="0 0 1254 1254" fill="currentColor" aria-hidden="true">
      <path d="M542.51,445.34c8.32-1.41,14.12,2.69,20.67,6.97,24.18,15.78,48.36,37.64,72.21,54.9,115.64,83.65,210.88,124.73,354.01,142.17,24.15,2.94,70.35.82,79.74,29.84,3.8,11.75.75,18.31-9.74,23.52-10.49,5.21-23.73,9.61-34.92,13.29-102.7,33.84-222.77,36.94-329.51,23.53-52.36-6.58-103.47-19.78-155.55-27.67-69.18-10.49-139.64-9.24-209.23-12.56-29.61-1.41-59.52-2.34-88.33-9.86-20.16-5.26-28.99-7.61-27.86-30.86,1.49-30.38,13.67-62.13,20.6-91.61,5.13-21.8,6.71-49.38,14.66-69.49,11.56-29.22,38.75-30.55,58.98-8.55,13.34,14.51,21.47,32.49,36.78,46.5,41.18,37.67,106.17,36.79,148.15.83,24.39-20.89,23.52-37.44,31.59-65.72,2.58-9.06,6.96-23.39,17.74-25.21Z" />
      <path d="M218.16,699.56c3.89-.22,16.22,5.08,21.26,6.36,58,14.84,130.6,10.94,190.71,13.55,73.81,3.21,136.16,15.59,208,27.81,126.69,21.55,261.62,24.14,384.81-16.14,8.99-2.94,33.04-13.87,40.11-14.31,9.27-.57,9.37,9.55,7.47,16.3-6.93,24.62-56.34,45.74-78.98,53.4-86.96,29.43-183.4,21.35-273.95,21.47-126.47.17-252.51.78-378.64,0-30.91-.19-62.06,2.06-92.31-6.74-23.57-6.85-60.11-24.81-57.18-54.14.83-8.36,13.17-35.21,18.55-41.94,2.43-3.04,6.16-5.41,10.15-5.64Z" />
    </svg>
  );
}

function HotspotIconFull() {
  return (
    <svg viewBox="0 0 1254 1254" fill="currentColor" aria-hidden="true">
      <rect x="642.92" y="298.14" width="317.09" height="317.09" rx="26.31" ry="26.31" />
      <rect x="293.98" y="298.14" width="317.09" height="317.09" rx="26.31" ry="26.31" />
      <rect x="642.92" y="638.77" width="317.09" height="317.09" rx="26.31" ry="26.31" />
      <rect x="293.98" y="638.77" width="317.09" height="317.09" rx="26.31" ry="26.31" />
    </svg>
  );
}

const HOTSPOT_ICONS = {
  top: HotspotIconTop,
  bottom: HotspotIconBottom,
  shoes: HotspotIconShoes,
};

const VIEW_ICONS = {
  full: HotspotIconFull,
  ...HOTSPOT_ICONS,
};

const COMPACT_QUERY = '(max-width: 767px)';
const SWIPE_THRESHOLD = 40;

const LOOKS = [
  {
    id: 'look-01',
    label: 'LOOK 01',
    setId: 10501,
    fallbackProductIds: {
      top: 10101,
      bottom: 10305,
      shoes: 10401,
    },
    images: {
      full: modelFull,
      top: partTop,
      bottom: partBottom,
      shoes: partShoes,
    },
  },
  {
    id: 'look-02',
    label: 'LOOK 02',
    setId: 10513,
    fallbackProductIds: {
      top: 10115,
      bottom: 10323,
      shoes: null,
    },
    images: {
      full: model10513Full,
      top: model10513Top,
      bottom: model10513Bottom,
      shoes: model10513Shoes,
    },
  },
  {
    id: 'look-03',
    label: 'LOOK 03',
    setId: 10515,
    fallbackProductIds: {
      top: 10119,
      bottom: 10327,
      shoes: null,
    },
    images: {
      full: model10515Full,
      top: model10515Top,
      bottom: model10515Bottom,
      shoes: model10515Shoes,
    },
  },
];

const PART_EYEBROWS = {
  top: 'ARC TOP',
  bottom: 'ARC BOTTOM',
  shoes: 'ARC SHOES',
};

function normalizeImageUrl(url) {
  if (!url || typeof url !== 'string') {
    return '';
  }

  return url.trim().replace(/^<|>$/g, '');
}

function getProductImageCandidates(product) {
  return [
    product?.images?.thumbnail,
    product?.imageUrl,
    product?.images?.front,
    product?.images?.styled,
    product?.images?.side,
    product?.images?.back,
  ]
    .map(normalizeImageUrl)
    .filter(Boolean)
    .filter((url, index, urls) => urls.indexOf(url) === index);
}

function ProductApiImage({ product, alt, fallbackImage = '', className = '' }) {
  const imageCandidates = [...getProductImageCandidates(product), fallbackImage]
    .map(normalizeImageUrl)
    .filter(Boolean)
    .filter((url, index, urls) => urls.indexOf(url) === index);
  const [imageIndex, setImageIndex] = useState(0);
  const imageUrl = imageCandidates[imageIndex] ?? '';

  if (!imageUrl) {
    return <span className="arc-product-image-state">상품 이미지를 불러올 수 없습니다.</span>;
  }

  return (
    <img
      src={imageUrl}
      alt={alt}
      className={className}
      draggable="false"
      onError={() => {
        setImageIndex((currentIndex) => currentIndex + 1);
      }}
    />
  );
}

function useIsCompact() {
  const [isCompact, setIsCompact] = useState(() => window.matchMedia(COMPACT_QUERY).matches);

  useEffect(() => {
    const mql = window.matchMedia(COMPACT_QUERY);
    const onChange = (event) => setIsCompact(event.matches);

    mql.addEventListener('change', onChange);

    return () => {
      mql.removeEventListener('change', onChange);
    };
  }, []);

  return isCompact;
}

function getPartFromCategory(product) {
  const categoryId = String(product?.categoryId ?? '').toLowerCase();

  if (categoryId === 'outer' || categoryId === 'top') {
    return 'top';
  }

  if (categoryId === 'bottom') {
    return 'bottom';
  }

  if (categoryId === 'shoes') {
    return 'shoes';
  }

  return null;
}

async function loadLookProducts(look) {
  const setResponse = await getSet(look.setId);
  const setProduct = setResponse?.data ?? null;
  const componentIds = Array.isArray(setProduct?.componentProductIds)
    ? setProduct.componentProductIds
    : [];
  const requestedIds = new Set(componentIds);

  Object.values(look.fallbackProductIds).forEach((productId) => {
    if (productId) {
      requestedIds.add(productId);
    }
  });

  const productResponses = await Promise.all(
    Array.from(requestedIds).map(async (productId) => {
      const response = await getProduct(productId);
      return response?.data ?? null;
    })
  );

  const products = {
    full: setProduct,
    top: null,
    bottom: null,
    shoes: null,
  };

  productResponses.filter(Boolean).forEach((product) => {
    const part = getPartFromCategory(product);

    if (part && !products[part]) {
      products[part] = product;
    }
  });

  Object.entries(look.fallbackProductIds).forEach(([part, productId]) => {
    if (!productId || products[part]) {
      return;
    }

    products[part] =
      productResponses.find((product) => Number(product?.productId) === Number(productId)) ?? null;
  });

  return products;
}

function getProductPath(product, look) {
  if (!product) {
    return `/products/${look.setId}?type=set`;
  }

  if (product.productType === 'set' || Number(product.productId) === Number(look.setId)) {
    return `/products/${product.productId ?? look.setId}?type=set`;
  }

  return `/products/${product.productId}`;
}

function FeaturedLookSection() {
  const isCompact = useIsCompact();
  const [currentModel, setCurrentModel] = useState(0);
  const [selectedView, setSelectedView] = useState('full');
  const [hoveredPart, setHoveredPart] = useState(null);
  const [isModelHovered, setIsModelHovered] = useState(false);
  const [lookProducts, setLookProducts] = useState({});
  const [isFeaturedProductsLoading, setIsFeaturedProductsLoading] = useState(true);
  const [featuredProductsError, setFeaturedProductsError] = useState('');
  const [isSliding, setIsSliding] = useState(false);
  const [isViewTransitioning, setIsViewTransitioning] = useState(false);
  const viewTransitionTimerRef = useRef(null);
  const modelSlideTimerRef = useRef(null);
  const touchStartX = useRef(0);

  const current = LOOKS[currentModel];
  const nextModelIndex = (currentModel + 1) % LOOKS.length;
  const afterNextModelIndex = (currentModel + 2) % LOOKS.length;
  const next = LOOKS[nextModelIndex];
  const afterNext = LOOKS[afterNextModelIndex];
  const currentProducts = lookProducts[current.id] ?? {};
  const exactActiveProduct = currentProducts[selectedView] ?? null;
  const activeProduct = exactActiveProduct ?? currentProducts.full ?? null;
  const activeVisual = current.images[selectedView];
  const activeDetailPath = getProductPath(exactActiveProduct ?? currentProducts.full, current);
  const activeEyebrow =
    selectedView === 'full' ? `ARC ${current.label}` : PART_EYEBROWS[selectedView];
  const currentSet = currentProducts.full ?? null;

  const clearViewTransitionTimer = () => {
    if (viewTransitionTimerRef.current) {
      window.clearTimeout(viewTransitionTimerRef.current);
      viewTransitionTimerRef.current = null;
    }
  };

  const clearModelSlideTimer = () => {
    if (modelSlideTimerRef.current) {
      window.clearTimeout(modelSlideTimerRef.current);
      modelSlideTimerRef.current = null;
    }
  };

  const finishViewTransition = () => {
    clearViewTransitionTimer();
    setHoveredPart(null);
    setIsModelHovered(false);
    setIsViewTransitioning(false);
  };

  const finishModelSlide = () => {
    clearModelSlideTimer();
    setCurrentModel((currentIndex) => (currentIndex + 1) % LOOKS.length);
    setIsSliding(false);
  };

  useEffect(() => {
    let isMounted = true;

    Promise.all(
      LOOKS.map(async (look) => {
        const products = await loadLookProducts(look);
        return [look.id, products];
      })
    )
      .then((entries) => {
        if (!isMounted) {
          return;
        }

        setLookProducts(Object.fromEntries(entries));
        setFeaturedProductsError('');
        setIsFeaturedProductsLoading(false);
      })
      .catch(() => {
        if (!isMounted) {
          return;
        }

        setLookProducts({});
        setFeaturedProductsError('상품 정보를 불러오지 못했습니다.');
        setIsFeaturedProductsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    return () => {
      clearViewTransitionTimer();
      clearModelSlideTimer();
    };
  }, []);

  const goToNextModel = () => {
    setCurrentModel((currentIndex) => (currentIndex + 1) % LOOKS.length);
  };

  const handleHeroTouchStart = (event) => {
    touchStartX.current = event.changedTouches[0].screenX;
  };

  const handleHeroTouchEnd = (event) => {
    const diff = event.changedTouches[0].screenX - touchStartX.current;

    if (diff < -SWIPE_THRESHOLD) {
      goToNextModel();
    }
  };

  const changeView = (view) => {
    if (isSliding || view === selectedView) {
      return;
    }

    clearViewTransitionTimer();
    setHoveredPart(null);
    setIsModelHovered(false);
    setIsViewTransitioning(true);
    setSelectedView(view);

    viewTransitionTimerRef.current = window.setTimeout(() => {
      finishViewTransition();
    }, 1000);
  };

  const handleViewTransitionEnd = (event) => {
    if (event.currentTarget !== event.target || event.propertyName !== 'transform') {
      return;
    }

    finishViewTransition();
  };

  const handleNextModel = () => {
    if (selectedView !== 'full' || isSliding || isViewTransitioning) {
      return;
    }

    setHoveredPart(null);
    setIsModelHovered(false);
    setIsSliding(true);

    clearModelSlideTimer();

    modelSlideTimerRef.current = window.setTimeout(() => {
      finishModelSlide();
    }, 750);
  };

  const handleNextModelAnimationEnd = (event) => {
    if (event.currentTarget !== event.target) {
      return;
    }

    if (event.animationName !== 'arc-next-to-center' || !isSliding) {
      return;
    }

    finishModelSlide();
  };

  return (
    <section className="arc-look-page">
      <section className="arc-look-shell">
        <aside className="arc-info-rail">
          <nav className="arc-view-switcher">
            {VIEW_ORDER.map((view) => {
              const ViewIcon = VIEW_ICONS[view];

              return (
                <button
                  key={view}
                  type="button"
                  className={`arc-view-button arc-view-button--${view} ${
                    selectedView === view ? 'is-active' : ''
                  }`}
                  onClick={() => changeView(view)}
                  disabled={isSliding}
                  aria-label={VIEW_LABELS[view]}
                  aria-pressed={selectedView === view}
                >
                  <ViewIcon />
                </button>
              );
            })}
          </nav>

          <article className="arc-product-card">
            <div className="arc-product-image" aria-busy={isFeaturedProductsLoading}>
              {isFeaturedProductsLoading ? (
                <span className="arc-product-image-state">상품 이미지를 불러오는 중입니다.</span>
              ) : (
                <ProductApiImage
                  key={`${current.id}-${selectedView}-${exactActiveProduct?.productId ?? 'fallback'}`}
                  product={exactActiveProduct}
                  fallbackImage={activeVisual}
                  alt={`${activeProduct?.name ?? VIEW_LABELS[selectedView]} 상품 썸네일`}
                />
              )}
            </div>

            <div className="arc-product-meta">
              <div>
                <p className="arc-product-eyebrow">{activeEyebrow}</p>

                <h1>
                  {activeProduct?.name ??
                    (isFeaturedProductsLoading
                      ? '상품 정보를 불러오는 중입니다.'
                      : '상품 정보를 불러오지 못했습니다.')}
                </h1>
              </div>
            </div>

            <p className="arc-product-description">
              {exactActiveProduct?.description ||
                activeProduct?.description ||
                (featuredProductsError ? featuredProductsError : '상품 설명을 불러오는 중입니다.')}
            </p>

            <Link to={activeDetailPath} className="arc-detail-button">
              <span>상세설명</span>
              <span>↗</span>
            </Link>
          </article>
        </aside>

        <section
          className={`arc-model-stage arc-model-stage--${selectedView} arc-model-stage--${current.id}`}
        >
          <div className={`arc-model-track ${isSliding ? 'is-sliding' : ''}`}>
            <div
              className={`arc-track-model arc-track-model--current ${
                hoveredPart && selectedView === 'full' && !isViewTransitioning
                  ? 'is-part-hovering'
                  : ''
              }`}
              onMouseEnter={() => {
                if (selectedView === 'full' && !isSliding) {
                  setIsModelHovered(true);
                }
              }}
              onMouseLeave={() => {
                setIsModelHovered(false);
                setHoveredPart(null);
              }}
            >
              <div className="arc-model-canvas" onTransitionEnd={handleViewTransitionEnd}>
                <img
                  className="arc-model-full-image"
                  src={current.images.full}
                  alt={`${current.label} 모델`}
                  draggable="false"
                />

                {selectedView === 'full' &&
                  PARTS.map((part) => (
                    <div
                      key={part}
                      className={`arc-part-overlay arc-part-overlay--${part} ${
                        isModelHovered ? 'is-visible' : ''
                      } ${hoveredPart === part ? 'is-focused' : ''} ${
                        hoveredPart && hoveredPart !== part ? 'is-muted' : ''
                      }`}
                      style={{
                        '--part-mask': `url("${current.images[part]}")`,
                      }}
                    >
                      <img
                        className="arc-part-overlay-image"
                        src={current.images[part]}
                        alt=""
                        draggable="false"
                      />

                      <span className="arc-part-metal-fill" />
                    </div>
                  ))}

                {selectedView === 'full' && !isSliding && (
                  <div className="arc-part-hotspots">
                    {PARTS.map((part) => (
                      <button
                        key={part}
                        type="button"
                        className={`arc-part-hotspot arc-part-hotspot--${part}`}
                        onMouseEnter={() => setHoveredPart(part)}
                        onMouseLeave={() => setHoveredPart(null)}
                        onClick={() => changeView(part)}
                        aria-label={`${VIEW_LABELS[part]} 자세히 보기`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            <button
              type="button"
              className={`arc-track-model arc-track-model--next ${
                selectedView !== 'full' ? 'is-hidden' : ''
              }`}
              onClick={handleNextModel}
              disabled={selectedView !== 'full' || isSliding}
              aria-label={`${next.label} 보기`}
              onAnimationEnd={handleNextModelAnimationEnd}
            >
              <span className="arc-next-model-tag">NEXT</span>

              <div className="arc-model-canvas arc-model-canvas--preview">
                <img
                  className="arc-model-full-image"
                  src={next.images.full}
                  alt=""
                  draggable="false"
                />
              </div>
            </button>

            {selectedView === 'full' && isSliding && (
              <div className="arc-track-model arc-track-model--queued">
                <div className="arc-model-canvas arc-model-canvas--preview">
                  <img
                    className="arc-model-full-image"
                    src={afterNext.images.full}
                    alt=""
                    draggable="false"
                  />
                </div>
              </div>
            )}
          </div>
        </section>
      </section>

      {isCompact && (
        <div className="arc-mobile-look">
          <h2 className="arc-mobile-look__title">Collections</h2>

          <div className="arc-mobile-hero-wrap">
            <div
              className="arc-mobile-hero"
              onTouchStart={handleHeroTouchStart}
              onTouchEnd={handleHeroTouchEnd}
            >
              <img src={current.images.full} alt={`${current.label} 모델`} draggable="false" />

              {PARTS.map((part) => {
                const HotspotIcon = HOTSPOT_ICONS[part];
                const partProduct = currentProducts[part] ?? null;
                const partPath = getProductPath(partProduct ?? currentSet, current);

                return (
                  <Link
                    key={part}
                    to={partPath}
                    className={`arc-hotspot-pill arc-hotspot-pill--${part}`}
                    aria-label={`${VIEW_LABELS[part]} 자세히 보기`}
                  >
                    <span className="arc-hotspot-pill-icon">
                      <HotspotIcon />
                    </span>

                    <span className="arc-hotspot-pill-label">{HOTSPOT_LABELS[part]}</span>
                    <span className="arc-hotspot-pill-arrow">›</span>
                  </Link>
                );
              })}
            </div>

            <button
              type="button"
              className="arc-swipe-hint"
              onClick={goToNextModel}
              aria-label={`${next.label} 보기`}
            >
              <span className="arc-swipe-hint-arrow">›</span>
            </button>
          </div>

          <Link
            to={getProductPath(currentSet, current)}
            className="arc-set-summary"
            aria-label={`${currentSet?.name ?? current.label} 세트 상품 자세히 보기`}
          >
            <ProductApiImage
              key={`mobile-${current.id}`}
              product={currentSet}
              fallbackImage={current.images.top}
              className="arc-set-summary-thumb"
              alt=""
            />

            <div className="arc-set-summary-info">
              <p className="arc-set-summary-title">{currentSet?.name ?? current.label}</p>
              <p className="arc-set-summary-price">
                ₩ {Number(currentSet?.price ?? 0).toLocaleString()}
              </p>
            </div>

            <span className="arc-set-summary-divider" aria-hidden="true" />

            <span className="arc-set-summary-arrow" aria-hidden="true">
              ›
            </span>
          </Link>

          <Link to={getProductPath(currentSet, current)} className="arc-buy-button">
            <span>상세 설명</span>
          </Link>
        </div>
      )}
    </section>
  );
}

export default FeaturedLookSection;
