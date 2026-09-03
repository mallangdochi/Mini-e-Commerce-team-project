import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();

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

  const handleNextStep = () => {
    navigate('/checkout2', {
      state: {
        discountAmount: discountAmount,
        selectedCoupon: selectedCoupon,
        finalPrice: finalPrice,
      },
    });
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

                <span className="checkout-pay-name">
                  <svg
                    width="50"
                    height="16"
                    viewBox="0 0 61 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    style={{ display: 'block' }}
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M9.49978 0C4.25382 0 0 3.44517 0 7.69797C0 10.4302 1.76175 12.8286 4.40747 14.1974L3.51247 17.6254C3.49594 17.6758 3.4936 17.7299 3.50571 17.7816C3.51781 17.8332 3.54388 17.8804 3.58091 17.9175C3.6272 17.967 3.6902 17.9964 3.75696 17.9997C3.82373 18.003 3.88919 17.9799 3.93988 17.9352L7.78924 15.2677C8.35573 15.3522 8.92735 15.3952 9.49978 15.3964C14.7462 15.3964 19 11.9508 19 7.69616C19 3.44155 14.7462 0 9.49978 0Z"
                      fill="#040000"
                    />
                    <path
                      d="M26.6124 14.2198V19H23V1.37327H25.5485L25.994 2.4922C26.7608 1.76962 27.9236 1 29.8043 1C33.3423 1 35.0269 3.49483 34.9997 7.52847C34.9997 11.7485 32.4022 14.4537 28.6909 14.4537C27.9901 14.4627 27.2912 14.3841 26.6124 14.2198ZM26.6124 4.21698V11.8413C26.9983 11.8852 27.3866 11.9086 27.7753 11.9114C30.3483 11.9114 31.3383 10.2093 31.3383 7.52803C31.3383 5.17301 30.6699 3.75094 28.6165 3.75094C27.9486 3.75094 27.2063 3.93735 26.6124 4.21698Z"
                      fill="#040000"
                    />
                    <path
                      d="M41.6101 6.15952H43.6529V5.75379C43.6529 4.40194 42.8161 3.77105 41.3641 3.77105C40.2566 3.77105 38.829 4.06566 37.6722 4.58249L36.6878 2.37416C37.9674 1.56313 39.9366 1 41.6841 1C45.1297 1 47 2.66709 47 5.84386V13.662H44.4653L44.0975 12.6258C42.6451 13.5939 41.3163 14 40.1103 14C37.4768 14 36 12.5581 36 10.125C35.9986 7.53536 37.9674 6.15952 41.6101 6.15952ZM43.6529 10.508V8.25463H42.0037C40.1577 8.25463 39.2225 8.86321 39.2225 10.0795C39.2225 11.0055 39.7398 11.4541 40.7977 11.4541C41.7825 11.4541 43.0377 11.0034 43.6529 10.508Z"
                      fill="#040000"
                    />
                    <path
                      d="M57.1645 13.1218C56.0207 16.3478 54.6527 18.6961 52.6561 20L50.6374 18.0315C51.8039 16.9641 52.6335 15.9207 53.3517 14.5215L49 1.97475L52.2526 1.04962L55.0339 11.2251L57.7926 1L61 1.94905L57.1645 13.1218Z"
                      fill="#040000"
                    />
                  </svg>
                </span>

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

                <span className="checkout-pay-name">
                  <svg
                    width="45"
                    height="16"
                    viewBox="0 0 67 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    style={{ display: 'block' }}
                  >
                    <path
                      d="M64.2785 5.54376L61.0658 12.8645L57.429 5.54376H54.6335L59.7937 15.7004L57.669 20.4433H60.3837L67.0001 5.54376H64.2785ZM53.0855 16.8625H50.429V15.8058C49.4643 16.6544 48.2182 17.1135 46.9335 17.0936C43.7544 17.0936 41.2685 14.5068 41.2685 11.202C41.2685 7.89725 43.7544 5.31266 46.9335 5.31266C48.2182 5.2928 49.4643 5.75188 50.429 6.60047V5.54376H53.0855V16.8625ZM50.7409 11.202C50.7409 9.06839 49.2511 7.44854 47.2745 7.44854C45.298 7.44854 43.8105 9.06839 43.8105 11.202C43.8105 13.3357 45.3002 14.9578 47.2745 14.9578C49.2489 14.9578 50.7409 13.3379 50.7409 11.211V11.202ZM28.0674 20.4433H30.8382V15.9023C31.7861 16.6902 32.9846 17.1128 34.217 17.0936C37.3984 17.0936 39.8842 14.5068 39.8842 11.202C39.8842 7.89725 37.3984 5.31266 34.217 5.31266C32.9329 5.29228 31.6873 5.75146 30.7237 6.60047V5.54376H28.0674V20.4433ZM33.876 7.44854C35.8526 7.44854 37.3423 9.06839 37.3423 11.202C37.3423 13.3357 35.8526 14.9578 33.876 14.9578C31.8994 14.9578 30.412 13.3379 30.412 11.202C30.412 9.06615 31.9017 7.44854 33.876 7.44854Z"
                      fill="black"
                    />
                    <path
                      d="M23.0998 11.5499C23.0998 14.6131 21.8829 17.5509 19.7169 19.7169C17.5509 21.8829 14.6131 23.0998 11.5499 23.0998C8.48666 23.0998 5.5489 21.8829 3.38288 19.7169C1.21686 17.5509 0 14.6131 0 11.5499C0 8.48666 1.21686 5.5489 3.38288 3.38288C5.5489 1.21686 8.48666 0 11.5499 0C14.6131 0 17.5509 1.21686 19.7169 3.38288C21.8829 5.5489 23.0998 8.48666 23.0998 11.5499ZM13.4817 6.12046V11.929L9.44325 6.12046H6.11372V16.9793H9.61152V11.1685L13.6499 16.9793H16.9794V6.12046H13.4817Z"
                      fill="black"
                    />
                  </svg>
                </span>

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
                  maxLength={20}
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

              <button type="button" className="checkout-btn-action" onClick={handleNextStep}>
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
