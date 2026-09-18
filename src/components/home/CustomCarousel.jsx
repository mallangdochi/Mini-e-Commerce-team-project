import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import kakiTop from '@/assets/home/kaki_top.webp';
import '@/styles/custom-carousel.css';

const COMPACT_QUERY = '(max-width: 768px)';

function useIsCompact() {
  const [compact, setCompact] = useState(() => window.matchMedia(COMPACT_QUERY).matches);

  useEffect(() => {
    const mql = window.matchMedia(COMPACT_QUERY);

    const onChange = (event) => {
      setCompact(event.matches);
    };

    mql.addEventListener('change', onChange);

    return () => {
      mql.removeEventListener('change', onChange);
    };
  }, []);

  return compact;
}

function ChevronLeft({ size = 18, className }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
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
      strokeWidth="2.5"
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
  outer: {
    label: '아우터',
  },
  tops: {
    label: '상의',
  },
  bottoms: {
    label: '하의',
  },
  shoes: {
    label: '신발',
  },
  sunglasses: {
    label: '선글라스',
  },
  hats: {
    label: '모자',
  },
};

const CATEGORY_ORDER = ['outer', 'tops', 'bottoms', 'shoes', 'sunglasses', 'hats'];

const DEFAULT_CATEGORY = CATEGORY_ORDER[0];

const POS = {
  CENTER: 'center',
  LEFT: 'left',
  RIGHT: 'right',
  FAR: 'far',
};

const EMPTY_CATEGORIES = {
  outer: [],
  tops: [],
  bottoms: [],
  shoes: [],
  sunglasses: [],
  hats: [],
};

const FALLBACK_IMAGE = kakiTop;

const SLIDE_MS = 420;

const TILE_WIDTH_DESKTOP = 440;
const TILE_WIDTH_COMPACT = 340;

