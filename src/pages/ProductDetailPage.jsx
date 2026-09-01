import { useState } from 'react';
import { Link } from 'react-router-dom';

import '@/styles/product-detail.css';

function ProductDetailPage() {
  const [quantity, setQuantity] = useState(1);

  const thumbnailSlots = [1, 2, 3, 4];
  const sizes = ['S', 'M', 'L', 'XL', 'XXL'];

  const handleDecreaseQuantity = () => {
    setQuantity((currentQuantity) => Math.max(1, currentQuantity - 1));
  };

  const handleIncreaseQuantity = () => {
    setQuantity((currentQuantity) => currentQuantity + 1);
  };

  return (
    <main className="product-detail-page">
      <div className="breadcrumb">
        <Link to="/">HOME</Link>

        <span>/</span>

        <Link to="/products">MEN</Link>

        <span>/</span>

        <Link to="/products">SUBCATEGORY</Link>

        <span>/</span>

        <span>PRODUCT</span>
      </div>

      <section className="product-layout">
        <div className="product-gallery">
          <div className="thumbnail-list">
            {thumbnailSlots.map((slot, index) => (
              <button
                key={slot}
                type="button"
                className="thumbnail"
                aria-label={`상품 이미지 ${slot}`}
                aria-pressed={index === 0}
              >
                <span className="image-placeholder">IMAGE {slot}</span>
              </button>
            ))}
          </div>

          <div className="main-image">
            <span className="main-image-placeholder">PRODUCT IMAGE</span>
          </div>
        </div>

        <div className="product-info">
          <div className="product-category">Arc object</div>

          <h1 className="product-title">ARC 기능성 바람막이</h1>

          <p className="product-subtitle">ARC 윈드자켓</p>

          <div className="price-area">
            <span className="original-price">₩ 59,000</span>

            <span className="discount">20%</span>

            <span className="sale-price">₩ 47,200</span>
          </div>

          <div className="star-rating">
            <span>★</span>
            <span>★</span>
            <span>★</span>
            <span>★</span>
            <span>☆</span>

            <span className="review-count">(23)</span>
          </div>

          <p className="product-description">
            ARC 기능성 바람막이 자켓은 가벼운 소재와 방수 기능으로 제작되어, 다양한 날씨 조건에서도
            편안하게 착용할 수 있습니다. 통기성이 뛰어나며, 활동적인 라이프스타일에 적합한
            디자인으로 제작되었습니다. 또한, 세련된 디자인과 다양한 색상 옵션으로 스타일리시한 룩을
            완성할 수 있습니다.
          </p>

          <fieldset className="option-group">
            <legend className="option-title">COLOR</legend>

            <div className="color-list">
              <label className="color-option">
                <input type="radio" name="color" value="black" defaultChecked />

                <span className="color-circle color-black" />
              </label>

              <label className="color-option">
                <input type="radio" name="color" value="brown" />

                <span className="color-circle color-brown" />
              </label>

              <label className="color-option">
                <input type="radio" name="color" value="beige" />

                <span className="color-circle color-beige" />
              </label>
            </div>
          </fieldset>

          <fieldset className="option-group">
            <legend className="option-title">SIZE</legend>

            <button type="button" className="size-guide">
              SIZE GUIDE
            </button>

            <div className="size-list">
              {sizes.map((size) => (
                <label key={size}>
                  <input type="radio" name="size" value={size} defaultChecked={size === 'M'} />

                  <span>{size}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="divider" />

          <div className="quantity-area">
            <span className="quantity-label">수량</span>

            <div className="quantity-control">
              <button type="button" onClick={handleDecreaseQuantity} aria-label="수량 감소">
                −
              </button>

              <output aria-live="polite" aria-label="현재 수량">
                {quantity}
              </output>

              <button type="button" onClick={handleIncreaseQuantity} aria-label="수량 증가">
                +
              </button>
            </div>
          </div>

          <div className="purchase-area">
            <button type="button" className="buy-button">
              BUY NOW
            </button>

            <div className="cart-row">
              <button type="button" className="cart-button">
                ADD TO CART
              </button>

              <button type="button" className="wish-button" aria-label="위시리스트 추가">
                ♡
              </button>
            </div>
          </div>
        </div>
      </section>
      <section className="product-detail-content">
        <nav className="detail-tabs" aria-label="상품 상세 메뉴">
          <button type="button" className="detail-tab is-active">
            <span className="detail-tab-icon">◉</span>
            제품 정보
          </button>

          <button type="button" className="detail-tab">
            <span className="detail-tab-icon">☆</span>
            리뷰
          </button>

          <button type="button" className="detail-tab">
            <span className="detail-tab-icon">✎</span>
            사이즈 가이드
          </button>
        </nav>

        <section className="detail-info-section">
          <h2 className="detail-section-title">특징</h2>

          <div className="detail-info-grid">
            <div className="detail-text-area">
              <h3>활용도: 러닝</h3>

              <p>
                빈틈이 브라탑 더한 러닝 탱크탑이에요. 작은 소지품을 간편하게 보관할 수 있는 4개의
                포켓을 디자인했어요. Incognito™ 브라탑은 통기성이 탁월하고 쿠션감이 느껴지는 일체형
                브라캡으로 가슴을 아름답게 잡아주며, 몸을 이리저리 움직여도 늘 제자리를 지켜요.
              </p>
            </div>

            <div className="detail-image-pair">
              <div className="detail-image">
                <img src="/images/products/detail01.jpg" alt="상품 착용 이미지" />
              </div>

              <div className="detail-image">
                <img src="/images/products/detail02.jpg" alt="러닝 착용 이미지" />
              </div>
            </div>
          </div>
        </section>

        {/* 핏 & 소재 */}
        <section className="detail-info-section">
          <h2 className="detail-section-title">핏 &amp; 소재</h2>

          <div className="detail-info-grid">
            <div className="detail-text-area">
              <div className="detail-text-block">
                <h3>미디엄 서포트, B/C컵</h3>

                <p>
                  미디엄 서포트를 선호하는 B/C컵 여성에게 적합. 바디라인이 드러나는 타이트 핏이에요.
                </p>
              </div>

              <div className="detail-text-block">
                <h3>매끄러운 초경량 Nulux™ 원단</h3>

                <p>
                  매끄럽고 시원한 감촉. 포기해야 할 원사가 더해져 탁월한 신축성과 복원력을
                  제공합니다.
                </p>
              </div>
            </div>

            <div className="detail-wide-image">
              <img src="/images/products/detail03.jpg" alt="제품 소재와 핏 착용 이미지" />
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}

export default ProductDetailPage;
