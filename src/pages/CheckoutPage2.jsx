import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { getCoupons } from '@/api/coupons';
import { createOrder } from '@/api/orders';
import { registerCreatedOrder } from '@/hooks/useOrders';
import { useCartStore } from '@/store/cartStore';
import useAuthStore from '@/store/authStore';
import '@/styles/checkout.css';

const POINT_EARN_RATE = 0.05;
const MIN_POINT_USE = 1500;

function normalizeCoupon(coupon, index) {
  const couponId = coupon?.couponId ?? coupon?.id ?? coupon?.code ?? `coupon-${index}`;
  const expiresAt = coupon?.expiresAt ?? coupon?.expiredAt ?? coupon?.endDate ?? null;
  const isExpired =
    coupon?.status === 'expired' ||
    Boolean(expiresAt && new Date(expiresAt).getTime() < Date.now());
  const isUsed = coupon?.status === 'used' || Boolean(coupon?.usedAt) || Boolean(coupon?.isUsed);

  const discountType = String(
    coupon?.discountType ?? coupon?.type ?? coupon?.discountMethod ?? 'fixed'
  ).toLowerCase();

  const rawDiscountValue = Number(
    coupon?.discountValue ?? coupon?.amount ?? coupon?.discountAmount ?? coupon?.discountRate ?? 0
  );

  return {
    couponId: String(couponId),
    name: coupon?.name ?? coupon?.couponName ?? coupon?.title ?? 'ARC 쿠폰',
    discountType,
    discountValue: Number.isFinite(rawDiscountValue) ? rawDiscountValue : 0,
    maxDiscount: Math.max(0, Number(coupon?.maxDiscount ?? coupon?.maximumDiscount ?? 0) || 0),
    minOrderAmount: Math.max(0, Number(coupon?.minOrderAmount ?? coupon?.minimumAmount ?? 0) || 0),
    expiresAt,
    status: isExpired ? 'expired' : isUsed ? 'used' : 'available',
  };
}

function getAvailableCoupons(coupons) {
  return (Array.isArray(coupons) ? coupons : [])
    .map(normalizeCoupon)
    .filter((coupon) => coupon.status === 'available');
}

function getCouponDiscountAmount(productTotal, coupon) {
  if (!coupon || productTotal < coupon.minOrderAmount) {
    return 0;
  }

  const discountAmount =
    coupon.discountType === 'percent' || coupon.discountType === 'rate'
      ? Math.floor(
          productTotal *
            (coupon.discountValue > 0 && coupon.discountValue <= 1
              ? coupon.discountValue
              : coupon.discountValue / 100)
        )
      : Math.floor(coupon.discountValue);

  const cappedDiscountAmount =
    coupon.maxDiscount > 0 ? Math.min(discountAmount, coupon.maxDiscount) : discountAmount;

  return Math.max(0, Math.min(productTotal, cappedDiscountAmount));
}

function getCouponLabel(coupon) {
  const discountLabel =
    coupon.discountType === 'percent' || coupon.discountType === 'rate'
      ? `${
          coupon.discountValue > 0 && coupon.discountValue <= 1
            ? coupon.discountValue * 100
            : coupon.discountValue
        }% 할인`
      : `${coupon.discountValue.toLocaleString()}원 할인`;

  const conditionLabel =
    coupon.minOrderAmount > 0 ? ` · ${coupon.minOrderAmount.toLocaleString()}원 이상` : '';

  return `[${discountLabel}] ${coupon.name}${conditionLabel}`;
}

