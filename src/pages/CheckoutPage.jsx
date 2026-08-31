import { useState } from 'react';

import '@/styles/checkout.css';

const initialOrderItems = [
  {
    id: 1,
    name: 'ARC Product Name',
    size: 'L',
    price: 49000,
    quantity: 1,
  },
  {
    id: 2,
    name: 'ARC Product Name',
    size: 'L',
    price: 49000,
    quantity: 1,
  },
  {
    id: 3,
    name: 'ARC Product Name',
    size: 'L',
    price: 49000,
    quantity: 1,
  },
];

function CheckoutPage() {
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [couponCode, setCouponCode] = useState('');
  const [selectedCoupon, setSelectedCoupon] = useState('');

  const productTotal = initialOrderItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const deliveryFee = 0;

  const discountAmount = selectedCoupon === 'open-20000' ? 20000 : 0;

  const finalPrice = productTotal + deliveryFee - discountAmount;

  const handleCouponApply = () => {
    if (selectedCoupon === 'open-20000') {
      return;
    }

    if (couponCode.trim()) {
      setSelectedCoupon('open-20000');
    }
  };

  return (
    <section className="checkout-page">
      <div className="checkout-container">
        <div className="checkout-step-indicator">
          <div className="checkout-step checkout-step-active">
            <span className="checkout-step-num">1</span>
            결제 수단
          </div>

          <div className="checkout-step-line" />

          <div className="checkout-step">
            <span className="checkout-step-num">2</span>
            배송지 정보
          </div>

          <div className="checkout-step-line" />

          <div className="checkout-step">
            <span className="checkout-step-num">3</span>
            주문완료
          </div>
        </div>

        <div className="checkout-grid">
          <div className="checkout-left">
            <section className="checkout-box-section">
              <div className="checkout-box-title">
                <span>A</span>
                결제 수단 선택
              </div>

              <label className="checkout-pay-option">
                <input
                  type="radio"
                  name="pay"
                  value="card"
                  checked={paymentMethod === 'card'}
                  onChange={(event) => setPaymentMethod(event.target.value)}
                />

                <span className="checkout-pay-name">신용카드</span>

                <span className="checkout-pay-desc">신용/체크카드</span>
              </label>

              <label className="checkout-pay-option">
                <input
                  type="radio"
                  name="pay"
                  value="kakao"
                  checked={paymentMethod === 'kakao'}
                  onChange={(event) => setPaymentMethod(event.target.value)}
                />

                <span className="checkout-pay-name">pay</span>

                <span className="checkout-pay-desc">카카오페이</span>
              </label>

              <label className="checkout-pay-option">
                <input
                  type="radio"
                  name="pay"
                  value="naver"
                  checked={paymentMethod === 'naver'}
                  onChange={(event) => setPaymentMethod(event.target.value)}
                />

                <span className="checkout-pay-name">pay</span>

                <span className="checkout-pay-desc">네이버페이</span>
              </label>

              <label className="checkout-pay-option">
                <input
                  type="radio"
                  name="pay"
                  value="bank"
                  checked={paymentMethod === 'bank'}
                  onChange={(event) => setPaymentMethod(event.target.value)}
                />

                <span className="checkout-pay-name">무통장입금</span>

                <span className="checkout-pay-desc">가상계좌 입금</span>
              </label>
            </section>

            <section className="checkout-box-section">
              <div className="checkout-box-title">
                <span>B</span>
                쿠폰 적용
              </div>

              <div className="checkout-form-row">
                <label htmlFor="couponCode">쿠폰 코드</label>

                <input
                  id="couponCode"
                  type="text"
                  className="checkout-form-control"
                  placeholder="쿠폰 코드를 입력하세요"
                  value={couponCode}
                  onChange={(event) => setCouponCode(event.target.value)}
                />
              </div>

              <div className="checkout-coupon-row">
                <div className="checkout-coupon-select">
                  <label htmlFor="couponSelect">쿠폰 선택</label>

                  <select
                    id="couponSelect"
                    className="checkout-form-control"
                    value={selectedCoupon}
                    onChange={(event) => setSelectedCoupon(event.target.value)}
                  >
                    <option value="">쿠폰을 선택하세요</option>

                    <option value="open-20000">[2만원 할인] 오픈 기념 쿠폰</option>
                  </select>
                </div>

                <button type="button" className="checkout-btn-coupon" onClick={handleCouponApply}>
                  쿠폰 적용
                </button>
              </div>
            </section>
          </div>

          <div className="checkout-right">
            <section className="checkout-summary-box">
              <div className="checkout-summary-title">
                <div className="checkout-box-title checkout-order-title">
                  <span>C</span>
                  주문 상품
                </div>

                <span className="checkout-quantity-heading">수량</span>
              </div>

              <div className="checkout-mini-item-list">
                {initialOrderItems.map((item) => (
                  <div key={item.id} className="checkout-mini-item">
                    <div className="checkout-mini-img-placeholder">IMAGE</div>

                    <div className="checkout-mini-info">
                      <div className="checkout-mini-name">{item.name}</div>

                      <div className="checkout-mini-sub">SIZE / {item.size}</div>
                    </div>

                    <div className="checkout-mini-price">₩ {item.price.toLocaleString()}</div>

                    <div className="checkout-mini-qty">x {item.quantity}</div>
                  </div>
                ))}
              </div>

              <div className="checkout-summary-prices">
                <div className="checkout-summary-row">
                  <span>상품금액</span>

                  <span>₩ {productTotal.toLocaleString()}</span>
                </div>

                <div className="checkout-summary-row">
                  <span>배송비</span>

                  <span>{deliveryFee === 0 ? '무료' : `₩ ${deliveryFee.toLocaleString()}`}</span>
                </div>

                <div className="checkout-summary-row checkout-discount-row">
                  <span>할인 금액</span>

                  <span>- ₩ {discountAmount.toLocaleString()}</span>
                </div>

                <div className="checkout-summary-row checkout-total-row">
                  <span>총 결제 금액</span>

                  <span>₩ {finalPrice.toLocaleString()}</span>
                </div>
              </div>

              <button type="button" className="checkout-btn-action">
                결제하기
              </button>
            </section>
          </div>
        </div>
      </div>
    </section>
  );
}

export default CheckoutPage;
