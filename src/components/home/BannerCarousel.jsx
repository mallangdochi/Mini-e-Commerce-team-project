import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

import '@/styles/banner-carousel.css';

// TODO: SLIDES.video 를 실제 영상으로 교체 (현재 3슬라이드 모두 임시 공용 파일).
const SLIDES = [
  {
    id: 'wind-shell',
    to: '/products/wind-shell',
    video: '/main_video.mp4',
    topLeft: 'THE LIGHT WAY OUT',
    topRight: 'LAYER FOR THE WIND. PACK WHAT YOU NEED.',
    title: 'THE LIGHT WAY OUT',
    bottomMain: '가벼움으로 떠나는 데이 하이킹',
    bottomSub: '윈드셸 트레일 블레이저',
  },
  {
    id: 'product-2',
    to: '/products/product-2',
    video: '/main_video.mp4',
    topLeft: 'SLIDE TWO',
    topRight: 'SAMPLE CAPTION',
    title: 'SECOND ITEM',
    bottomMain: '두 번째 슬라이드 제목',
    bottomSub: '제품 설명 텍스트',
  },
  {
    id: 'product-3',
    to: '/products/product-3',
    video: '/main_video.mp4',
    topLeft: 'SLIDE THREE',
    topRight: 'SAMPLE CAPTION',
    title: 'THIRD ITEM',
    bottomMain: '세 번째 슬라이드 제목',
    bottomSub: '제품 설명 텍스트',
  },
];

const AUTO_INTERVAL = 5000; // ms
const SWIPE_THRESHOLD = 40; // px
const TOTAL = SLIDES.length;
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

const DOT_R = 5;
const DOT_CIRC = 2 * Math.PI * DOT_R;

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(() => window.matchMedia(REDUCED_MOTION_QUERY).matches);

  useEffect(() => {
    const mql = window.matchMedia(REDUCED_MOTION_QUERY);
    const onChange = (e) => setReduced(e.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  return reduced;
}

export default function BannerCarousel() {
  const reduced = usePrefersReducedMotion();
  const [current, setCurrent] = useState(0);
  const touchStartX = useRef(0);
  const videoRefs = useRef([]);

  // 이전 값 기준 이동은 무조건 함수형 업데이트 (자동전환과 경합해도 유실 없음)
  const step = (delta) => setCurrent((c) => (c + delta + TOTAL) % TOTAL);

  // 위치가 바뀌면 카운트다운 재시작. reduce-motion 이면 타이머 없음.
  useEffect(() => {
    if (reduced) return undefined;
    const id = setInterval(() => setCurrent((c) => (c + 1) % TOTAL), AUTO_INTERVAL);
    return () => clearInterval(id);
  }, [current, reduced]);

  useEffect(() => {
    videoRefs.current.forEach((video, i) => {
      if (!video) return;
      if (i === current) {
        video.currentTime = 0;
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    });
  }, [current]);

  const handleTouchStart = (e) => {
    touchStartX.current = e.changedTouches[0].screenX;
  };

  const handleTouchEnd = (e) => {
    const diff = e.changedTouches[0].screenX - touchStartX.current;
    if (Math.abs(diff) <= SWIPE_THRESHOLD) return;
    step(diff < 0 ? 1 : -1);
  };

  return (
    <div
      className="banner-carousel"
      role="region"
      aria-roledescription="carousel"
      aria-label="추천 배너"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <style>{`@keyframes bannerDotFill { to { stroke-dashoffset: 0; } }`}</style>

      {SLIDES.map((slide, i) => (
        <div
          key={slide.id}
          inert={i !== current}
          className={`banner-carousel__slide ${i === current ? 'banner-carousel__slide--active' : ''}`}
        >
          <Link
            to={slide.to}
            className="banner-carousel__link"
            aria-label={`${slide.title} 제품 페이지로 이동`}
          >
            <video
              ref={(el) => {
                videoRefs.current[i] = el;
              }}
              className="banner-carousel__video"
              muted
              loop
              playsInline
              preload={i === current ? 'auto' : 'metadata'}
            >
              <source src={slide.video} type="video/mp4" />
            </video>
          </Link>

          <div className="banner-carousel__scrim" />

          <div className="banner-carousel__text">
            <div className="banner-carousel__eyebrow">{slide.topLeft}</div>
            <div className="banner-carousel__caption">{slide.topRight}</div>
            <div className="banner-carousel__title">{slide.title}</div>
            <div className="banner-carousel__bottom">
              {slide.bottomMain}
              <br />
              <span className="banner-carousel__bottom-sub">{slide.bottomSub}</span>
            </div>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={() => step(-1)}
        aria-label="이전 슬라이드"
        className="banner-carousel__arrow banner-carousel__arrow--prev"
      >
        &#10094;
      </button>
      <button
        type="button"
        onClick={() => step(1)}
        aria-label="다음 슬라이드"
        className="banner-carousel__arrow banner-carousel__arrow--next"
      >
        &#10095;
      </button>

      <div className="banner-carousel__dots">
        {SLIDES.map((slide, i) => (
          <button
            key={slide.id}
            type="button"
            onClick={() => setCurrent(i)}
            aria-label={`${i + 1}번 슬라이드로 이동`}
            aria-current={i === current || undefined}
            className="banner-carousel__dot"
          >
            {i === current ? (
              <svg viewBox="0 0 12 12" className="banner-carousel__ring">
                <circle cx="6" cy="6" r={DOT_R} fill="none" strokeWidth="" />
                {!reduced && (
                  <circle
                    key={current}
                    cx="6"
                    cy="6"
                    r={DOT_R}
                    fill="none"
                    stroke="#fff"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeDasharray={DOT_CIRC}
                    strokeDashoffset={DOT_CIRC}
                    style={{ animation: `bannerDotFill ${AUTO_INTERVAL}ms linear forwards` }}
                  />
                )}
              </svg>
            ) : (
              <span className="banner-carousel__dot-idle" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
