import { useState } from 'react';
import { Link } from 'react-router-dom';

import '@/styles/product-detail.css';

const THUMBNAIL_SLOTS = [1, 2, 3, 4];
const SIZES = ['S', 'M', 'L', 'XL', 'XXL'];

function ProductDetailPage() {
  const [quantity, setQuantity] = useState(1);

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
            {THUMBNAIL_SLOTS.map((slot, index) => (
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
              {SIZES.map((size) => (
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

        <section className="detail-info-section">
          <h2 className="detail-section-title">핏 &amp; 소재</h2>

          <div className="detail-info-grid">
            <div className="detail-text-area">
              <div className="detail-text-block">
                <h3>미디엄 서포트, B/C컵</h3>
                <p>으에에에</p>
              </div>

              <div className="detail-text-block">
                <h3>매끄러운 초경량 Nulux™ 원단</h3>
                <p>이스트소프트</p>
              </div>
            </div>

            <div className="detail-wide-image">
              <img src="/images/products/detail03.jpg" alt="제품 소재와 핏 착용 이미지" />
            </div>
          </div>
        </section>

        <section className="detail-info-section">
          <h2 className="detail-section-title">기능</h2>

          <div className="detail-info-grid">
            <div className="detail-text-area">
              <div className="detail-text-block">
                <h3>제품 디테일</h3>
                <p>응에엥엥아에엥ㅇ</p>
              </div>

              <div className="detail-text-block">
                <h3>엔지니어드 4방 스트레치</h3>
                <p>레이서백 디자인이라 움직임이 자유로워요.</p>
              </div>
            </div>

            <div className="detail-image-pair">
              <div className="detail-image">
                <img src="/images/products/detail04.jpg" alt="기능 설명 이미지 1" />
              </div>

              <div className="detail-image">
                <img src="/images/products/detail05.jpg" alt="기능 설명 이미지 2" />
              </div>
            </div>
          </div>
        </section>

        <section className="detail-info-section">
          <h2 className="detail-section-title">소재 &amp; 관리 방법</h2>

          <div className="detail-info-grid detail-info-grid--text-only">
            <div className="detail-text-area">
              <div className="detail-text-block">
                <h3>소재</h3>

                <ul className="detail-info-list">
                  <li>브라 안감: 83% 폴리에스터, 17% 폴리우레탄</li>
                  <li>컵 안감: 71% 폴리에스터, 29% 폴리우레탄</li>
                  <li>콘트라스트: 82% 나일론, 18% 폴리우레탄</li>
                  <li>바디: 84% 나일론, 16% 폴리우레탄</li>
                </ul>
              </div>

              <div className="detail-text-block">
                <h3>관리 방법</h3>

                <ul className="detail-info-list">
                  <li>세탁기에서 찬물로 세탁</li>
                  <li>표백제 사용 금지</li>
                  <li>저온 건조</li>
                  <li>다림질 금지</li>
                  <li>드라이클리닝 금지</li>
                  <li>유사 색상끼리 세탁</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </section>

      <section className="product-review-section">
        <div className="review-section-header">
          <h2 className="review-section-title">리뷰</h2>

          <button type="button" className="write-review-button">
            리뷰 작성
          </button>
        </div>

        <div className="review-summary">
          <div className="review-score">
            <strong>0.0</strong>

            <div>
              <div className="review-stars">☆☆☆☆☆</div>
              <span>0개의 리뷰</span>
            </div>
          </div>
        </div>

        <div className="review-list" />
      </section>

      <section id="size-guide" className="product-size-guide-section">
        <div className="size-guide-heading">
          <span>사이즈 가이드</span>

          <h2>여성 상의 사이즈 가이드</h2>

          <p>사이즈 변환을 위해 위치를 선택해 주세요.</p>
        </div>

        <div className="size-guide-country">
          <select defaultValue="international">
            <option value="international">국제</option>
            <option value="korea">한국</option>
          </select>
        </div>

        <p className="size-guide-description">
          US 사이즈 탭을 선택하여 차트에서 해당 사이즈를 확인해 보세요.
        </p>

        <div className="size-guide-tabs">
          <button type="button" className="size-guide-tab is-active">
            US 사이즈 0 - 20
          </button>

          <button type="button" className="size-guide-tab">
            US 사이즈 XXXS - 2X
          </button>

          <button type="button" className="size-guide-tab">
            US 사이즈 XS/S - XL/XXL
          </button>
        </div>

        <div className="size-guide-content">
          <h3>US 사이즈 0 - 20</h3>

          <p>
            US 사이즈 기준으로 디자인했어요. 아래 차트를 참고해 사이즈를 선택하시거나, 바디 치수를
            측정해 정확한 사이즈를 찾아보세요.
          </p>

          <div className="size-unit">
            <span className="is-active">CM</span>

            <span className="size-unit-toggle">
              <span />
            </span>

            <span>IN</span>
          </div>

          <div className="size-table-scroll">
            <table className="size-guide-table">
              <tbody>
                <tr>
                  <th>국제 사이즈</th>
                  <td>XXS</td>
                  <td>XS</td>
                  <td>S</td>
                  <td>M</td>
                  <td>L</td>
                  <td>XL</td>
                  <td>XXL</td>
                  <td>XXL</td>
                  <td>3XL</td>
                  <td>4XL</td>
                </tr>

                <tr>
                  <th>US 사이즈</th>
                  <td>0</td>
                  <td>2</td>
                  <td>4</td>
                  <td>6</td>
                  <td>8</td>
                  <td>10</td>
                  <td>12</td>
                  <td>14</td>
                  <td>16</td>
                  <td>18</td>
                </tr>

                <tr>
                  <th>가슴둘레</th>
                  <td>72.4cm</td>
                  <td>76.2cm</td>
                  <td>78.7-81.3cm</td>
                  <td>83.8-86.4cm</td>
                  <td>88.9-91.4cm</td>
                  <td>94-97.8cm</td>
                  <td>101.6cm</td>
                  <td>106.7cm</td>
                  <td>114.3cm</td>
                  <td>119.4cm</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="measurement-guide">
            <div className="measurement-text">
              <h3>측정 방법</h3>

              <p>
                편안한 자세로 허리를 곧게 펴고 발끝이 나란하게 서 주세요. 줄자를 사용해 정확한
                치수를 측정해 보세요.
              </p>

              <div className="measurement-item">
                <strong>1. 가슴둘레</strong>

                <p>
                  양팔을 내린 상태로 가슴의 가장 넓은 부분을 측정하세요. 줄자를 등 뒤로 두른 때 너무
                  조이거나 느슨하지 않도록 유지하세요.
                </p>
              </div>

              <div className="measurement-item">
                <strong>2. 허리둘레</strong>
                <p>허리의 가장 가는 부분의 둘레를 측정하세요.</p>
              </div>

              <div className="measurement-item">
                <strong>3. 엉덩이둘레</strong>
                <p>양발을 골반 너비로 벌려 선 후, 엉덩이의 가장 볼록한 부분의 둘레를 측정하세요.</p>
              </div>
            </div>

            <div className="measurement-image">
              <img src="/images/products/size-guide.jpg" alt="상의 사이즈 측정 방법" />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default ProductDetailPage;
