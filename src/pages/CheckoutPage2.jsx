import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '@/styles/checkout2.css';

function CheckoutPage2() {
  const navigate = useNavigate();
  const location = useLocation();

  // 이전 페이지(CheckoutPage)에서 전달받은 state 구조분해 할당 (없을 경우 기본값 설정)
  const {
    orderItems = [],
    paymentMethod = 'card',
    discountAmount = 0,
    selectedCoupon = '',
    finalPrice: passedFinalPrice,
  } = location.state || {};

  const [shippingInfo, setShippingInfo] = useState({
    name: '',
    phone: '',
    zonecode: '',
    address: '',
    detailAddress: '',
    memo: '',
  });

  // 사용자가 마지막으로 '주문 완료'를 눌렀을 때 검사한 기준 필드
  const [activeErrorField, setActiveErrorField] = useState(null);

  const formatPhoneNumber = (value) => {
    const numbers = value.replace(/[^\d]/g, '');
    if (numbers.length <= 3) {
      return numbers;
    } else if (numbers.length <= 7) {
      return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    } else {
      const limitedNumbers = numbers.slice(0, 11);
      return `${limitedNumbers.slice(0, 3)}-${limitedNumbers.slice(3, 7)}-${limitedNumbers.slice(7)}`;
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'phone') {
      const formatted = formatPhoneNumber(value);
      setShippingInfo((prev) => ({ ...prev, [name]: formatted }));
      return;
    }

    // 우편번호 입력 시 숫자만 허용 (최대 5자리)
    if (name === 'zonecode') {
      const numbers = value.replace(/[^\d]/g, '').slice(0, 5);
      setShippingInfo((prev) => ({ ...prev, [name]: numbers }));
      return;
    }

    // 주소 및 상세주소 입력 시 허용되지 않는 특수문자 차단
    // (한글, 영문, 숫자, 띄어쓰기, 하이픈(-), 쉼표(,), 괄호(()), 해시(#) 등 주소에 주로 쓰이는 기호 외 특수문자 제거)
    if (name === 'address' || name === 'detailAddress') {
      const filteredValue = value.replace(/[^ㄱ-ㅎㅏ-ㅣ가-힣a-zA-Z0-9\s\-\,\(\)\#\.]/g, '');
      setShippingInfo((prev) => ({ ...prev, [name]: filteredValue }));
      return;
    }

    setShippingInfo((prev) => ({ ...prev, [name]: value }));
  };

  // 현재 위에서부터 차례대로 비어있는 첫 번째 필드 찾기 (이름 -> 연락처 -> 주소 -> 상세주소)
  const getFirstEmptyField = () => {
    if (shippingInfo.name.trim() === '') return 'name';
    if (shippingInfo.phone.trim() === '') return 'phone';
    if (shippingInfo.address.trim() === '') return 'address';
    if (shippingInfo.detailAddress.trim() === '') return 'detailAddress';
    return null;
  };

  const handleCompleteOrder = () => {
    if (orderItems.length === 0) {
      alert('주문할 상품이 없습니다.');
      navigate('/cart');
      return;
    }

    const emptyField = getFirstEmptyField();

    // 주문 완료를 누른 순간의 첫 번째 빈 필드로 에러 지정
    setActiveErrorField(emptyField);

    if (emptyField !== null) {
      return;
    }

    // 최종 주문 완료 페이지로 전달할 데이터 구성
    navigate('/checkout/complete', {
      state: {
        orderItems,
        paymentMethod,
        shippingInfo,
        discountAmount,
        selectedCoupon,
        finalPrice,
      },
    });
  };

  // 특정 필드에 에러를 표시할지 여부 결정:
  // 1. 주문 완료를 눌러서 지정된 필드(activeErrorField)여야 하고,
  // 2. 실제로 그 칸이 비어있을 때만 에러를 유지합니다. (값이 입력되면 즉시 사라짐)
  const getFieldError = (fieldName) => {
    if (activeErrorField === fieldName && shippingInfo[fieldName].trim() === '') {
      return true;
    }
    return false;
  };

  // 전달받은 실제 상품 목록을 기준으로 금액 계산
  const productTotal = orderItems.reduce((total, item) => total + item.price * item.quantity, 0);
  const deliveryFee = 0;

  const finalPrice =
    passedFinalPrice !== undefined ? passedFinalPrice : productTotal + deliveryFee - discountAmount;

  return (
    <section className="checkout-page">
      <div className="checkout-container">
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
          <div className="checkout-left">
            <section className="checkout-box-section">
              <div className="checkout-box-title">배송지 정보</div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                {/* 이름 필드 */}
                <div className="checkout-form-row">
                  <label htmlFor="name">이름</label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    maxLength={10}
                    className={`checkout-form-control ${getFieldError('name') ? 'input-error' : ''}`}
                    placeholder="홍길동"
                    value={shippingInfo.name}
                    onChange={handleChange}
                  />
                  {getFieldError('name') && <p className="error-text">이름을 입력해 주세요.</p>}
                </div>

                {/* 연락처 필드 */}
                <div className="checkout-form-row">
                  <label htmlFor="phone">연락처</label>
                  <input
                    id="phone"
                    name="phone"
                    type="text"
                    maxLength={13}
                    className={`checkout-form-control ${getFieldError('phone') ? 'input-error' : ''}`}
                    placeholder="010-1234-5678"
                    value={shippingInfo.phone}
                    onChange={handleChange}
                  />
                  {getFieldError('phone') && <p className="error-text">연락처를 입력해 주세요.</p>}
                </div>
              </div>

              <div className="checkout-form-row">
                <label htmlFor="zonecode">우편번호</label>
                <div className="checkout-address-row">
                  <input
                    id="zonecode"
                    name="zonecode"
                    type="text"
                    maxLength={5}
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

              {/* 주소 필드 */}
              <div className="checkout-form-row">
                <label htmlFor="address">주소</label>
                <input
                  id="address"
                  name="address"
                  type="text"
                  maxLength={50}
                  className={`checkout-form-control ${getFieldError('address') ? 'input-error' : ''}`}
                  placeholder="서울특별시 강남구 어느곳 어느날 123"
                  value={shippingInfo.address}
                  onChange={handleChange}
                />
                {getFieldError('address') && <p className="error-text">주소를 입력해 주세요.</p>}
              </div>

              {/* 상세주소 필드 */}
              <div className="checkout-form-row">
                <label htmlFor="detailAddress">상세주소</label>
                <input
                  id="detailAddress"
                  name="detailAddress"
                  type="text"
                  maxLength={50}
                  className={`checkout-form-control ${getFieldError('detailAddress') ? 'input-error' : ''}`}
                  placeholder="101동 1004호"
                  value={shippingInfo.detailAddress}
                  onChange={handleChange}
                />
                {getFieldError('detailAddress') && (
                  <p className="error-text">상세주소를 입력해 주세요.</p>
                )}
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
                {orderItems.length > 0 ? (
                  orderItems.map((item) => (
                    <div key={item.id} className="checkout-mini-item">
                      {item.imageUrl ? (
                        <img className="checkout-mini-img" src={item.imageUrl} alt={item.name} />
                      ) : (
                        <div className="checkout-mini-img-placeholder">IMAGE</div>
                      )}
                      <div className="checkout-mini-info">
                        <div className="checkout-mini-name">{item.name}</div>
                        <div className="checkout-mini-sub">
                          {item.option || `SIZE / ${item.size || 'L'}`}
                        </div>
                      </div>
                      <div className="checkout-mini-price">₩ {item.price.toLocaleString()}</div>
                      <div className="checkout-mini-qty">x {item.quantity}</div>
                    </div>
                  ))
                ) : (
                  <div className="checkout-empty">주문할 상품이 없습니다.</div>
                )}
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
                {discountAmount > 0 && (
                  <div className="checkout-summary-row checkout-discount-row">
                    <span>할인 금액</span>
                    <span>- ₩ {discountAmount.toLocaleString()}</span>
                  </div>
                )}
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
