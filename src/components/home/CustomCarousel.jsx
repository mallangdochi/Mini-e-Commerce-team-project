import { useState, useEffect, useRef } from 'react';

import kakiTop from '@/assets/home/kaki_top.webp';

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

// ---- design tokens -------------------------------------------------
const CATEGORY_META = {
  tops: { label: '상의' },
  bottoms: { label: '하의' },
  sunglasses: { label: '선글라스' },
  hats: { label: '모자' },
};

const CATEGORY_ORDER = ['tops', 'bottoms', 'sunglasses', 'hats'];

const DEFAULT_CATEGORY = CATEGORY_ORDER[0];

// 트랙에서 타일이 놓인 위치. 문자열을 여러 곳에 흩뿌리지 않도록 상수화.
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

// 상품 이미지 (추후 상품별로 다른 파일을 product.image 에 매핑 예정)
const FALLBACK_IMAGE = kakiTop;

// 슬라이드 트랜지션 길이 (트랙 이동 / 타일 확대를 동일하게 맞춘다)
const SLIDE_MS = 420;

// 타일 하나가 차지하는 폭(px). 래퍼 width 와 트랙 translateX 계산의 단일 소스.
const TILE_WIDTH = 440;

// ---- single product tile --------------------------------------------
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
    <div style={wrapStyle} className="flex-shrink-0 flex items-center justify-center">
      <button
        type="button"
        onClick={isCenter ? () => onSelect(product) : undefined}
        className={`group relative flex items-center justify-center w-[680px] h-[460px] rounded-none bg-transparent ${
          isCenter ? 'cursor-pointer' : 'cursor-default'
        }`}
        aria-label={isCenter ? `${product.name} 상세보기` : undefined}
        tabIndex={isCenter ? 0 : -1}
      >
        <img
          src={product.image ?? FALLBACK_IMAGE}
          alt={`${product.name} 상품 이미지`}
          className="w-full h-full object-contain drop-shadow-[0_18px_18px_rgba(0,0,0,0.12)]"
        />
      </button>
    </div>
  );
}

export default function CustomCarousel() {
  const [category, setCategory] = useState(DEFAULT_CATEGORY);
  const items = CATALOGUE[category] ?? [];
  const len = items.length;

  // 상품 배열을 COPIES 벌 이어붙인 트랙. 가운데 벌을 기준으로 슬라이드한다.
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

  // 전체 카탈로그 이미지 프리로드 — 카테고리 전환/슬라이드 시 빈칸·이전 이미지 잔상 방지
  useEffect(() => {
    Object.values(CATALOGUE)
      .flat()
      .forEach((p) => {
        const img = new Image();
        img.src = p.image ?? FALLBACK_IMAGE;
      });
  }, []);

  // 스냅 직후 다음 프레임에 애니메이션 재활성화
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
    <nav className="mt-6 flex items-center gap-10" role="tablist" aria-label="상품 카테고리">
      {CATEGORY_ORDER.map((key) => {
        const active = key === category;
        return (
          <button
            key={key}
            role="tab"
            aria-selected={active}
            onClick={() => changeCategory(key)}
            className={`relative pb-2 text-[15px] transition-colors duration-200 ${
              active
                ? 'text-neutral-900 font-semibold'
                : 'text-neutral-400 hover:text-neutral-600 font-normal'
            }`}
          >
            {CATEGORY_META[key].label}
            <span
              className="absolute left-0 right-0 -bottom-[1px] h-[2px] rounded-full transition-all duration-300"
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

  const shellClass =
    'w-full min-h-[760px] bg-white mx-auto flex flex-col items-center py-16 select-none';

  // 빈 카테고리 가드 — len 을 쓰는 계산(realIndex, translateX 등)이 NaN 나기 전에 차단
  if (len === 0) {
    return (
      <div className={shellClass}>
        <h1 className="text-[26px] font-extrabold tracking-tight text-neutral-900">
          NEW & TRENDING
        </h1>
        {tabs}
        <p className="mt-20 text-[15px] text-neutral-500">이 카테고리에 표시할 상품이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className={shellClass}>
      {/* header */}
      <h1 className="text-[26px] font-extrabold tracking-tight text-neutral-900">NEW & TRENDING</h1>

      {/* category tabs */}
      {tabs}

      {/* carousel */}
      <div className="relative w-full max-w-none h-[460px] mt-0 flex items-center justify-center overflow-hidden">
        <button
          type="button"
          onClick={() => go(-1)}
          aria-label="이전 상품"
          className="absolute left-4 z-10 w-12 h-12 flex items-center justify-center rounded-full border border-neutral-200 bg-white/90 hover:bg-neutral-100 transition-colors"
        >
          <ChevronLeft size={22} className="text-neutral-700" />
        </button>

        <div
          className="absolute top-1/2 left-1/2 flex items-center"
          onTransitionEnd={handleTransitionEnd}
          style={{
            transform: `translate(calc(-50% - ${(pos - (slides.length - 1) / 2) * TILE_WIDTH}px), -50%)`,
            transition: animate ? `transform ${SLIDE_MS}ms cubic-bezier(.22,.61,.36,1)` : 'none',
          }}
        >
          {slides.map((product, slot) => (
            // key 에 category 와 복제 벌 번호(Math.floor(slot / len))를 포함 — 카테고리 전환 시
            // 타일을 새로 마운트해 이전 상품 <img> 재사용 잔상 방지. 한 카테고리 안에서는 slot 별로 고정.
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
          className="absolute right-4 z-10 w-12 h-12 flex items-center justify-center rounded-full border border-neutral-200 bg-white/90 hover:bg-neutral-100 transition-colors"
        >
          <ChevronRight size={22} className="text-neutral-700" />
        </button>
      </div>

      {/* product name + price */}
      <button
        type="button"
        onClick={() => handleSelect(items[realIndex])}
        className="group mt-2 flex flex-col items-center gap-2"
      >
        <span className="text-[24px] text-neutral-900 group-hover:underline underline-offset-4 decoration-neutral-300">
          {items[realIndex].name}
        </span>
        <span className="text-[15px] tracking-wide text-neutral-500">
          ₩ {items[realIndex].price.toLocaleString()}
        </span>
      </button>

      {/* indicators */}
      <div className="mt-8 flex items-center gap-2" role="tablist" aria-label="슬라이드 위치">
        {items.map((it, i) => (
          <button
            key={it.id}
            aria-label={`${i + 1}번째 상품로 이동`}
            onClick={() => goToIndex(i)}
            className="h-[4px] rounded-full transition-all duration-300"
            style={{
              width: i === realIndex ? 28 : 16,
              backgroundColor: i === realIndex ? '#111111' : '#DADADA',
            }}
          />
        ))}
      </div>

      {/* toast */}
      <div
        className={`fixed bottom-8 left-1/2 -translate-x-1/2 px-5 py-3 rounded-full bg-neutral-900 text-white text-[13px] shadow-lg transition-all duration-300 ${
          toast ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
        }`}
      >
        {toast}
      </div>
    </div>
  );
}