function ProductTile({ product, position, onSelect, onStep, animate, compact, tileWidth }) {
  const isCenter = position === POS.CENTER;
  const isLeft = position === POS.LEFT;
  const isRight = position === POS.RIGHT;
  const isNear = isLeft || isRight;

  const centerScale = compact ? 'scale(1)' : 'scale(1.1)';
  const nearScale = compact ? 'scale(0.66)' : 'scale(0.5)';
  const farScale = compact ? 'scale(0.4)' : 'scale(0.3)';

  const wrapStyle = {
    width: tileWidth,
    transform: isCenter ? centerScale : isNear ? nearScale : farScale,
    opacity: isCenter ? 1 : isNear ? 0.45 : 0,
    filter: isCenter ? 'none' : isNear ? 'blur(1.5px)' : 'blur(2.5px)',
    transition: animate
      ? `transform ${SLIDE_MS}ms cubic-bezier(.22,.61,.36,1), opacity ${SLIDE_MS}ms ease, filter ${SLIDE_MS}ms ease`
      : 'none',
    pointerEvents: isCenter || isNear ? 'auto' : 'none',
  };

  const handleClick = isCenter
    ? () => onSelect(product)
    : isLeft
      ? () => onStep(-1)
      : isRight
        ? () => onStep(1)
        : undefined;

  return (
    <div style={wrapStyle} className="custom-carousel__tile">
      <button
        type="button"
        onClick={handleClick}
        className={`custom-carousel__tile-button ${
          isCenter
            ? 'custom-carousel__tile-button--center'
            : isNear
              ? 'custom-carousel__tile-button--near'
              : ''
        }`}
        aria-label={
          isCenter
            ? `${product.name} 상세보기`
            : isLeft
              ? `이전 상품: ${product.name}`
              : isRight
                ? `다음 상품: ${product.name}`
                : undefined
        }
        tabIndex={isCenter || isNear ? 0 : -1}
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
  const navigate = useNavigate();

  const source = useMemo(() => {
    if (Array.isArray(categories) && categories.length > 0) {
      return Object.fromEntries(categories.map((entry) => [entry.id, entry.products ?? []]));
    }

    if (categories && typeof categories === 'object') {
      return categories;
    }

    return EMPTY_CATEGORIES;
  }, [categories]);

  const compact = useIsCompact();
  const tileWidth = compact ? TILE_WIDTH_COMPACT : TILE_WIDTH_DESKTOP;

  const [category, setCategory] = useState(DEFAULT_CATEGORY);
  const [pos, setPos] = useState(null);
  const [animate, setAnimate] = useState(true);

  const items = source[category] ?? [];
  const len = items.length;

  const COPIES = 3;
  const slides = Array(COPIES).fill(items).flat();

  const displayPos = pos ?? len;

  const realIndex = len > 0 ? ((displayPos % len) + len) % len : 0;

  useEffect(() => {
    Object.values(source)
      .flat()
      .forEach((product) => {
        const image = new Image();
        image.src = product.imageUrl ?? product.image ?? FALLBACK_IMAGE;
      });
  }, [source]);

  useEffect(() => {
    if (animate) {
      return;
    }

    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setAnimate(true);
      });
    });

    return () => {
      cancelAnimationFrame(id);
    };
  }, [animate]);

  const changeCategory = (key) => {
    if (key === category) {
      return;
    }

    setAnimate(false);
    setPos(null);
    setCategory(key);
  };

  const go = (delta) => {
    if (len <= 1) {
      return;
    }

    setPos((current) => {
      const currentPosition = current ?? len;

      return currentPosition + delta;
    });
  };

  const handleTransitionEnd = (event) => {
    if (event.target !== event.currentTarget || event.propertyName !== 'transform' || len === 0) {
      return;
    }

    if (displayPos < len || displayPos >= len * 2) {
      setAnimate(false);
      setPos(len + realIndex);
    }
  };

  const goToIndex = (index) => {
    if (len === 0) {
      return;
    }

    setPos((current) => {
      const currentPosition = current ?? len;
      const currentIndex = ((currentPosition % len) + len) % len;

      let distance = index - currentIndex;

      if (distance > len / 2) {
        distance -= len;
      }

      if (distance < -len / 2) {
        distance += len;
      }

      return currentPosition + distance;
    });
  };

  const handleSelect = (product) => {
    const productId = product.productId ?? product.id;

    if (!productId) {
      return;
    }

    navigate(`/products/${productId}`);
  };

  const positionOf = (slot) => {
    const distance = slot - displayPos;

    if (distance === 0) {
      return POS.CENTER;
    }

    if (distance === -1) {
      return POS.LEFT;
    }

    if (distance === 1) {
      return POS.RIGHT;
    }

    return POS.FAR;
  };

  const tabs = (
    <nav className="custom-carousel__tabs" role="tablist" aria-label="상품 카테고리">
      {CATEGORY_ORDER.map((key) => {
        const active = key === category;

        return (
          <button
            key={key}
            type="button"
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

  if (isLoading || error || len === 0) {
    const message = isLoading
      ? '상품을 불러오는 중입니다…'
      : error
        ? '새로운 상품을 불러오지 못했습니다.'
        : '이 카테고리에 표시할 상품이 없습니다.';

    return (
      <div className="custom-carousel">
        <h1 className="custom-carousel__title">NEW &amp; TRENDING</h1>

        {tabs}

        <p className="custom-carousel__empty">{message}</p>
      </div>
    );
  }

  return (
    <div className="custom-carousel">
      <h1 className="custom-carousel__title">NEW &amp; TRENDING</h1>

      {tabs}

      <div className="custom-carousel__stage">
        <button
          type="button"
          onClick={() => go(-1)}
          aria-label="이전 상품"
          className="custom-carousel__arrow custom-carousel__arrow--overlay custom-carousel__arrow--prev"
        >
          <ChevronLeft size={18} />
        </button>

        <div className="custom-carousel__viewport">
          <div
            className="custom-carousel__track"
            onTransitionEnd={handleTransitionEnd}
            style={{
              transform: `translate(calc(-50% - ${
                (displayPos - (slides.length - 1) / 2) * tileWidth
              }px), -50%)`,
              transition: animate ? `transform ${SLIDE_MS}ms cubic-bezier(.22,.61,.36,1)` : 'none',
            }}
          >
            {slides.map((product, slot) => (
              <ProductTile
                key={`${category}-${product.productId ?? product.id}-${Math.floor(slot / len)}`}
                product={product}
                position={positionOf(slot)}
                onSelect={handleSelect}
                onStep={go}
                animate={animate}
                compact={compact}
                tileWidth={tileWidth}
              />
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={() => go(1)}
          aria-label="다음 상품"
          className="custom-carousel__arrow custom-carousel__arrow--overlay custom-carousel__arrow--next"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="custom-carousel__nav">
        <button
          type="button"
          onClick={() => go(-1)}
          aria-label="이전 상품"
          className="custom-carousel__arrow custom-carousel__arrow--inline"
        >
          <ChevronLeft size={16} />
        </button>

        <button
          type="button"
          onClick={() => handleSelect(items[realIndex])}
          className="custom-carousel__meta"
        >
          <span className="custom-carousel__meta-name">{items[realIndex].name}</span>

          <span className="custom-carousel__meta-price">
            ₩ {Number(items[realIndex].price ?? 0).toLocaleString()}
          </span>
        </button>

        <button
          type="button"
          onClick={() => go(1)}
          aria-label="다음 상품"
          className="custom-carousel__arrow custom-carousel__arrow--inline"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      <div className="custom-carousel__dots" role="tablist" aria-label="슬라이드 위치">
        {items.map((item, index) => (
          <button
            key={item.productId ?? item.id}
            type="button"
            aria-label={`${index + 1}번째 상품으로 이동`}
            onClick={() => goToIndex(index)}
            className="custom-carousel__dot"
            style={{
              width: index === realIndex ? 28 : 16,
              backgroundColor: index === realIndex ? '#111111' : '#DADADA',
            }}
          />
        ))}
      </div>
    </div>
  );
}
