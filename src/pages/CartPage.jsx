import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import '@/styles/cart.css';

const initialCartItems = [
  {
    id: 1,
    name: 'ARC Product Name',
    option: 'BLACK / L',
    price: 49000,
    quantity: 1,
    imageUrl: '',
  },
  {
    id: 2,
    name: 'ARC Product Name',
    option: 'BLACK / L',
    price: 49000,
    quantity: 1,
    imageUrl: '',
  },
  {
    id: 3,
    name: 'ARC Product Name',
    option: 'BLACK / L',
    price: 49000,
    quantity: 1,
    imageUrl: '',
  },
];

function CartPage() {
  const navigate = useNavigate();

  const [cartItems, setCartItems] = useState(initialCartItems);

  // 기본적으로 모든 상품이 선택된 상태로 시작
  const [selectedIds, setSelectedIds] = useState(initialCartItems.map((item) => item.id));

  // 전체 선택 / 해제 핸들러
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(cartItems.map((item) => item.id));
    } else {
      setSelectedIds([]);
    }
  };

  // 개별 상품 선택 / 해제 핸들러
  const handleToggleOne = (itemId) => {
    if (selectedIds.includes(itemId)) {
      setSelectedIds(selectedIds.filter((id) => id !== itemId));
    } else {
      setSelectedIds([...selectedIds, itemId]);
    }
  };

  // 선택 삭제 기능
  const handleDeleteSelected = () => {
    const nextItems = cartItems.filter((item) => !selectedIds.includes(item.id));
    setCartItems(nextItems);
    setSelectedIds([]);
  };

  const handleUpdateQuantity = (itemId, delta) => {
    setCartItems((currentItems) =>
      currentItems.map((item) =>
        item.id === itemId
          ? {
              ...item,
              quantity: Math.max(1, item.quantity + delta),
            }
          : item
      )
    );
  };

  const handleRemoveItem = (itemId) => {
    setCartItems((currentItems) => currentItems.filter((item) => item.id !== itemId));
    setSelectedIds((currentIds) => currentIds.filter((id) => id !== itemId));
  };

  // 선택된 상품들만 필터링하여 총금액 계산
  const selectedItems = cartItems.filter((item) => selectedIds.includes(item.id));
  const totalPrice = selectedItems.reduce((total, item) => total + item.price * item.quantity, 0);

  const isAllSelected = cartItems.length > 0 && selectedIds.length === cartItems.length;

  const handleContinueShopping = () => {
    navigate('/products');
  };

  const handleOrder = () => {
    if (selectedItems.length === 0) {
      alert('주문할 상품을 선택해주세요.');
      return;
    }
    // 선택된 상품들(orderItems)과 총 금액(finalPrice)을 state로 전달
    navigate('/checkout', {
      state: {
        orderItems: selectedItems,
        finalPrice: totalPrice,
      },
    });
  };

  return (
    <section className="cart-page">
      <div className="cart-container">
        <h1 className="cart-section-title">SHOPPING CART</h1>

        {/* 전체선택 및 선택삭제 상단 컨트롤 바 */}
        <div className="cart-control-bar">
          <label className="cart-checkbox-label">
            <input
              type="checkbox"
              className="cart-custom-checkbox"
              checked={isAllSelected}
              onChange={handleSelectAll}
            />
            <span>전체선택</span>
          </label>
          <button type="button" className="cart-btn-delete-selected" onClick={handleDeleteSelected}>
            선택삭제
          </button>
        </div>

        <div className="cart-table-header">
          <span aria-hidden="true" />
          <span>상품 정보</span>
          <span>가격</span>
          <span>수량</span>
          <span>합계</span>
          <span aria-hidden="true" />
        </div>

        <div className="cart-item-list">
          {cartItems.length > 0 ? (
            cartItems.map((item) => (
              <div className="cart-item-row" key={item.id}>
                {/* 개별 체크박스 */}
                <div className="cart-checkbox-cell">
                  <input
                    type="checkbox"
                    className="cart-custom-checkbox"
                    checked={selectedIds.includes(item.id)}
                    onChange={() => handleToggleOne(item.id)}
                    aria-label={`${item.name} 선택`}
                  />
                </div>

                <div className="cart-product-cell">
                  {item.imageUrl ? (
                    <img className="cart-item-img" src={item.imageUrl} alt={item.name} />
                  ) : (
                    <div className="cart-item-img-placeholder">IMAGE</div>
                  )}

                  <div className="cart-item-info">
                    <div className="cart-item-name">{item.name}</div>
                    <div className="cart-item-sub">{item.option}</div>
                  </div>
                </div>

                <div className="cart-item-price">₩ {item.price.toLocaleString()}</div>

                <div className="cart-quantity-box">
                  <button
                    type="button"
                    onClick={() => handleUpdateQuantity(item.id, -1)}
                    aria-label={`${item.name} 수량 감소`}
                  >
                    −
                  </button>

                  <span className="cart-qty">{item.quantity}</span>

                  <button
                    type="button"
                    onClick={() => handleUpdateQuantity(item.id, 1)}
                    aria-label={`${item.name} 수량 증가`}
                  >
                    +
                  </button>
                </div>

                <div className="cart-item-total">
                  ₩ {(item.price * item.quantity).toLocaleString()}
                </div>

                <button
                  type="button"
                  className="cart-remove-btn"
                  onClick={() => handleRemoveItem(item.id)}
                  aria-label={`${item.name} 장바구니에서 삭제`}
                >
                  ✕
                </button>
              </div>
            ))
          ) : (
            <div className="cart-empty">장바구니에 담긴 상품이 없습니다.</div>
          )}
        </div>

        <div className="cart-bottom-section">
          <button type="button" className="cart-btn-prev" onClick={handleContinueShopping}>
            &lt; 쇼핑 계속하기
          </button>

          <div className="cart-summary-box">
            <div className="cart-summary-row">
              <span>상품금액</span>
              <span>₩ {totalPrice.toLocaleString()}</span>
            </div>

            <div className="cart-summary-row">
              <span>배송비</span>
              <span>{totalPrice > 0 ? '무료' : '₩ 0'}</span>
            </div>

            {/* 붉은색 총 결제금액 적용 */}
            <div className="cart-summary-row cart-summary-total">
              <span>총 결제금액</span>
              <span>₩ {totalPrice.toLocaleString()}</span>
            </div>

            <button
              type="button"
              className="cart-btn-action"
              onClick={handleOrder}
              disabled={selectedItems.length === 0}
            >
              주문하기 &gt;
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default CartPage;
