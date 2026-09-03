import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

import mainBanner2 from '@/assets/home/main_banner_2.webp';
import '@/styles/hero.css';

// TODO: imgMain1 / imgArrow 는 Figma 임시 CDN(약 7일 만료) 더미. 실제 에셋으로 교체할 것.
const imgMain1 = 'https://www.figma.com/api/mcp/asset/6d276a60-ba49-47b0-9343-1d0e462fc0ff.png';
const imgArrow = 'https://www.figma.com/api/mcp/asset/dd69c1a6-f95b-413d-b447-0506f8f80c86.svg';

const BASE_WIDTH = 1440;

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

  return (
    <section ref={containerRef} className="hero">
      <div className="hero__stage" style={{ transform: `scale(${scale})` }}>
        {/* Background photo */}
        <div className="hero__bg">
          <img alt="" className="hero__bg-img" src={imgMain1} />
          <div className="hero__bg-overlay" />
        </div>

        {/* Bottom banner — 대각선으로 잘라낸 밴드를 main_banner_2 가 차지 */}
        <div className="hero__band">
          <img alt="" className="hero__band-img" src={mainBanner2} />

          <div className="hero__band-lead">
            <p>TRUSTED</p>
            <p>BY</p>
          </div>

          <p className="hero__band-sub">PROVEN IN MOTION</p>

          <div className="hero__band-athletes">
            <p className="hero__band-athletes-sm">THE BEST</p>
            <p className="hero__band-athletes-lg">ATHLETES</p>
          </div>
        </div>

        {/* Headline */}

        {/* Subheadline */}

        {/* CTA */}
        <Link to="/products" className="hero__cta">
          <span className="hero__cta-text">자세히 보기</span>
          <span className="hero__cta-spacer" />
          <img alt="" className="hero__cta-arrow" src={imgArrow} />
        </Link>
      </div>
    </section>
  );
}
