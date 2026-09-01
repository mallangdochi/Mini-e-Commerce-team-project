import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '@/styles/checkout2.css';

const initialOrderItems = [
  { id: 1, name: 'abcdefgabcdef', size: 'abcdef', price: 49000, quantity: 1 },
  { id: 2, name: 'abcdefgabcdef', size: 'abcdef', price: 49000, quantity: 1 },
  { id: 3, name: 'abcdefgabcdef', size: 'abcdef', price: 49000, quantity: 1 },
];

function CheckoutPage2() {
  const navigate = useNavigate();

  const [shippingInfo, setShippingInfo] = useState({
    name: '',
    phone: '',
    zonecode: '',
    address: '',
    detailAddress: '',
    memo: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setShippingInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleCompleteOrder = () => {
    navigate('/checkout/complete');
  };

  const productTotal = initialOrderItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
  const deliveryFee = 0;
  const finalPrice = productTotal + deliveryFee;

  return (
    <section className="checkout-page">
      <div className="checkout-container">
        {/* 상단 스텝 인디케이터 */}
        <div className="checkout-step-indicator">
          <div className="checkout-step">
            <span className="checkout-step-num">1</span>
            결제 수단
          </div>
          <div className="checkout-step-line" />
          <div className="checkout-step checkout-step-active">
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
          {/* 좌측: 배송지 정보 입력 폼 */}
          <div className="checkout-left">
            <section className="checkout-box-section">
              <div className="checkout-box-title">배송지 정보</div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div className="checkout-form-row">
                  <label htmlFor="name">이름</label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    className="checkout-form-control"
                    placeholder="홍길동"
                    value={shippingInfo.name}
                    onChange={handleChange}
                  />
                </div>

                <div className="checkout-form-row">
                  <label htmlFor="phone">연락처</label>
                  <input
                    id="phone"
                    name="phone"
                    type="text"
                    className="checkout-form-control"
                    placeholder="010-1234-5678"
                    value={shippingInfo.phone}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="checkout-form-row">
                <label htmlFor="zonecode">우편번호</label>
                <div className="checkout-address-row">
                  <input
                    id="zonecode"
                    name="zonecode"
                    type="text"
                    className="checkout-form-control"
                    placeholder="12345"
                    value={shippingInfo.zonecode}
                    onChange={handleChange}
                  />
                  <button type="button" className="checkout-btn-address">
                    주소 검색
                  </button>
                </div>
              </div>

              <div className="checkout-form-row">
                <label htmlFor="address">주소</label>
                <input
                  id="address"
                  name="address"
                  type="text"
                  className="checkout-form-control"
                  placeholder="서울특별시 강남구 어느곳 어느날 123"
                  value={shippingInfo.address}
                  onChange={handleChange}
                />
              </div>

              <div className="checkout-form-row">
                <label htmlFor="detailAddress">상세주소</label>
                <input
                  id="detailAddress"
                  name="detailAddress"
                  type="text"
                  className="checkout-form-control"
                  placeholder="101동 1004호"
                  value={shippingInfo.detailAddress}
                  onChange={handleChange}
                />
              </div>

              <div className="checkout-form-row" style={{ marginBottom: 0 }}>
                <label htmlFor="memo">배송 요청사항(선택)</label>
                <select
                  id="memo"
                  name="memo"
                  className="checkout-form-control"
                  value={shippingInfo.memo}
                  onChange={handleChange}
                >
                  <option value="">선택해주세요.</option>
                  <option value="door">문 앞에 놓아주세요</option>
                  <option value="guard">경비실에 맡겨주세요</option>
                  <option value="call">배송 전 연락주세요</option>
                </select>
              </div>
            </section>
          </div>

          {/* 우측: 주문 상품 요약 및 결제 금액 */}
          <div className="checkout-right">
            <section className="checkout-summary-box">
              <div className="checkout-summary-title">
                <div
                  className="checkout-box-title checkout-order-title"
                  style={{ borderBottom: 0, marginBottom: 0 }}
                >
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
                      <div className="checkout-mini-sub">{item.size}</div>
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
                <div className="checkout-summary-row checkout-total-row">
                  <span>총 결제금액</span>
                  <span>₩ {finalPrice.toLocaleString()}</span>
                </div>
              </div>

              <button type="button" className="checkout-btn-action" onClick={handleCompleteOrder}>
                주문 완료
              </button>
            </section>
          </div>
        </div>
      </div>
    </section>
  );
}

export default CheckoutPage2;
