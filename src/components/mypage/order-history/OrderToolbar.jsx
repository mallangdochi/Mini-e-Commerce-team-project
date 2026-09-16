import { ORDER_TABS, PERIOD_OPTIONS } from './orderHistoryUtils';

function OrderToolbar({ selectedTab, periodMonths, onTabChange, onPeriodChange }) {
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

      <select
        value={periodMonths}
        onChange={(event) => onPeriodChange(Number(event.target.value))}
        aria-label="주문 조회 기간"
      >
        {PERIOD_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export default OrderToolbar;
