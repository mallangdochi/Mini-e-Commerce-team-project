import { useEffect, useRef, useState } from 'react';

import { ORDER_TABS, PERIOD_OPTIONS } from './orderHistoryUtils';

function OrderToolbar({ selectedTab, periodMonths, onTabChange, onPeriodChange }) {
  const [isPeriodOpen, setIsPeriodOpen] = useState(false);
  const periodControlRef = useRef(null);

  const selectedPeriod =
    PERIOD_OPTIONS.find((option) => Number(option.value) === Number(periodMonths)) ??
    PERIOD_OPTIONS[0];

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (!periodControlRef.current?.contains(event.target)) {
        setIsPeriodOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsPeriodOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handlePeriodSelect = (value) => {
    onPeriodChange(Number(value));
    setIsPeriodOpen(false);
  };

  return (
    <div className="order-history-toolbar">
      <div className="order-history-tabs">
        {ORDER_TABS.map((tab) => (
          <button
            type="button"
            key={tab.value}
            className={selectedTab === tab.value ? 'is-active' : ''}
            onClick={() => onTabChange(tab.value)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div
        className="order-history-period-control"
        ref={periodControlRef}
      >
        <span>조회 기간</span>

        <button
          type="button"
          className={`order-history-period-trigger${isPeriodOpen ? ' is-open' : ''}`}
          aria-haspopup="listbox"
          aria-expanded={isPeriodOpen}
          onClick={() => setIsPeriodOpen((prev) => !prev)}
        >
          <span>{selectedPeriod.label}</span>
          <span className="order-history-period-chevron" aria-hidden="true" />
        </button>

        {isPeriodOpen && (
          <div
            className="order-history-period-menu"
            role="listbox"
            aria-label="주문 조회 기간"
          >
            {PERIOD_OPTIONS.map((option) => {
              const isSelected = Number(option.value) === Number(periodMonths);

              return (
                <button
                  type="button"
                  key={option.value}
                  role="option"
                  aria-selected={isSelected}
                  className={isSelected ? 'is-selected' : ''}
                  onClick={() => handlePeriodSelect(option.value)}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default OrderToolbar;
