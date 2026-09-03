import { useState } from 'react';

import modelFull from '@/assets/home/featured-look/arc-model-full.png';
import partTop from '@/assets/home/featured-look/arc-top.png';
import partBottom from '@/assets/home/featured-look/arc-bottom.png';
import partShoes from '@/assets/home/featured-look/arc-shoes.png';
import '@/styles/featured-look.css';

const VIEW_ORDER = ['full', 'top', 'bottom', 'shoes'];
const PARTS = VIEW_ORDER.slice(1);

const VIEW_LABELS = {
  full: '전체 착장',
  top: '상의',
  bottom: '하의',
  shoes: '신발',
};

const PRODUCT_INFO = {
  full: {
    eyebrow: 'ARC LOOK 01',
    title: 'ARC MOTION SET',
    subtitle: 'URBAN TRAINING SERIES',
    image: modelFull,
    description:
      '가벼운 윈드 셸과 와이드 트랙 팬츠를 한 세트로 구성한 ARC의 데일리 트레이닝 룩입니다.',
  },
  top: {
    eyebrow: 'ARC TOP',
    title: 'ARC WIND SHELL',
    subtitle: 'CROPPED PERFORMANCE JACKET',
    image: partTop,
    description: '가볍고 유연한 셸 원단에 곡선형 배색 패널을 더한 크롭 윈드 재킷입니다.',
  },
  bottom: {
    eyebrow: 'ARC BOTTOM',
    title: 'ARC TRACK PANTS',
    subtitle: 'RELAXED WIDE FIT',
    image: partBottom,
    description: '여유 있는 와이드 실루엣과 사이드 파이핑을 적용한 트랙 팬츠입니다.',
  },
  shoes: {
    eyebrow: 'ARC SHOES',
    title: 'ARC RUNNER 01',
    subtitle: 'DAILY TRAINING SHOES',
    image: partShoes,
    description: '볼륨감 있는 미드솔과 안정적인 접지 형태를 가진 데일리 트레이닝 슈즈입니다.',
  },
};

const MODELS = [
  { id: 'look-01', label: 'LOOK 01', image: modelFull },
  { id: 'look-02', label: 'LOOK 02', image: modelFull },
  { id: 'look-03', label: 'LOOK 03', image: modelFull },
];