function CheckoutPage2() {
  const navigate = useNavigate();
  const location = useLocation();
  const removeOrderedItems = useCartStore((state) => state.removeOrderedItems);
  const user = useAuthStore((state) => state.user);
  const fetchMe = useAuthStore((state) => state.fetchMe);
  const patchUserSummary = useAuthStore((state) => state.patchUserSummary);
  const [couponItems, setCouponItems] = useState([]);
  const [isCouponLoading, setIsCouponLoading] = useState(true);
  const [couponError, setCouponError] = useState('');

  const availableCoupons = useMemo(() => getAvailableCoupons(couponItems), [couponItems]);

  const {
    orderItems = [],
    shippingInfo = {},
    paymentMethod: savedPaymentMethod = 'card',
    selectedCoupon: savedSelectedCoupon = '',
    pointsToUse: savedPointsToUse = 0,
  } = location.state || {};

  const productTotal = orderItems.reduce((total, item) => total + item.price * item.quantity, 0);
  const deliveryFee = 0;
  const pointBalance = Math.max(
    0,
    Number(user?.points ?? user?.pointBalance ?? user?.mileage ?? 0) || 0
  );

  const [paymentMethod, setPaymentMethod] = useState(savedPaymentMethod);
  const [selectedCoupon, setSelectedCoupon] = useState(() =>
    savedSelectedCoupon ? String(savedSelectedCoupon) : ''
  );
  const [pointInput, setPointInput] = useState(() => {
    const savedPoints = Math.max(0, Number(savedPointsToUse) || 0);

    return savedPoints >= MIN_POINT_USE ? String(savedPoints) : '';
  });
  const [modalState, setModalState] = useState('none');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let isActive = true;

    const loadCoupons = async () => {
      setIsCouponLoading(true);
      setCouponError('');

      try {
        const response = await getCoupons();
        const nextCoupons = Array.isArray(response?.data) ? response.data : [];

        if (isActive) {
          setCouponItems(nextCoupons);
        }
      } catch (error) {
        if (isActive) {
          setCouponItems([]);
          setCouponError(error.message || '쿠폰 정보를 불러오지 못했습니다.');
        }
      } finally {
        if (isActive) {
          setIsCouponLoading(false);
        }
      }
    };

    void loadCoupons();

    return () => {
      isActive = false;
    };
  }, []);

  const selectedCouponInfo =
    availableCoupons.find((coupon) => coupon.couponId === selectedCoupon) ?? null;
  const appliedCouponId =
    selectedCouponInfo && productTotal >= selectedCouponInfo.minOrderAmount
      ? selectedCouponInfo.couponId
      : '';
  const discountAmount = getCouponDiscountAmount(productTotal, selectedCouponInfo);
  const maxUsablePoints = Math.max(
    0,
    Math.min(pointBalance, productTotal + deliveryFee - discountAmount)
  );
  const requestedPoints = Math.min(
    Math.max(0, Number(pointInput.replace(/[^0-9]/g, '')) || 0),
    maxUsablePoints
  );
  const hasPointMinimumError = requestedPoints > 0 && requestedPoints < MIN_POINT_USE;
  const canUsePoints = pointBalance >= MIN_POINT_USE && maxUsablePoints >= MIN_POINT_USE;
  const appliedPoints = canUsePoints && requestedPoints >= MIN_POINT_USE ? requestedPoints : 0;
  const earnedPoints = Math.floor(productTotal * POINT_EARN_RATE);
  const finalPrice = Math.max(0, productTotal + deliveryFee - discountAmount - appliedPoints);

  const handleBack = () => {
    navigate('/checkout', {
      state: {
        orderItems,
        shippingInfo,
        paymentMethod,
        selectedCoupon: appliedCouponId,
        pointsToUse: appliedPoints,
      },
    });
  };

  const handleCouponChange = (event) => {
    const nextCouponId = event.target.value;
    const nextCoupon = availableCoupons.find((coupon) => coupon.couponId === nextCouponId) ?? null;

    if (nextCoupon && productTotal < nextCoupon.minOrderAmount) {
      alert(
        `${nextCoupon.minOrderAmount.toLocaleString()}원 이상 구매 시 사용할 수 있는 쿠폰입니다.`
      );
      return;
    }

    const nextDiscountAmount = getCouponDiscountAmount(productTotal, nextCoupon);
    const nextMaxUsablePoints = Math.max(
      0,
      Math.min(pointBalance, productTotal + deliveryFee - nextDiscountAmount)
    );

    setSelectedCoupon(nextCouponId);

    const currentPoints = Number(pointInput.replace(/[^0-9]/g, '')) || 0;

    if (currentPoints > nextMaxUsablePoints) {
      setPointInput(nextMaxUsablePoints >= MIN_POINT_USE ? String(nextMaxUsablePoints) : '');
    }
  };

  const handlePointChange = (event) => {
    const numericValue = event.target.value.replace(/[^0-9]/g, '');

    if (!numericValue) {
      setPointInput('');
      return;
    }

    const nextPoints = Math.min(Number(numericValue), maxUsablePoints);

    setPointInput(String(nextPoints));
  };

  const handlePointBlur = () => {
    if (hasPointMinimumError) {
      setPointInput('');
    }
  };

  const handleUseAllPoints = () => {
    if (!canUsePoints) {
      return;
    }

    setPointInput(String(maxUsablePoints));
  };

  const getShippingMemo = (memo) => {
    const memoMap = {
      door: '문 앞에 놓아주세요',
      guard: '경비실에 맡겨주세요',
      call: '배송 전 연락주세요',
    };

    return memoMap[memo] ?? memo ?? '';
  };

  const getOrderItems = () => {
    return orderItems.map((item) => {
      const colorValue =
        typeof item.color === 'string' ? item.color : (item.color?.value ?? item.colorValue ?? '');

      const orderItem = {
        productId: Number(item.productId),
        productType: item.productType ?? 'product',
        color: String(colorValue),
        quantity: Number(item.quantity),
      };

      if (item.size !== undefined && item.size !== null && item.size !== '') {
        orderItem.size = String(item.size);
      }

      return orderItem;
    });
  };

  const getShippingPayload = () => {
    return {
      receiverName: (shippingInfo.name ?? shippingInfo.receiverName ?? '').trim(),
      phone: String(shippingInfo.phone ?? '').replace(/[^\d]/g, ''),
      postcode: String(shippingInfo.zonecode ?? shippingInfo.postcode ?? '').trim(),
      address: String(shippingInfo.address ?? '').trim(),
      detailAddress: String(shippingInfo.detailAddress ?? '').trim(),
      memo: getShippingMemo(shippingInfo.memo),
    };
  };

  const formatPhoneNumber = (phone) => {
    const numbers = String(phone ?? '')
      .replace(/[^\d]/g, '')
      .slice(0, 11);

    if (numbers.length <= 3) {
      return numbers;
    }

    if (numbers.length <= 7) {
      return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    }

    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
  };

  const shippingSummary = getShippingPayload();
  const shippingAddress = [shippingSummary.address, shippingSummary.detailAddress]
    .filter(Boolean)
    .join(' ');

  const handlePayment = () => {
    if (orderItems.length === 0) {
      alert('주문할 상품이 없습니다.');
      navigate('/cart');
      return;
    }

    if (isSubmitting) {
      return;
    }

    if (hasPointMinimumError) {
      alert(`포인트는 ${MIN_POINT_USE.toLocaleString()}P부터 사용할 수 있습니다.`);
      return;
    }

    if (paymentMethod === 'naver') {
      setModalState('naver-sdk');
      return;
    }

    if (paymentMethod === 'kakao') {
      setModalState('kakao-sdk');
      return;
    }

    startPaymentFlow();
  };

  const handleNaverPaySubmit = () => {
    startPaymentFlow();
  };

  const handleKakaoPaySubmit = () => {
    startPaymentFlow();
  };

  const startPaymentFlow = async () => {
    if (isSubmitting) {
      return;
    }

    const apiItems = getOrderItems();
    const shippingPayload = getShippingPayload();

    const invalidItem = apiItems.find(
      (item) =>
        !Number.isInteger(item.productId) ||
        item.productId <= 0 ||
        !item.productType ||
        !item.color ||
        !Number.isInteger(item.quantity) ||
        item.quantity <= 0
    );

    if (invalidItem) {
      alert('상품 옵션 정보가 올바르지 않습니다. 장바구니에서 상품을 다시 확인해주세요.');
      return;
    }

    if (
      !shippingPayload.receiverName ||
      !shippingPayload.phone ||
      !shippingPayload.postcode ||
      !shippingPayload.address ||
      !shippingPayload.detailAddress
    ) {
      alert('배송지 정보를 모두 입력해주세요.');
      handleBack();
      return;
    }

    setIsSubmitting(true);
    setModalState('processing');

    try {
      const response = await createOrder({
        items: apiItems,
        shipping: shippingPayload,
        paymentMethod,
        couponId: appliedCouponId || undefined,
        pointsUsed: appliedPoints,
      });

      const order = response?.data;

      if (!response?.success || !order) {
        throw new Error(response?.message || '주문을 완료하지 못했습니다.');
      }

      registerCreatedOrder({
        order,
        orderItems,
        shipping: shippingPayload,
        paymentMethod,
        finalAmount: finalPrice,
        productTotal,
        couponId: appliedCouponId || undefined,
        pointsUsed: appliedPoints,
      });

      const serverEarnedPoints = Math.max(
        0,
        Number(order?.pointsEarned ?? response?.pointsEarned ?? earnedPoints) || 0
      );

      await fetchMe({ force: true }).catch(() => null);

      const refreshedCouponsResponse = await getCoupons().catch(() => null);
      const refreshedCoupons = Array.isArray(refreshedCouponsResponse?.data)
        ? refreshedCouponsResponse.data
        : null;

      if (refreshedCoupons) {
        const availableCouponCount = getAvailableCoupons(refreshedCoupons).length;

        patchUserSummary({
          availableCouponCount,
          couponCount: availableCouponCount,
        });
      }

      setModalState('complete');

      window.setTimeout(() => {
        removeOrderedItems(orderItems);

        navigate('/checkout/complete', {
          state: {
            order,
            orderItems,
            shippingInfo: shippingPayload,
            pointsUsed: appliedPoints,
            earnedPoints: serverEarnedPoints,
          },
        });
      }, 1200);
    } catch (error) {
      setModalState('none');

      if (error.message?.includes('쿠폰')) {
        setSelectedCoupon('');
        alert('선택한 쿠폰을 현재 사용할 수 없습니다. 쿠폰 선택을 해제했으니 다시 결제해주세요.');
        return;
      }

      alert(error.message || '주문을 완료하지 못했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="checkout-page">
      <div className="checkout-container">
        <div className="checkout-step-indicator">
          <div className="checkout-step">
            <span className="checkout-step-num">1</span>
            배송지 정보
          </div>

          <div className="checkout-step-line" />

          <div className="checkout-step checkout-step-active">
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
            <section className="checkout-box-section checkout-shipping-summary-section">
              <div className="checkout-shipping-summary-head">
                <div>
                  <span className="checkout-shipping-summary-label">배송지 정보</span>
                  <strong>{shippingSummary.receiverName || '받는 사람 정보 없음'}</strong>
                </div>

                <button type="button" onClick={handleBack}>
                  수정
                </button>
              </div>

              <div className="checkout-shipping-summary-body">
                <p>{formatPhoneNumber(shippingSummary.phone) || '연락처 정보 없음'}</p>

                <p className="checkout-shipping-address">
                  {shippingSummary.postcode && <span>[{shippingSummary.postcode}]</span>}
                  {shippingAddress || '주소 정보 없음'}
                </p>

                {shippingSummary.memo && (
                  <p className="checkout-shipping-memo">배송 요청: {shippingSummary.memo}</p>
                )}
              </div>
            </section>

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

              <div className="checkout-coupon-row">
                <div className="checkout-coupon-select">
                  <label htmlFor="couponSelect">쿠폰 선택</label>

                  <select
                    id="couponSelect"
                    className="checkout-form-control"
                    value={appliedCouponId}
                    onChange={handleCouponChange}
                    disabled={isCouponLoading}
                  >
                    <option value="">
                      {isCouponLoading ? '쿠폰을 불러오는 중입니다' : '쿠폰을 선택하세요'}
                    </option>

                    {availableCoupons.map((coupon) => (
                      <option
                        key={coupon.couponId}
                        value={coupon.couponId}
                        disabled={productTotal < coupon.minOrderAmount}
                      >
                        {getCouponLabel(coupon)}
                        {productTotal < coupon.minOrderAmount ? ' (사용 조건 미충족)' : ''}
                      </option>
                    ))}
                  </select>

                  {!isCouponLoading && couponError && (
                    <p className="checkout-coupon-empty">{couponError}</p>
                  )}

                  {!isCouponLoading && !couponError && availableCoupons.length === 0 && (
                    <p className="checkout-coupon-empty">
                      현재 계정에서 사용할 수 있는 쿠폰이 없습니다.
                    </p>
                  )}
                </div>
              </div>
            </section>

            <section className="checkout-box-section checkout-point-section">
              <div className="checkout-box-title">
                <span>C</span>
                포인트 사용
              </div>

              <div className="checkout-point-balance-row">
                <span>보유 포인트</span>
                <strong>{pointBalance.toLocaleString()} P</strong>
              </div>

              <div className="checkout-point-input-row">
                <div className="checkout-point-input-wrap">
                  <input
                    id="pointInput"
                    type="text"
                    inputMode="numeric"
                    className="checkout-form-control checkout-point-input"
                    value={pointInput}
                    onChange={handlePointChange}
                    onBlur={handlePointBlur}
                    placeholder={`${MIN_POINT_USE.toLocaleString()}P부터 사용 가능`}
                    aria-label="사용할 포인트"
                    disabled={!canUsePoints}
                  />
                  <span>P</span>
                </div>

                <button
                  type="button"
                  className="checkout-point-all-button"
                  onClick={handleUseAllPoints}
                  disabled={!canUsePoints}
                >
                  전액 사용
                </button>
              </div>

              <div className="checkout-point-info">
                <span>
                  {MIN_POINT_USE.toLocaleString()} P부터 사용 가능 · 최대{' '}
                  {maxUsablePoints.toLocaleString()} P
                </span>
                <strong>결제 완료 시 {earnedPoints.toLocaleString()} P 적립 예정</strong>
              </div>

              {hasPointMinimumError && (
                <p className="checkout-point-minimum-message">
                  포인트는 {MIN_POINT_USE.toLocaleString()} P부터 사용할 수 있습니다.
                </p>
              )}

              <p className="checkout-point-notice">상품금액의 5%가 포인트로 적립됩니다.</p>
            </section>
          </div>

          <div className="checkout-right">
            <section className="checkout-summary-box">
              <div className="checkout-summary-title">
                <div className="checkout-box-title checkout-order-title">
                  <span>D</span>
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
                          {item.option || (item.size ? `SIZE / ${item.size}` : '')}
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

                <div className="checkout-summary-row checkout-discount-row">
                  <span>할인 금액</span>

                  <span>- ₩ {discountAmount.toLocaleString()}</span>
                </div>

                <div className="checkout-summary-row checkout-point-use-row">
                  <span>포인트 사용</span>

                  <span>- {appliedPoints.toLocaleString()} P</span>
                </div>

                <div className="checkout-summary-row checkout-point-earn-row">
                  <span>적립 예정</span>

                  <span>+ {earnedPoints.toLocaleString()} P</span>
                </div>

                <div className="checkout-summary-row checkout-total-row">
                  <span>총 결제 금액</span>

                  <span>₩ {finalPrice.toLocaleString()}</span>
                </div>
              </div>

              <div className="checkout-btn-action-bar">
                <button
                  type="button"
                  className="checkout-btn-action"
                  onClick={handlePayment}
                  disabled={isSubmitting}
                >
                  결제하기
                </button>
              </div>
            </section>
          </div>
        </div>

        <div className="checkout-bottom-actions">
          <button type="button" className="checkout-back-button" onClick={handleBack}>
            ← 배송지 정보로 돌아가기
          </button>
        </div>
      </div>

      {modalState === 'naver-sdk' && (
        <div className="payment-loading-overlay">
          <div className="naver-pay-sdk-modal">
            <div className="naver-sdk-header">
              <span className="naver-sdk-logo">N Pay</span>

              <span className="naver-sdk-title">주문/결제</span>
            </div>

            <div className="naver-sdk-body">
              <p className="naver-sdk-product">
                {orderItems[0]?.name || '상품'} 외 {orderItems.length}건
              </p>

              <p className="naver-sdk-price">
                총 결제금액: <strong>₩ {finalPrice.toLocaleString()}</strong>
              </p>
            </div>

            <div className="naver-sdk-footer">
              <button
                type="button"
                className="naver-sdk-cancel-btn"
                onClick={() => setModalState('none')}
              >
                취소
              </button>

              <button type="button" className="naver-sdk-pay-btn" onClick={handleNaverPaySubmit}>
                네이버페이 결제하기
              </button>
            </div>
          </div>
        </div>
      )}

      {modalState === 'kakao-sdk' && (
        <div className="payment-loading-overlay">
          <div className="kakao-pay-sdk-modal">
            <div className="kakao-sdk-header">
              <span className="kakao-sdk-logo">KAKAO PAY</span>

              <span className="kakao-sdk-title">주문/결제</span>
            </div>

            <div className="kakao-sdk-body">
              <p className="kakao-sdk-product">
                {orderItems[0]?.name || '상품'} 외 {orderItems.length}건
              </p>

              <p className="kakao-sdk-price">
                총 결제금액: <strong>₩ {finalPrice.toLocaleString()}</strong>
              </p>
            </div>

            <div className="kakao-sdk-footer">
              <button
                type="button"
                className="kakao-sdk-cancel-btn"
                onClick={() => setModalState('none')}
              >
                취소
              </button>

              <button type="button" className="kakao-sdk-pay-btn" onClick={handleKakaoPaySubmit}>
                카카오페이 결제하기
              </button>
            </div>
          </div>
        </div>
      )}

      {modalState === 'processing' && (
        <div className="payment-loading-overlay">
          <div className="payment-loading-modal">
            <div className="payment-spinner" />

            <p className="payment-loading-text">결제가 진행 중입니다.</p>

            <p className="payment-loading-subtext">잠시만 기다려 주십시오.</p>
          </div>
        </div>
      )}

      {modalState === 'complete' && (
        <div className="payment-loading-overlay">
          <div className="payment-loading-modal">
            <div className="payment-complete-icon">✓</div>

            <p className="payment-loading-text">결제가 완료되었습니다!</p>

            <p className="payment-loading-subtext">주문 완료 페이지로 이동합니다.</p>
          </div>
        </div>
      )}
    </section>
  );
}

export default CheckoutPage2;
