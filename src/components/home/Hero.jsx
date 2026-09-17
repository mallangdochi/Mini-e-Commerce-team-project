import { useEffect, useRef, useState } from 'react';

import heroMain from '@/assets/home/hero_main.webp';
import heroMainTwo from '@/assets/home/hero_main_two.webp';
import mainBanner2 from '@/assets/home/main_banner_2.webp';
import '@/styles/hero.css';

const BASE_WIDTH = 1440;
const SLIDE_DURATION = 5000;
const SWIPE_THRESHOLD = 40;
const DOT_R = 5;
const DOT_CIRC = 2 * Math.PI * DOT_R;

const HERO_SLIDES = [
  { id: 'hero-main', src: heroMain },
  { id: 'hero-main-two', src: heroMainTwo },
];

function useFitScale(baseWidth) {
  const ref = useRef(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;

    const update = () => setScale(el.clientWidth / baseWidth);
    update();

    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, [baseWidth]);

  return [ref, scale];
}

export default function Hero() {
  const [containerRef, scale] = useFitScale(BASE_WIDTH);
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const touchStartX = useRef(0);

  const step = (delta) => {
    setCurrent((index) => (index + delta + HERO_SLIDES.length) % HERO_SLIDES.length);
  };

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updatePreference = () => setReducedMotion(mediaQuery.matches);

    updatePreference();
    mediaQuery.addEventListener('change', updatePreference);
    return () => mediaQuery.removeEventListener('change', updatePreference);
  }, []);

  useEffect(() => {
    if (paused || reducedMotion) return undefined;

    const timer = window.setTimeout(() => step(1), SLIDE_DURATION);
    return () => window.clearTimeout(timer);
  }, [current, paused, reducedMotion]);

  const handleTouchStart = (event) => {
    touchStartX.current = event.changedTouches[0].screenX;
  };

  const handleTouchEnd = (event) => {
    const distance = event.changedTouches[0].screenX - touchStartX.current;
    if (Math.abs(distance) <= SWIPE_THRESHOLD) return;
    step(distance < 0 ? 1 : -1);
  };

  return (
    <section
      ref={containerRef}
      className="hero"
      aria-roledescription="carousel"
      aria-label="메인 배너"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="hero__stage" style={{ transform: `scale(${scale})` }}>
        <style>{`@keyframes heroDotFill { to { stroke-dashoffset: 0; } }`}</style>

        {/* Background photo */}
        <div className="hero__bg">
          {HERO_SLIDES.map((slide, index) => (
            <div
              key={slide.id}
              className={`hero__bg-slide ${index === current ? 'hero__bg-slide--active' : ''}`}
              aria-hidden={index !== current}
            >
              <img alt="" className="hero__bg-img" src={slide.src} />
            </div>
          ))}
        </div>

        <div className="hero__dots">
          {!reducedMotion && (
            <button
              type="button"
              className="hero__toggle"
              aria-label={paused ? '슬라이드 자동 전환 재생' : '슬라이드 자동 전환 정지'}
              onClick={() => setPaused((value) => !value)}
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

          {HERO_SLIDES.map((slide, index) => (
            <button
              key={slide.id}
              type="button"
              className="hero__dot"
              aria-label={`${index + 1}번 슬라이드로 이동`}
              aria-current={index === current || undefined}
              onClick={() => setCurrent(index)}
            >
              {index === current ? (
                <svg viewBox="0 0 12 12" className="hero__ring">
                  <circle cx="6" cy="6" r={DOT_R} fill="none" />
                  {!reducedMotion && (
                    <circle
                      key={current}
                      cx="6"
                      cy="6"
                      r={DOT_R}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeDasharray={DOT_CIRC}
                      strokeDashoffset={DOT_CIRC}
                      style={{
                        animation: `heroDotFill ${SLIDE_DURATION}ms linear forwards`,
                        animationPlayState: paused ? 'paused' : 'running',
                      }}
                    />
                  )}
                </svg>
              ) : (
                <span className="hero__dot-idle" />
              )}
            </button>
          ))}
        </div>

        {/* Bottom banner — 대각선으로 잘라낸 밴드를 main_banner_2 가 차지 */}
        <div className="hero__band">
          <img alt="" className="hero__band-img" src={mainBanner2} />

          <div className="hero__band-lead">
            <p>TRUSTED</p>
            <p>BY</p>
          </div>

          <p className="hero__band-sub">EVERYDAY ATHLETES</p>

          <div className="hero__band-proof">
            <p className="hero__band-proof-sm">PROVEN IN</p>
            <p className="hero__band-proof-lg">MOTION</p>
          </div>
        </div>
      </div>
    </section>
  );
}