function FeaturedLookSection() {
  const [currentModel, setCurrentModel] = useState(0);
  const [selectedView, setSelectedView] = useState('full');
  const [hoveredPart, setHoveredPart] = useState(null);
  const [isModelHovered, setIsModelHovered] = useState(false);
  const [selectedColor, setSelectedColor] = useState('black');
  const [isSliding, setIsSliding] = useState(false);
  const [isViewTransitioning, setIsViewTransitioning] = useState(false);

  const current = MODELS[currentModel];
  const nextModelIndex = (currentModel + 1) % MODELS.length;
  const afterNextModelIndex = (currentModel + 2) % MODELS.length;
  const next = MODELS[nextModelIndex];
  const afterNext = MODELS[afterNextModelIndex];
  const activeInfo = PRODUCT_INFO[selectedView];

  const changeView = (view) => {
    if (isSliding || view === selectedView) return;

    setHoveredPart(null);
    setIsModelHovered(false);
    setSelectedView(view);
    setIsViewTransitioning(view !== 'full');
  };

  const handleViewTransitionEnd = (event) => {
    if (event.currentTarget !== event.target) return;
    if (event.propertyName !== 'transform') return;
    setHoveredPart(null);
    setIsModelHovered(false);
    setIsViewTransitioning(false);
  };

  const handleNextModel = () => {
    if (selectedView !== 'full' || isSliding || isViewTransitioning) return;

    setHoveredPart(null);
    setIsModelHovered(false);
    setIsSliding(true);
  };

  const handleNextModelAnimationEnd = (event) => {
    if (event.currentTarget !== event.target) return;
    if (event.animationName !== 'arc-next-to-center') return;
    if (!isSliding) return;

    setCurrentModel(nextModelIndex);
    setIsSliding(false);
  };

  return (
    <section className="arc-look-page">
      <section className="arc-look-shell">
        <aside className="arc-info-rail">
          <nav className="arc-view-switcher">
            {VIEW_ORDER.map((view) => (
              <button
                key={view}
                type="button"
                className={`arc-view-button arc-view-button--${view} ${
                  selectedView === view ? 'is-active' : ''
                }`}
                onClick={() => changeView(view)}
                disabled={isSliding}
                aria-label={VIEW_LABELS[view]}
                aria-pressed={selectedView === view}
              >
                <span />
              </button>
            ))}
          </nav>

          <article className="arc-product-card">
            <div className={`arc-product-image arc-product-image--${selectedView}`}>
              <img src={activeInfo.image} alt={activeInfo.title} draggable="false" />
            </div>

            <div className="arc-product-meta">
              <div>
                <p className="arc-product-eyebrow">{activeInfo.eyebrow}</p>
                <h1>{activeInfo.title}</h1>
                <p className="arc-product-subtitle">{activeInfo.subtitle}</p>
              </div>

              <div className="arc-color-list">
                {['black', 'charcoal', 'light', 'olive'].map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`arc-color arc-color--${color} ${
                      selectedColor === color ? 'is-active' : ''
                    }`}
                    onClick={() => setSelectedColor(color)}
                    aria-label={color}
                  />
                ))}
              </div>
            </div>

            <p className="arc-product-description">{activeInfo.description}</p>

            <button type="button" className="arc-detail-button">
              <span>상세설명</span>
              <span>↗</span>
            </button>
          </article>
        </aside>

        <section className={`arc-model-stage arc-model-stage--${selectedView}`}>
          <div className={`arc-model-track ${isSliding ? 'is-sliding' : ''}`}>
            <div
              className={`arc-track-model arc-track-model--current ${
                hoveredPart && selectedView === 'full' && !isViewTransitioning
                  ? 'is-part-hovering'
                  : ''
              }`}
              onMouseEnter={() => {
                if (selectedView === 'full' && !isSliding) {
                  setIsModelHovered(true);
                }
              }}
              onMouseLeave={() => {
                setIsModelHovered(false);
                setHoveredPart(null);
              }}
            >
              <div className="arc-model-canvas" onTransitionEnd={handleViewTransitionEnd}>
                <img
                  className="arc-model-full-image"
                  src={current.image}
                  alt={`${current.label} 모델`}
                  draggable="false"
                />

                {selectedView === 'full' &&
                  PARTS.map((part) => (
                    <div
                      key={part}
                      className={`arc-part-overlay arc-part-overlay--${part} ${
                        isModelHovered ? 'is-visible' : ''
                      } ${hoveredPart === part ? 'is-focused' : ''} ${
                        hoveredPart && hoveredPart !== part ? 'is-muted' : ''
                      }`}
                      style={{
                        '--part-mask': `url("${PRODUCT_INFO[part].image}")`,
                      }}
                    >
                      <img
                        className="arc-part-overlay-image"
                        src={PRODUCT_INFO[part].image}
                        alt=""
                        draggable="false"
                      />
                      <span className="arc-part-metal-fill" />
                    </div>
                  ))}

                {selectedView === 'full' && !isSliding && (
                  <div className="arc-part-hotspots">
                    {PARTS.map((part) => (
                      <button
                        key={part}
                        type="button"
                        className={`arc-part-hotspot arc-part-hotspot--${part}`}
                        onMouseEnter={() => setHoveredPart(part)}
                        onMouseLeave={() => setHoveredPart(null)}
                        onClick={() => changeView(part)}
                        aria-label={`${VIEW_LABELS[part]} 자세히 보기`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            <button
              type="button"
              className={`arc-track-model arc-track-model--next ${
                selectedView !== 'full' ? 'is-hidden' : ''
              }`}
              onClick={handleNextModel}
              disabled={selectedView !== 'full' || isSliding}
              aria-label={`${next.label} 보기`}
              onAnimationEnd={handleNextModelAnimationEnd}
            >
              <span className="arc-next-model-tag">NEXT</span>

              <div className="arc-model-canvas arc-model-canvas--preview">
                <img className="arc-model-full-image" src={next.image} alt="" draggable="false" />
              </div>
            </button>

            {selectedView === 'full' && isSliding && (
              <div className="arc-track-model arc-track-model--queued">
                <div className="arc-model-canvas arc-model-canvas--preview">
                  <img
                    className="arc-model-full-image"
                    src={afterNext.image}
                    alt=""
                    draggable="false"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="arc-stage-caption">
            <span>{String(currentModel + 1).padStart(2, '0')}</span>
            <span className="arc-stage-line" />
            <span>{VIEW_LABELS[selectedView]}</span>
          </div>
        </section>
      </section>
    </section>
  );
}

export default FeaturedLookSection;
