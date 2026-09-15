import kakiTop from '@/assets/home/kaki_top.webp';
import mainBanner2 from '@/assets/home/main_banner_2.webp';
import modelFull from '@/assets/home/featured-look/arc-model-full.png';
import '@/styles/brand-story.css';

const RAIL_ITEMS = [
  { number: '01', lines: ['DRIVEN', 'BY COMMUNITY'] },
  { number: '02', lines: ['DRIVEN', 'BY COMMUNITY'] },
  { number: '03', lines: ['DRIVEN', 'BY COMMUNITY'] },
];

// DEV에서 API 에러가 나도 레이아웃 확인이 가능하도록 쓰는 임시 더미 (다른 홈 섹션과 동일한 자산 재사용)
// TODO: 실제 브랜드 이미지로 교체
const FALLBACK_IMAGES = [
  { id: 'fallback-1', imageUrl: kakiTop, alt: 'ARC 브랜드 이미지' },
  { id: 'fallback-2', imageUrl: mainBanner2, alt: 'ARC 브랜드 이미지' },
  { id: 'fallback-3', imageUrl: modelFull, alt: 'ARC 브랜드 이미지' },
];

function BrandStorySection({ data, isLoading = false, error = null }) {
  const rawImages = Array.isArray(data?.images) ? data.images.slice(0, 3) : [];

  // DEV에서는 에러를 무시하고 fallback 이미지로 렌더링을 계속함 (다른 홈 섹션과 동일 패턴)
  const showErrorState = error && !import.meta.env.DEV;
  const images = !showErrorState && rawImages.length === 0 && error ? FALLBACK_IMAGES : rawImages;

  return (
    <section className="brand-story">
      <div className="brand-story__inner">
        <div className="brand-story__copy">
          <h2 className="brand-story__title">
            <span>움직임의 본질을</span>
            <span>탐구합니다.</span>
          </h2>

          <p className="brand-story__description">
            ARC는 기능과 스타일의 경계를 넘어,
            <br />
            가장 자연스러운 움직임을 연구합니다.
            <br />
            기능과 형태가 함께 움직이는 스포츠 웨어를 만듭니다.
          </p>
        </div>

        <div className="brand-story__visual">
          {isLoading &&
            Array.from({ length: 3 }, (_, index) => (
              <div className="brand-story__panel" key={`loading-${index}`}>
                <div className="brand-story__placeholder" />
              </div>
            ))}

          {!isLoading &&
            !showErrorState &&
            images.map((image) => (
              <div className="brand-story__panel" key={image.id}>
                <img
                  className="brand-story__image"
                  src={image.imageUrl}
                  alt={image.alt ?? 'ARC 브랜드 이미지'}
                />
              </div>
            ))}

          {!isLoading &&
            !showErrorState &&
            images.length < 3 &&
            Array.from({ length: 3 - images.length }, (_, index) => (
              <div className="brand-story__panel" key={`empty-${index}`}>
                <div className="brand-story__empty">이미지를 준비 중입니다.</div>
              </div>
            ))}

          {!isLoading && showErrorState && (
            <div className="brand-story__error">브랜드 이미지를 불러오지 못했습니다.</div>
          )}
        </div>
      </div>

      {/* 모바일 전용 — 데스크톱 그리드(사이드 레일 + 슬랜트 패널) 대신 가로 스크롤 카드 */}
      <div className="brand-story-mobile">
        <h2 className="brand-story-mobile__title">
          <span>움직임의 본질을</span>
          <span>탐구합니다.</span>
        </h2>

        <p className="brand-story-mobile__description">
          ARC는 기능과 스타일의 경계를 넘어,
          <br />
          가장 자연스러운 움직임을 연구합니다.
        </p>

        <div className="brand-story-mobile__cards">
          {isLoading &&
            Array.from({ length: 3 }, (_, index) => (
              <div className="brand-story-mobile__card" key={`m-loading-${index}`}>
                <div className="brand-story__placeholder" />
              </div>
            ))}

          {!isLoading &&
            !showErrorState &&
            images.map((image, index) => (
              <div className="brand-story-mobile__card" key={image.id}>
                <img
                  className="brand-story-mobile__image"
                  src={image.imageUrl}
                  alt={image.alt ?? 'ARC 브랜드 이미지'}
                />
                <div className="brand-story-mobile__scrim" />

                {RAIL_ITEMS[index] && (
                  <div className="brand-story-mobile__caption">
                    <p>
                      {RAIL_ITEMS[index].lines[0]}
                      <br />
                      {RAIL_ITEMS[index].lines[1]}
                    </p>
                  </div>
                )}
              </div>
            ))}

          {!isLoading && showErrorState && (
            <div className="brand-story-mobile__card brand-story-mobile__card--message">
              <div className="brand-story__error">브랜드 이미지를 불러오지 못했습니다.</div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default BrandStorySection;
