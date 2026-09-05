import { useState, useEffect, useRef, useMemo } from 'react';

import kakiTop from '@/assets/home/kaki_top.webp';
import '@/styles/custom-carousel.css';

function ChevronLeft({ size = 18, className }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

function ChevronRight({ size = 18, className }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

const CATEGORY_META = {
  tops: { label: '상의' },
  bottoms: { label: '하의' },
  sunglasses: { label: '선글라스' },
  hats: { label: '모자' },
};

const CATEGORY_ORDER = ['tops', 'bottoms', 'sunglasses', 'hats'];

const DEFAULT_CATEGORY = CATEGORY_ORDER[0];

const POS = {
  CENTER: 'center',
  LEFT: 'left',
  RIGHT: 'right',
  FAR: 'far',
};

// ---- placeholder catalogue ------------------------------------------
const CATALOGUE = {
  tops: [
    {
      id: '1',
      name: 'Endure Half-Zip',
      price: 89000,
      imageUrl: 'https://raw.githubusercontent.com/hyeramee/my-first-github/dev/images/Gemini_Generated_Image_jycecljycecljyce%202.png',
    },
    {
      id: '2',
      name: 'Foundation Tee',
      price: 39000,
      imageUrl: 'https://raw.githubusercontent.com/hyeramee/my-first-github/dev/images/Gemini_Generated_Image_jycecljycecljyce%202.png',
    },
    {
      id: '3',
      name: 'Trail Layer Hoodie',
      price: 119000,
      imageUrl: 'https://raw.githubusercontent.com/hyeramee/my-first-github/dev/images/Gemini_Generated_Image_jycecljycecljyce%202.png',
    },
    {
      id: '4',
      name: 'Base Performance Tee',
      price: 45000,
      imageUrl: 'https://raw.githubusercontent.com/hyeramee/my-first-github/dev/images/Gemini_Generated_Image_jycecljycecljyce%202.png',
    },
    {
      id: '5',
      name: 'Windshell Jacket',
      price: 149000,
      imageUrl: 'https://raw.githubusercontent.com/hyeramee/my-first-github/dev/images/Gemini_Generated_Image_jycecljycecljyce%202.png',
    },
    {
      id: '6',
      name: 'Ridge Quarter-Zip',
      price: 79000,
      imageUrl: 'https://raw.githubusercontent.com/hyeramee/my-first-github/dev/images/Gemini_Generated_Image_jycecljycecljyce%202.png',
    },
  ],
  bottoms: [
    {
      id: '7',
      name: 'Trail Jogger',
      price: 69000,
      imageUrl: 'https://raw.githubusercontent.com/hyeramee/my-first-github/dev/images/Gemini_Generated_Image_jycecljycecljyce%202.png',
    },
    {
      id: '8',
      name: 'Enhance Short 7"',
      price: 42000,
      imageUrl: 'https://raw.githubusercontent.com/hyeramee/my-first-github/dev/images/Gemini_Generated_Image_jycecljycecljyce%202.png',
    },
    {
      id: '9',
      name: 'All Elements Pant',
      price: 99000,
      imageUrl: 'https://raw.githubusercontent.com/hyeramee/my-first-github/dev/images/Gemini_Generated_Image_jycecljycecljyce%202.png',
    },
    {
      id: '10',
      name: 'Foundation Legging',
      price: 55000,
      imageUrl: 'https://raw.githubusercontent.com/hyeramee/my-first-github/dev/images/Gemini_Generated_Image_jycecljycecljyce%202.png',
    },
    {
      id: '11',
      name: 'Traverse Cargo',
      price: 89000,
      imageUrl: 'https://raw.githubusercontent.com/hyeramee/my-first-github/dev/images/Gemini_Generated_Image_jycecljycecljyce%202.png',
    },
    {
      id: '12',
      name: 'Endure Track Pant',
      price: 65000,
      imageUrl: 'https://raw.githubusercontent.com/hyeramee/my-first-github/dev/images/Gemini_Generated_Image_jycecljycecljyce%202.png',
    },
  ],
  sunglasses: [
    {
      id: '13',
      name: 'Custom Radar® Ev',
      price: 189000,
      imageUrl: 'https://raw.githubusercontent.com/hyeramee/my-first-github/dev/images/Gemini_Generated_Image_jycecljycecljyce%202.png',
    },
    {
      id: '14',
      name: 'Custom Holbrook',
      price: 179000,
      imageUrl: 'https://raw.githubusercontent.com/hyeramee/my-first-github/dev/images/Gemini_Generated_Image_jycecljycecljyce%202.png',
    },
    {
      id: '15',
      name: 'Custom Sutro',
      price: 169000,
      imageUrl: 'https://raw.githubusercontent.com/hyeramee/my-first-github/dev/images/Gemini_Generated_Image_jycecljycecljyce%202.png',
    },
    {
      id: '16',
      name: 'Custom EVZero',
      price: 199000,
      imageUrl: 'https://raw.githubusercontent.com/hyeramee/my-first-github/dev/images/Gemini_Generated_Image_jycecljycecljyce%202.png',
    },
    {
      id: '17',
      name: 'Custom Jawbreaker',
      price: 175000,
      imageUrl: 'https://raw.githubusercontent.com/hyeramee/my-first-github/dev/images/Gemini_Generated_Image_jycecljycecljyce%202.png',
    },
    {
      id: '18',
      name: 'Custom Flak® 2.0',
      price: 159000,
      imageUrl: 'https://raw.githubusercontent.com/hyeramee/my-first-github/dev/images/Gemini_Generated_Image_jycecljycecljyce%202.png',
    },
  ],
  hats: [
    {
      id: '19',
      name: 'Ellipse Snapback',
      price: 39000,
      imageUrl: 'https://raw.githubusercontent.com/hyeramee/my-first-github/dev/images/Gemini_Generated_Image_jycecljycecljyce%202.png',
    },
    {
      id: '20',
      name: 'Trail Trucker',
      price: 42000,
      imageUrl: 'https://raw.githubusercontent.com/hyeramee/my-first-github/dev/images/Gemini_Generated_Image_jycecljycecljyce%202.png',
    },
    {
      id: '21',
      name: 'Performance Visor',
      price: 35000,
      imageUrl: 'https://raw.githubusercontent.com/hyeramee/my-first-github/dev/images/Gemini_Generated_Image_jycecljycecljyce%202.png',
    },
    {
      id: '22',
      name: 'Six-Panel Cap',
      price: 45000,
      imageUrl: 'https://raw.githubusercontent.com/hyeramee/my-first-github/dev/images/Gemini_Generated_Image_jycecljycecljyce%202.png',
    },
    {
      id: '23',
      name: 'Bucket Hat',
      price: 32000,
      imageUrl: 'https://raw.githubusercontent.com/hyeramee/my-first-github/dev/images/Gemini_Generated_Image_jycecljycecljyce%202.png',
    },
    {
      id: '24',
      name: 'Ridge Beanie',
      price: 38000,
      imageUrl: 'https://raw.githubusercontent.com/hyeramee/my-first-github/dev/images/Gemini_Generated_Image_jycecljycecljyce%202.png',
    },
  ],
};

const FALLBACK_IMAGE = kakiTop;

const SLIDE_MS = 420;

const TILE_WIDTH = 440;

function ProductTile({ product, position, onSelect, animate }) {
  const isCenter = position === POS.CENTER;
  const isNear = position === POS.LEFT || position === POS.RIGHT;

  const wrapStyle = {
    width: TILE_WIDTH,
    transform: isCenter ? 'scale(1.1)' : isNear ? 'scale(0.5)' : 'scale(0.3)',
    opacity: isCenter ? 1 : isNear ? 0.45 : 0.18,
    filter: isCenter ? 'none' : isNear ? 'blur(1.5px)' : 'blur(2.5px)',
    transition: animate
      ? `transform ${SLIDE_MS}ms cubic-bezier(.22,.61,.36,1), opacity ${SLIDE_MS}ms ease, filter ${SLIDE_MS}ms ease`
      : 'none',
    pointerEvents: isCenter ? 'auto' : 'none',
  };

  return (
    <div style={wrapStyle} className="custom-carousel__tile">
      <button
        type="button"
        onClick={isCenter ? () => onSelect(product) : undefined}
        className={`custom-carousel__tile-button ${
          isCenter ? 'custom-carousel__tile-button--center' : ''
        }`}
        aria-label={isCenter ? `${product.name} 상세보기` : undefined}
        tabIndex={isCenter ? 0 : -1}
      >
        <img
          src={product.imageUrl ?? product.image ?? FALLBACK_IMAGE}
          alt={`${product.name} 상품 이미지`}
          className="custom-carousel__tile-image"
        />
      </button>
    </div>
  );
}

export default function CustomCarousel({ categories, isLoading = false, error = null }) {
  const source = useMemo(() => {
    if (Array.isArray(categories) && categories.length > 0) {
      return Object.fromEntries(categories.map((entry) => [entry.id, entry.products ?? []]));
    }

    if (categories && typeof categories === 'object') {
      return categories;
    }

    return CATALOGUE;
  }, [categories]);

  const [category, setCategory] = useState(DEFAULT_CATEGORY);
  const items = source[category] ?? [];
  const len = items.length;

  const COPIES = 3;
  const slides = Array(COPIES).fill(items).flat();

  const [pos, setPos] = useState(len);
  const [animate, setAnimate] = useState(true);
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  const realIndex = ((pos % len) + len) % len;

  useEffect(() => {
    return () => clearTimeout(toastTimer.current);
  }, []);

  useEffect(() => {
    Object.values(source)
      .flat()
      .forEach((p) => {
        const img = new Image();
        img.src = p.imageUrl ?? p.image ?? FALLBACK_IMAGE;
      });
  }, [source]);

  useEffect(() => {
    if (animate) return;
    const id = requestAnimationFrame(() => requestAnimationFrame(() => setAnimate(true)));
    return () => cancelAnimationFrame(id);
  }, [animate]);

  const changeCategory = (key) => {
    setCategory(key);
    setAnimate(false);
    setPos((source[key] ?? []).length);
  };

  const go = (delta) => setPos((p) => p + delta);

  const handleTransitionEnd = (e) => {
    if (e.target !== e.currentTarget || e.propertyName !== 'transform') return;
    if (pos < len || pos >= len * 2) {
      setAnimate(false);
      setPos(len + realIndex);
    }
  };

  const goToIndex = (i) => {
    setPos((p) => {
      const cur = ((p % len) + len) % len;
      let d = i - cur;
      if (d > len / 2) d -= len;
      if (d < -len / 2) d += len;
      return p + d;
    });
  };

  const handleSelect = (product) => {
    setToast(`${product.name} 상세 페이지로 이동합니다`);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2200);
  };

  const positionOf = (slot) => {
    const dist = slot - pos;
    if (dist === 0) return POS.CENTER;
    if (dist === -1) return POS.LEFT;
    if (dist === 1) return POS.RIGHT;
    return POS.FAR;
  };

  const tabs = (
    <nav className="custom-carousel__tabs" role="tablist" aria-label="상품 카테고리">
      {CATEGORY_ORDER.map((key) => {
        const active = key === category;
        return (
          <button
            key={key}
            role="tab"
            aria-selected={active}
            onClick={() => changeCategory(key)}
            className={`custom-carousel__tab ${active ? 'custom-carousel__tab--active' : ''}`}
          >
            {CATEGORY_META[key].label}
            <span
              className="custom-carousel__tab-underline"
              style={{
                backgroundColor: active ? '#111111' : 'transparent',
                transform: active ? 'scaleX(1)' : 'scaleX(0.4)',
              }}
            />
          </button>
        );
      })}
    </nav>
  );

  // DEV에서는 에러를 무시하고 fallback 데이터로 렌더링을 계속함 — source가 항상 안전하게
  // CATALOGUE로 fallback되는 것에 의존(위 소스 정규화 로직). 배포 빌드에서만 에러 UI 노출.
  const showErrorState = error && !import.meta.env.DEV;

  if (isLoading || showErrorState || len === 0) {
    const message = isLoading
      ? '상품을 불러오는 중입니다…'
      : showErrorState
        ? '새로운 상품을 불러오지 못했습니다.'
        : '이 카테고리에 표시할 상품이 없습니다.';

    return (
      <div className="custom-carousel">
        <h1 className="custom-carousel__title">NEW & TRENDING</h1>
        {tabs}
        <p className="custom-carousel__empty">{message}</p>
      </div>
    );
  }

  return (
    <div className="custom-carousel">
      {/* header */}
      <h1 className="custom-carousel__title">NEW & TRENDING</h1>

      {/* category tabs */}
      {tabs}

      {/* carousel */}
      <div className="custom-carousel__viewport">
        <button
          type="button"
          onClick={() => go(-1)}
          aria-label="이전 상품"
          className="custom-carousel__arrow custom-carousel__arrow--prev"
        >
          <ChevronLeft size={22} />
        </button>

        <div
          className="custom-carousel__track"
          onTransitionEnd={handleTransitionEnd}
          style={{
            transform: `translate(calc(-50% - ${(pos - (slides.length - 1) / 2) * TILE_WIDTH}px), -50%)`,
            transition: animate ? `transform ${SLIDE_MS}ms cubic-bezier(.22,.61,.36,1)` : 'none',
          }}
        >
          {slides.map((product, slot) => (
            <ProductTile
              key={`${category}-${product.id}-${Math.floor(slot / len)}`}
              product={product}
              position={positionOf(slot)}
              onSelect={handleSelect}
              animate={animate}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={() => go(1)}
          aria-label="다음 상품"
          className="custom-carousel__arrow custom-carousel__arrow--next"
        >
          <ChevronRight size={22} />
        </button>
      </div>

      {/* product name + price */}
      <button
        type="button"
        onClick={() => handleSelect(items[realIndex])}
        className="custom-carousel__meta"
      >
        <span className="custom-carousel__meta-name">{items[realIndex].name}</span>
        <span className="custom-carousel__meta-price">
          ₩ {items[realIndex].price.toLocaleString()}
        </span>
      </button>

      {/* indicators */}
      <div className="custom-carousel__dots" role="tablist" aria-label="슬라이드 위치">
        {items.map((it, i) => (
          <button
            key={it.id}
            aria-label={`${i + 1}번째 상품로 이동`}
            onClick={() => goToIndex(i)}
            className="custom-carousel__dot"
            style={{
              width: i === realIndex ? 28 : 16,
              backgroundColor: i === realIndex ? '#111111' : '#DADADA',
            }}
          />
        ))}
      </div>

      {/* toast */}
      <div className={`custom-carousel__toast ${toast ? 'custom-carousel__toast--visible' : ''}`}>
        {toast}
      </div>
    </div>
  );
}
