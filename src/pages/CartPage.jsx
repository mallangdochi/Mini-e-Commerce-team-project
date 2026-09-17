import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useCartStore } from '@/store/cartStore';
import '@/styles/cart.css';

function CartPage() {
  const navigate = useNavigate();

  const cartItems = useCartStore((state) => state.items);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const removeItems = useCartStore((state) => state.removeItems);
  const syncCart = useCartStore((state) => state.syncCart);

  const previousCartItemIdsRef = useRef(cartItems.map((item) => item.id));
  const [selectedIds, setSelectedIds] = useState(() => cartItems.map((item) => item.id));

  useEffect(() => {
    syncCart({ force: true, mergeGuest: true });
  }, [syncCart]);

  useEffect(() => {
    const nextItemIds = cartItems.map((item) => item.id);
    const previousItemIds = previousCartItemIdsRef.current;

    setSelectedIds((currentIds) => {
      const wasAllSelected =
        previousItemIds.length === 0 ||
        previousItemIds.every((itemId) => currentIds.includes(itemId));

      if (wasAllSelected) {
        return nextItemIds;
      }

      return currentIds.filter((itemId) => nextItemIds.includes(itemId));
    });

    previousCartItemIdsRef.current = nextItemIds;
  }, [cartItems]);

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelectedIds(cartItems.map((item) => item.id));
      return;
    }

    setSelectedIds([]);
  };

  const handleToggleOne = (itemId) => {
    setSelectedIds((currentIds) => {
      if (currentIds.includes(itemId)) {
        return currentIds.filter((id) => id !== itemId);
      }

      return [...currentIds, itemId];
    });
  };

  const handleDeleteSelected = () => {
    removeItems(selectedIds);
    setSelectedIds([]);
  };

  const handleUpdateQuantity = (itemId, nextQuantity) => {
    updateQuantity(itemId, nextQuantity);
  };

  const handleRemoveItem = (itemId) => {
    removeItem(itemId);
    setSelectedIds((currentIds) => currentIds.filter((id) => id !== itemId));
  };

  const selectedItems = cartItems.filter((item) => selectedIds.includes(item.id));
  const totalPrice = selectedItems.reduce((total, item) => total + item.price * item.quantity, 0);
  const isAllSelected =
    cartItems.length > 0 && cartItems.every((item) => selectedIds.includes(item.id));

  const handleContinueShopping = () => {
    navigate('/products');
  };

  const handleOrder = () => {
    if (selectedItems.length === 0) {
      alert('주문할 상품을 선택해주세요.');
      return;
    }

    navigate('/checkout', {
      state: {
        orderItems: selectedItems,
        finalPrice: totalPrice,
      },
    });
  };

  const getProductPath = (item) => {
    const query = item.productType === 'set' ? '?type=set' : '';

    return `/products/${item.productId}${query}`;
  };

  return (
    <section className="cart-page">
      <div className="cart-container">
        <h1 className="cart-section-title">SHOPPING CART</h1>

        <div className="cart-control-bar">
          <label className="cart-checkbox-label">
            <input
              type="checkbox"
              className="cart-custom-checkbox"
              checked={isAllSelected}
              onChange={handleSelectAll}
            />
            <span>
              전체선택 ({selectedIds.length}/{cartItems.length})
            </span>
          </label>

          <button
            type="button"
            className="cart-btn-delete-selected"
            onClick={handleDeleteSelected}
            disabled={selectedIds.length === 0}
          >
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
            cartItems.map((item) => {
              const stock = Number(item.stock);
              const hasStockLimit = Number.isFinite(stock) && stock > 0;
              const canIncrease = !hasStockLimit || item.quantity < stock;

              return (
                <div className="cart-item-row" key={item.id}>
                  <div className="cart-checkbox-cell">
                    <input
                      type="checkbox"
                      className="cart-custom-checkbox"
                      checked={selectedIds.includes(item.id)}
                      onChange={() => handleToggleOne(item.id)}
                      aria-label={`${item.name} 선택`}
                    />
                  </div>

                  <Link to={getProductPath(item)} className="cart-product-cell">
                    {item.imageUrl ? (
                      <img className="cart-item-img" src={item.imageUrl} alt={item.name} />
                    ) : (
                      <div className="cart-item-img-placeholder">IMAGE</div>
                    )}

                    <div className="cart-item-info">
                      <div className="cart-item-name">{item.name}</div>

                      {item.option && <div className="cart-item-sub">{item.option}</div>}
                    </div>
                  </Link>

                  <div className="cart-item-price">₩ {item.price.toLocaleString()}</div>

                  <div className="cart-quantity-box">
                    <button
                      type="button"
                      onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      aria-label={`${item.name} 수량 감소`}
                    >
                      −
                    </button>

                    <span className="cart-qty">{item.quantity}</span>

                    <button
                      type="button"
                      onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                      disabled={!canIncrease}
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
              );
            })
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

            <div className="cart-summary-row cart-summary-total">
              <span>총 결제금액</span>
              <span>₩ {totalPrice.toLocaleString()}</span>
            </div>

            <div className="cart-btn-action-bar">
              <button
                type="button"
                className="cart-btn-action"
                onClick={handleOrder}
                disabled={selectedItems.length === 0}
              >
                주문하기
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default CartPage;
