import { Link } from 'react-router-dom';

import '@/styles/brand-story.css';

function ArcMark() {
  return (
    <svg className="brand-story__mark" viewBox="0 0 332.9 226.06" aria-hidden="true">
      <path d="M54.69,130.47L183.14,16.41l40.68,62.97c13.55-3.33,28.72-6.33,45.35-8.49,20.37-2.65,39.05-3.53,55.5-3.44-72.03,8.74-144.15,29.55-209.35,61.15-20.09,9.74-71.48,37.9-79.83,58.17-2.2,5.35-2.94,8.24,2.24,12.13l9.94,4.55c-19.48-2.39-33.26-7.08-19.63-28.12,14.12-21.78,56.68-44.55,80.28-55.72,29.93-14.16,61.46-25.22,93.35-34.16l-24.5-39.97-77.99,72.99c-3.9.27-21.71,11.99-23.01,11.99h-21.5Z" />
      <polygon points="254.69 130.47 229.19 130.47 208.69 96.48 230.07 90.68 254.69 130.47" />
    </svg>
  );
}

function BrandStorySection({ data, isLoading = false, error = null }) {
  const images = Array.isArray(data?.images) ? data.images.slice(0, 3) : [];

  return (
    <section className="brand-story">
      <div className="brand-story__inner">
        <aside className="brand-story__rail">
          <ArcMark />

          <span className="brand-story__rail-line" />

          <div className="brand-story__rail-item">
            <span className="brand-story__rail-number">01</span>
            <p>
              ENGINEERED
              <br />
              FOR PERFORMANCE
            </p>
          </div>

          <span className="brand-story__rail-divider" />

          <div className="brand-story__rail-item">
            <span className="brand-story__rail-number">02</span>
            <p>
              DESIGNED
              <br />
              FOR LIFE
            </p>
          </div>

          <span className="brand-story__rail-divider" />

          <div className="brand-story__rail-item">
            <span className="brand-story__rail-number">03</span>
            <p>
              DRIVEN
              <br />
              BY COMMUNITY
            </p>
          </div>
        </aside>

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

          <Link className="brand-story__link" to="/about">
            ARC의 철학 보기
            <span aria-hidden="true">↗</span>
          </Link>
        </div>

        <div className="brand-story__visual">
          {isLoading &&
            Array.from({ length: 3 }, (_, index) => (
              <div className="brand-story__panel" key={`loading-${index}`}>
                <div className="brand-story__placeholder" />
              </div>
            ))}

          {!isLoading &&
            !error &&
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
            !error &&
            images.length < 3 &&
            Array.from({ length: 3 - images.length }, (_, index) => (
              <div className="brand-story__panel" key={`empty-${index}`}>
                <div className="brand-story__empty">이미지를 준비 중입니다.</div>
              </div>
            ))}

          {!isLoading && error && (
            <div className="brand-story__error">브랜드 이미지를 불러오지 못했습니다.</div>
          )}
        </div>
      </div>
    </section>
  );
}

export default BrandStorySection;
