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
    </main>
  );
}

export default ProductDetailPage;
