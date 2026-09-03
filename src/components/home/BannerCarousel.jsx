import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

// 홈 영상 배너 캐러셀 (풀블리드, 2:1 비율)
// - 슬라이드 클릭 → to(제품 페이지)로 이동
// - 화살표 / 하단 점으로 수동 이동
// - AUTO_INTERVAL 마다 자동 전환, 무한 순환. 위치가 바뀌면 카운트다운 재시작
// - prefers-reduced-motion 이면 자동 전환·트랜지션 없음
//
// TODO: SLIDES.video 를 실제 영상으로 교체 (public/ 또는 외부 호스팅), to 도 실제 경로로.
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

// 브라우저 미디어쿼리 구독 — 세션 중 OS 설정 변경도 반영, 리스너는 클린업에서 회수
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

  // 활성 슬라이드 영상만 재생, 나머지는 정지
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
      className="relative aspect-[2/1] w-full overflow-hidden bg-black"
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
          className={`absolute inset-0 ${i === current ? 'opacity-100' : 'opacity-0'}`}
        >
          <Link
            to={slide.to}
            className="absolute inset-0 block"
            aria-label={`${slide.title} 제품 페이지로 이동`}
          >
            <video
              ref={(el) => {
                videoRefs.current[i] = el;
              }}
              className="absolute inset-0 h-full w-full object-cover"
              muted
              loop
              playsInline
              preload={i === current ? 'auto' : 'metadata'}
            >
              <source src={slide.video} type="video/mp4" />
            </video>
          </Link>

          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.35)_0%,rgba(0,0,0,0)_30%,rgba(0,0,0,0)_60%,rgba(0,0,0,0.55)_100%)]" />

          <div className="pointer-events-none absolute inset-0 z-[2] text-white">
            <div className="absolute left-8 top-7 text-[13px] uppercase tracking-[2px] opacity-90">
              {slide.topLeft}
            </div>
            <div className="absolute right-8 top-7 text-[12px] italic tracking-[0.5px] opacity-85">
              {slide.topRight}
            </div>
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap text-center text-[64px] font-extrabold tracking-[6px] [text-shadow:0_2px_12px_rgba(0,0,0,0.35)]">
              {slide.title}
            </div>
            <div className="absolute bottom-[30px] left-8 text-[15px] leading-[1.6]">
              {slide.bottomMain}
              <br />
              <span className="text-[13px] opacity-85">{slide.bottomSub}</span>
            </div>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={() => step(-1)}
        aria-label="이전 슬라이드"
        className="absolute left-5 top-1/2 z-[5] flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/35 text-xl text-white transition-colors hover:bg-black/60"
      >
        &#10094;
      </button>
      <button
        type="button"
        onClick={() => step(1)}
        aria-label="다음 슬라이드"
        className="absolute right-5 top-1/2 z-[5] flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/35 text-xl text-white transition-colors hover:bg-black/60"
      >
        &#10095;
      </button>

      <div className="absolute bottom-7 right-8 z-[5] flex items-center gap-3">
        {SLIDES.map((slide, i) => (
          <button
            key={slide.id}
            type="button"
            onClick={() => setCurrent(i)}
            aria-label={`${i + 1}번 슬라이드로 이동`}
            aria-current={i === current || undefined}
            className="flex h-6 w-6 items-center justify-center"
          >
            {i === current ? (
              <svg viewBox="0 0 12 12" className="h-3 w-3 -rotate-90">
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
              <span className="h-3 w-3 rounded-full bg-white/85" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
