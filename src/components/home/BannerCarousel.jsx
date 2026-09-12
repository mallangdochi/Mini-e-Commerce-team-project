import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

import '@/styles/banner-carousel.css';

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

const SLIDES = [
  {
    id: 'wind-shell',
    to: '/products/wind-shell',
    video: '/main_video_1.mp4',
    topLeft: 'THE LIGHT WAY OUT',
    topRight: 'LAYER FOR THE WIND. PACK WHAT YOU NEED.',
    title: 'THE LIGHT WAY OUT',
    bottomMain: '가벼움으로 떠나는 데이 하이킹',
    bottomSub: '윈드셸 트레일 블레이저',
  },
  {
    id: 'product-2',
    to: '/products/product-2',
    video: '/main_video_2.mp4',
    topLeft: 'SLIDE TWO',
    topRight: 'SAMPLE CAPTION',
    title: 'SECOND ITEM',
    bottomMain: '두 번째 슬라이드 제목',
    bottomSub: '제품 설명 텍스트',
  },
  {
    id: 'product-3',
    to: '/products/product-3',
    video: '/main_video_3.mp4',
    topLeft: 'SLIDE THREE',
    topRight: 'SAMPLE CAPTION',
    title: 'THIRD ITEM',
    bottomMain: '세 번째 슬라이드 제목',
    bottomSub: '제품 설명 텍스트',
  },
];

const DEFAULT_SLIDE_DURATION = 5000; // ms — 영상 길이를 아직 모를 때 fallback
const SWIPE_THRESHOLD = 40; // px
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

export default function BannerCarousel({ slides, isLoading = false, error = null }) {
  const data = Array.isArray(slides) && slides.length > 0 ? slides : SLIDES;
  const total = data.length;

  const reduced = usePrefersReducedMotion();
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const [durations, setDurations] = useState({});
  const touchStartX = useRef(0);
  const videoRefs = useRef([]);

  const step = (delta) => setCurrent((c) => (c + delta + total) % total);

  // reduced-motion일 땐 영상이 끝나도 자동 전환하지 않음
  const handleVideoEnded = () => {
    if (reduced) return;
    step(1);
  };

  const handleLoadedMetadata = (i) => (e) => {
    const { duration } = e.currentTarget;
    if (Number.isFinite(duration)) {
      setDurations((d) => ({ ...d, [i]: duration * 1000 }));
    }
  };

  // 슬라이드가 바뀌면 그 영상만 처음으로 되감기
  useEffect(() => {
    const video = videoRefs.current[current];
    if (video) video.currentTime = 0;
  }, [current]);

  // 활성 슬라이드이면서 재생 중일 때만 play, 그 외에는 pause
  useEffect(() => {
    videoRefs.current.forEach((video, i) => {
      if (!video) return;
      if (i === current && !paused) {
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    });
  }, [current, paused]);

  const handleTouchStart = (e) => {
    touchStartX.current = e.changedTouches[0].screenX;
  };

  const handleTouchEnd = (e) => {
    const diff = e.changedTouches[0].screenX - touchStartX.current;
    if (Math.abs(diff) <= SWIPE_THRESHOLD) return;
    step(diff < 0 ? 1 : -1);
  };

  // DEV에서는 에러를 무시하고 fallback 데이터로 렌더링을 계속함 — data가 항상 안전하게
  // fallback되는 것에 의존(위 61번 줄, slides가 없으면 SLIDES 사용). 배포 빌드에서만 에러 UI 노출.
  if (isLoading || (error && !import.meta.env.DEV)) {
    const message = isLoading ? '배너를 불러오는 중입니다…' : '배너를 불러오지 못했습니다.';

    return (
      <div className="banner-carousel banner-carousel--state" role="region" aria-label="추천 배너">
        <p className="banner-carousel__empty">{message}</p>
      </div>
    );
  }

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

      {data.map((slide, i) => (
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
              autoPlay={i === current}
              playsInline
              preload={i === current ? 'auto' : 'metadata'}
              onEnded={i === current ? handleVideoEnded : undefined}
              onLoadedMetadata={handleLoadedMetadata(i)}
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
        <ChevronLeft size={20} />
      </button>
      <button
        type="button"
        onClick={() => step(1)}
        aria-label="다음 슬라이드"
        className="banner-carousel__arrow banner-carousel__arrow--next"
      >
        <ChevronRight size={20} />
      </button>

      <div className="banner-carousel__dots">
        {!reduced && (
          <button
            type="button"
            onClick={() => setPaused((p) => !p)}
            aria-label={paused ? '슬라이드 자동 전환 재생' : '슬라이드 자동 전환 정지'}
            className="banner-carousel__toggle"
          >
            {paused ? (
              <svg viewBox="0 0 12 12" aria-hidden="true">
                <path d="M3 2l7 4-7 4z" fill="currentColor" />
              </svg>
            ) : (
              <svg viewBox="0 0 12 12" aria-hidden="true">
                <rect x="2.5" y="2" width="2.5" height="8" fill="currentColor" />
                <rect x="7" y="2" width="2.5" height="8" fill="currentColor" />
              </svg>
            )}
          </button>
        )}
        {data.map((slide, i) => (
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
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeDasharray={DOT_CIRC}
                    strokeDashoffset={DOT_CIRC}
                    style={{
                      animation: `bannerDotFill ${durations[current] ?? DEFAULT_SLIDE_DURATION}ms linear forwards`,
                      animationPlayState: paused ? 'paused' : 'running',
                    }}
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
