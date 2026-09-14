import { useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import '@/styles/checkout2.css';

function CheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    orderItems = [],
    shippingInfo: savedShippingInfo,
    paymentMethod,
    selectedCoupon,
  } = location.state || {};

  const addressDialog = useRef(null);
  const addressContainer = useRef(null);

  const [addressLoading, setAddressLoading] = useState(false);
  const [addressError, setAddressError] = useState('');

  const [shippingInfo, setShippingInfo] = useState(
    savedShippingInfo || {
      name: '',
      phone: '',
      zonecode: '',
      address: '',
      detailAddress: '',
      memo: '',
    }
  );

  const [activeErrorField, setActiveErrorField] = useState(null);

  const formatPhoneNumber = (value) => {
    const numbers = value.replace(/[^\d]/g, '').slice(0, 11);

    if (numbers.length <= 3) {
      return numbers;
    }

    if (numbers.length <= 7) {
      return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    }

    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    if (name === 'phone') {
      setShippingInfo((prev) => ({
        ...prev,
        phone: formatPhoneNumber(value),
      }));

      return;
    }

    if (name === 'detailAddress') {
      const filteredValue = value.replace(/[^ㄱ-ㅎㅏ-ㅣ가-힣a-zA-Z0-9\s(),#.-]/g, '').slice(0, 50);

      setShippingInfo((prev) => ({
        ...prev,
        detailAddress: filteredValue,
      }));

      return;
    }

    setShippingInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddressSearch = async () => {
    if (addressLoading) {
      return;
    }

    setAddressLoading(true);
    setAddressError('');

    try {
      if (!window.kakao?.Postcode && !window.daum?.Postcode) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');

          const timer = window.setTimeout(() => {
            reject(new Error('주소 검색 연결 시간이 초과되었습니다.'));
          }, 15000);

          script.src = 'https://t1.kakaocdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';

          script.onload = () => {
            window.clearTimeout(timer);
            resolve();
          };

          script.onerror = () => {
            window.clearTimeout(timer);
            reject(new Error('주소 검색 서비스를 불러오지 못했습니다.'));
          };

          document.head.appendChild(script);
        });
      }

      const Postcode = window.kakao?.Postcode || window.daum?.Postcode;

      if (!Postcode) {
        throw new Error('주소 검색 서비스를 불러오지 못했습니다.');
      }

      addressContainer.current.replaceChildren();
      addressDialog.current.showModal();

      new Postcode({
        width: '100%',
        height: '100%',

        oncomplete: (data) => {
          setShippingInfo((prev) => ({
            ...prev,
            zonecode: data.zonecode,
            address: data.address,
            detailAddress: '',
          }));

          setActiveErrorField(null);
          addressDialog.current.close();

          window.requestAnimationFrame(() => {
            document.getElementById('checkoutDetailAddress')?.focus();
          });
        },
      }).embed(addressContainer.current);
    } catch (error) {
      addressDialog.current?.close();

      setAddressError(`${error.message} 일반 브라우저에서 다시 시도해 주세요.`);
    } finally {
      setAddressLoading(false);
    }
  };

  const getFirstEmptyField = () => {
    if (shippingInfo.name.trim() === '') {
      return 'name';
    }

    if (shippingInfo.phone.trim() === '') {
      return 'phone';
    }

    if (shippingInfo.zonecode.trim() === '') {
      return 'zonecode';
    }

    if (shippingInfo.address.trim() === '') {
      return 'address';
    }

    if (shippingInfo.detailAddress.trim() === '') {
      return 'detailAddress';
    }

    return null;
  };

  const getFieldError = (fieldName) => {
    return activeErrorField === fieldName && shippingInfo[fieldName].trim() === '';
  };

  const handleNextStep = () => {
    if (orderItems.length === 0) {
      alert('주문할 상품이 없습니다.');
      navigate('/cart');
      return;
    }

    const emptyField = getFirstEmptyField();

    setActiveErrorField(emptyField);

    if (emptyField !== null) {
      return;
    }

    navigate('/checkout2', {
      state: {
        orderItems,
        shippingInfo,
        paymentMethod,
        selectedCoupon,
      },
    });
  };

  const productTotal = orderItems.reduce((total, item) => total + item.price * item.quantity, 0);

  const deliveryFee = 0;
  const finalPrice = productTotal + deliveryFee;

  return (
    <section className="checkout-page">
      <dialog
        ref={addressDialog}
        className="checkout-address-dialog"
        aria-labelledby="checkoutAddressDialogTitle"
      >
        <div className="checkout-address-dialog-header">
          <h2 id="checkoutAddressDialogTitle">우편번호 찾기</h2>

          <button
            type="button"
            onClick={() => addressDialog.current?.close()}
            aria-label="주소 검색 닫기"
          >
            ✕
          </button>
        </div>

        <div ref={addressContainer} className="checkout-address-embed" />
      </dialog>

      <div className="checkout-container">
        <div className="checkout-step-indicator">
          <div className="checkout-step checkout-step-active">
            <span className="checkout-step-num">1</span>
            배송지 정보
          </div>

          <div className="checkout-step-line" />

          <div className="checkout-step">
            <span className="checkout-step-num">2</span>
            결제 수단
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

              <div className="checkout-recipient-row">
                <div className="checkout-form-row">
                  <label htmlFor="name">이름</label>

                  <input
                    id="name"
                    name="name"
                    type="text"
                    maxLength={10}
                    className={`checkout-form-control ${
                      getFieldError('name') ? 'input-error' : ''
                    }`}
                    placeholder="홍길동"
                    value={shippingInfo.name}
                    onChange={handleChange}
                  />

                  {getFieldError('name') && <p className="error-text">이름을 입력해 주세요.</p>}
                </div>

                <div className="checkout-form-row">
                  <label htmlFor="phone">연락처</label>

                  <input
                    id="phone"
                    name="phone"
                    type="text"
                    inputMode="numeric"
                    maxLength={13}
                    className={`checkout-form-control ${
                      getFieldError('phone') ? 'input-error' : ''
                    }`}
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
                    className={`checkout-form-control ${
                      getFieldError('zonecode') ? 'input-error' : ''
                    }`}
                    placeholder="우편번호"
                    value={shippingInfo.zonecode}
                    readOnly
                  />

                  <button
                    type="button"
                    className="checkout-btn-address"
                    onClick={handleAddressSearch}
                    disabled={addressLoading}
                  >
                    {addressLoading ? '검색 중' : '주소 검색'}
                  </button>
                </div>

                {getFieldError('zonecode') && (
                  <p className="error-text">주소 검색을 진행해 주세요.</p>
                )}

                {addressError && <p className="error-text">{addressError}</p>}
              </div>

              <div className="checkout-form-row">
                <label htmlFor="address">주소</label>

                <input
                  id="address"
                  name="address"
                  type="text"
                  className={`checkout-form-control ${
                    getFieldError('address') ? 'input-error' : ''
                  }`}
                  placeholder="주소 검색을 이용해 주세요."
                  value={shippingInfo.address}
                  readOnly
                />

                {getFieldError('address') && <p className="error-text">주소를 입력해 주세요.</p>}
              </div>

              <div className="checkout-form-row">
                <label htmlFor="checkoutDetailAddress">상세주소</label>

                <input
                  id="checkoutDetailAddress"
                  name="detailAddress"
                  type="text"
                  maxLength={50}
                  className={`checkout-form-control ${
                    getFieldError('detailAddress') ? 'input-error' : ''
                  }`}
                  placeholder="101동 1004호"
                  value={shippingInfo.detailAddress}
                  onChange={handleChange}
                />

                {getFieldError('detailAddress') && (
                  <p className="error-text">상세주소를 입력해 주세요.</p>
                )}
              </div>

              <div className="checkout-form-row checkout-form-row-last">
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
                <div className="checkout-box-title checkout-order-title">주문 상품</div>

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

                <div className="checkout-summary-row checkout-total-row">
                  <span>결제 예정 금액</span>

                  <span>₩ {finalPrice.toLocaleString()}</span>
                </div>
              </div>

              <div className="checkout-btn-action-bar">
                <button type="button" className="checkout-btn-action" onClick={handleNextStep}>
                  결제 수단으로 이동
                </button>
              </div>
            </section>
          </div>
        </div>
      </div>
    </section>
  );
}

export default CheckoutPage;
