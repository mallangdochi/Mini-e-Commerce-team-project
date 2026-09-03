import { useState, useEffect, useRef } from 'react';

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
    { id: 't1', name: 'Endure Half-Zip', shade: '#22314A', price: 89000 },
    { id: 't2', name: 'Foundation Tee', shade: '#33465F', price: 39000 },
    { id: 't3', name: 'Trail Layer Hoodie', shade: '#1B2A40', price: 119000 },
    { id: 't4', name: 'Base Performance Tee', shade: '#3D5474', price: 45000 },
    { id: 't5', name: 'Windshell Jacket', shade: '#26374F', price: 149000 },
    { id: 't6', name: 'Ridge Quarter-Zip', shade: '#2D4160', price: 79000 },
  ],
  bottoms: [
    { id: 'b1', name: 'Trail Jogger', shade: '#4C5A34', price: 69000 },
    { id: 'b2', name: 'Enhance Short 7"', shade: '#5B6B3F', price: 42000 },
    { id: 'b3', name: 'All Elements Pant', shade: '#3E4A2A', price: 99000 },
    { id: 'b4', name: 'Foundation Legging', shade: '#66774A', price: 55000 },
    { id: 'b5', name: 'Traverse Cargo', shade: '#455328', price: 89000 },
    { id: 'b6', name: 'Endure Track Pant', shade: '#556238', price: 65000 },
  ],
  sunglasses: [
    { id: 's1', name: 'Custom Radar® Ev', shade: '#2E6690', price: 189000 },
    { id: 's2', name: 'Custom Holbrook', shade: '#3E7CB1', price: 179000 },
    { id: 's3', name: 'Custom Sutro', shade: '#4A8CC2', price: 169000 },
    { id: 's4', name: 'Custom EVZero', shade: '#25587E', price: 199000 },
    { id: 's5', name: 'Custom Jawbreaker', shade: '#5A9AD1', price: 175000 },
    { id: 's6', name: 'Custom Flak® 2.0', shade: '#347098', price: 159000 },
  ],
  hats: [
    { id: 'h1', name: 'Ellipse Snapback', shade: '#B98424', price: 39000 },
    { id: 'h2', name: 'Trail Trucker', shade: '#C99A2E', price: 42000 },
    { id: 'h3', name: 'Performance Visor', shade: '#A5731C', price: 35000 },
    { id: 'h4', name: 'Six-Panel Cap', shade: '#D4A63C', price: 45000 },
    { id: 'h5', name: 'Bucket Hat', shade: '#96691A', price: 32000 },
    { id: 'h6', name: 'Ridge Beanie', shade: '#BE8B26', price: 38000 },
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
    transform: isCenter ? 'scale(1)' : isNear ? 'scale(0.68)' : 'scale(0.46)',
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
          src={product.image ?? FALLBACK_IMAGE}
          alt={`${product.name} 상품 이미지`}
          className="custom-carousel__tile-image"
        />
      </button>
    </div>
  );
}

export default function CustomCarousel() {
  const [category, setCategory] = useState(DEFAULT_CATEGORY);
  const items = CATALOGUE[category] ?? [];
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
    Object.values(CATALOGUE)
      .flat()
      .forEach((p) => {
        const img = new Image();
        img.src = p.image ?? FALLBACK_IMAGE;
      });
  }, []);

  useEffect(() => {
    if (animate) return;
    const id = requestAnimationFrame(() => requestAnimationFrame(() => setAnimate(true)));
    return () => cancelAnimationFrame(id);
  }, [animate]);

  const changeCategory = (key) => {
    setCategory(key);
    setAnimate(false);
    setPos(CATALOGUE[key].length);
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

  if (len === 0) {
    return (
      <div className="custom-carousel">
        <h1 className="custom-carousel__title">NEW & TRENDING</h1>
        {tabs}
        <p className="custom-carousel__empty">이 카테고리에 표시할 상품이 없습니다.</p>
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
