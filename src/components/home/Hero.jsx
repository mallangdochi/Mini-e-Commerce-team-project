import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

import mainBanner2 from '@/assets/home/main_banner_2.webp';

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
    <section
      ref={containerRef}
      className="relative w-full overflow-hidden bg-black"
      style={{ aspectRatio: '1440 / 781' }}
    >
      <div
        className="absolute left-0 top-0 h-[781px] w-[1440px] origin-top-left"
        style={{ transform: `scale(${scale})` }}
      >
        {/* Background photo */}
        <div className="absolute left-0 top-0 h-[642px] w-[1604px]">
          <img
            alt=""
            className="absolute inset-0 size-full max-w-none object-cover"
            src={imgMain1}
          />
          <div className="absolute inset-0 bg-black/20" />
        </div>

        {/* Bottom banner — 대각선으로 잘라낸 밴드를 main_banner_2 가 차지 */}
        <div
          className="absolute inset-x-0 bottom-0 h-[300px] overflow-hidden"
          style={{ clipPath: 'polygon(0 60px, 1440px 10px, 1440px 100%, 0 100%)' }}
        >
          <img
            alt=""
            className="absolute inset-0 size-full max-w-none object-cover object-bottom"
            src={mainBanner2}
          />

          <div
            className="absolute left-[257px] bottom-[42px] text-[38.558px] font-bold uppercase leading-[42px] tracking-[-0.0771px] text-white"
            style={{ wordBreak: 'break-word' }}
          >
            <p className="mb-0">TRUSTED</p>
            <p>BY</p>
          </div>

          <p
            className="absolute left-1/2 bottom-[14px] -translate-x-1/2 text-[21.586px] font-light uppercase leading-[31.57px] tracking-[-0.0432px] text-white/75"
            style={{ wordBreak: 'break-word' }}
          >
            PROVEN IN MOTION
          </p>

          <div
            className="absolute right-[80px] bottom-[36px] text-right uppercase leading-[43px] tracking-[-0.0851px] text-white"
            style={{ wordBreak: 'break-word' }}
          >
            <p className="mb-0 text-[25.362px] font-normal tracking-[-0.0507px]">THE BEST</p>
            <p className="text-[42.542px] font-bold">ATHLETES</p>
          </div>
        </div>

        {/* Headline */}

        {/* Subheadline */}

        {/* CTA */}
        <Link
          to="/products"
          className="absolute left-[108px] top-[495px] flex h-[50px] w-[235px] items-center justify-between border-b border-solid border-white py-px"
        >
          <span className="text-[14px] font-medium tracking-[1.3px] text-white">자세히 보기</span>
          <span className="h-[18px] w-[14px]" />
          <img alt="" className="block size-[18px]" src={imgArrow} />
        </Link>
      </div>
    </section>
  );
}
