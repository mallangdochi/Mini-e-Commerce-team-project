import { useEffect, useMemo, useState } from 'react';

import { createInquiry, deleteInquiry, getInquiries, updateInquiry } from '@/api/inquiries';
import ConfirmModal from '@/components/common/ConfirmModal';
import EmptyState from '@/components/common/EmptyState';
import ErrorState from '@/components/common/ErrorState';

import useOrders from '@/hooks/useOrders';
import '@/styles/order-history.css';
import '@/styles/inquiry-history.css';
import { formatDateTime, formatCompactDate, isWithinPeriod } from '@/utils/formatters';
import OrderSummary from './order-history/OrderSummary';

const INQUIRY_TABS = [
  { label: '전체', value: 'all' },
  { label: '답변 대기', value: 'waiting' },
  { label: '답변 완료', value: 'answered' },
];

const INQUIRY_CATEGORIES = [
  '상품',
  '주문 / 결제',
  '배송',
  '취소 / 교환 / 반품',
  '회원 / 혜택',
  '기타',
];

const PERIOD_OPTIONS = [
  { label: '최근 3개월', value: 3 },
  { label: '최근 6개월', value: 6 },
  { label: '최근 1년', value: 12 },
  { label: '전체 기간', value: 0 },
];

const EMPTY_FORM = {
  category: '상품',
  orderId: '',
  title: '',
  content: '',
};

function InquiryHistoryPage() {
  const { user, orders, errorMessage } = useOrders();
  const [inquiries, setInquiries] = useState([]);
  const [inquiryLoadError, setInquiryLoadError] = useState('');
  const [isInquiryLoading, setIsInquiryLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [periodMonths, setPeriodMonths] = useState(3);
  const [expandedId, setExpandedId] = useState(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingInquiryId, setEditingInquiryId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [saveToastVisible, setSaveToastVisible] = useState(false);

  const email = user?.email ?? '';
  const couponCount = Number(user?.couponCount ?? user?.availableCouponCount ?? 0);
  const pointBalance = Number(user?.points ?? user?.pointBalance ?? user?.mileage ?? 0);
  const wishlistCount = Number(user?.wishlistCount ?? user?.wishCount ?? 0);

  const loadInquiries = async () => {
    setIsInquiryLoading(true);
    setInquiryLoadError('');

    try {
      const response = await getInquiries();
      setInquiries(Array.isArray(response?.data) ? response.data : []);
    } catch (error) {
      setInquiryLoadError(error.message || '문의 내역을 불러오지 못했습니다.');
    } finally {
      setIsInquiryLoading(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadInquiries();
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  const counts = useMemo(() => {
    return inquiries.reduce(
      (acc, inquiry) => {
        acc.all += 1;
        acc[inquiry.status === 'answered' ? 'answered' : 'waiting'] += 1;

        return acc;
      },
      {
        all: 0,
        waiting: 0,
        answered: 0,
      }
    );
  }, [inquiries]);

  const filteredInquiries = useMemo(() => {
    return [...inquiries]
      .filter((inquiry) => {
        const tabMatched =
          selectedTab === 'all' ||
          (selectedTab === 'waiting' && inquiry.status !== 'answered') ||
          (selectedTab === 'answered' && inquiry.status === 'answered');

        const categoryMatched =
          selectedCategory === '전체' || inquiry.category === selectedCategory;

        const periodMatched = isWithinPeriod(inquiry.createdAt, periodMonths);

        return tabMatched && categoryMatched && periodMatched;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [inquiries, periodMonths, selectedCategory, selectedTab]);

  const openNewInquiry = () => {
    setEditingInquiryId(null);
    setForm(EMPTY_FORM);
    setFormError('');
    setIsEditorOpen(true);
  };

  const openEditInquiry = (inquiry) => {
    setEditingInquiryId(inquiry.inquiryId);
    setForm({
      category: inquiry.category,
      orderId: inquiry.orderId ?? '',
      title: inquiry.title,
      content: inquiry.content,
    });
    setFormError('');
    setIsEditorOpen(true);
  };

  const closeEditor = () => {
    setIsEditorOpen(false);
    setEditingInquiryId(null);
    setForm(EMPTY_FORM);
    setFormError('');
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
    setFormError('');
  };

  const showSavedToast = () => {
    setSaveToastVisible(true);

    window.setTimeout(() => {
      setSaveToastVisible(false);
    }, 1800);
  };

  const handleSubmitInquiry = async () => {
    if (!form.category) {
      setFormError('문의 유형을 선택해주세요.');
      return;
    }

    if (!form.title.trim()) {
      setFormError('문의 제목을 입력해주세요.');
      return;
    }

    if (!form.content.trim()) {
      setFormError('문의 내용을 입력해주세요.');
      return;
    }

    try {
      if (editingInquiryId) {
        await updateInquiry(editingInquiryId, {
          category: form.category,
          orderId: form.orderId,
          title: form.title.trim(),
          content: form.content.trim(),
        });
      } else {
        await createInquiry({
          category: form.category,
          orderId: form.orderId,
          title: form.title.trim(),
          content: form.content.trim(),
        });
      }

      await loadInquiries();
      closeEditor();
      showSavedToast();
    } catch (error) {
      setFormError(error.message || '문의를 저장하지 못했습니다.');
    }
  };

  const handleDeleteInquiry = async () => {
    if (!deleteTargetId) {
      return;
    }

    try {
      await deleteInquiry(deleteTargetId);
      await loadInquiries();
      setDeleteTargetId(null);
      setExpandedId(null);
    } catch (error) {
      setInquiryLoadError(error.message || '문의를 삭제하지 못했습니다.');
      setDeleteTargetId(null);
    }
  };

  return (
    <>
      <section className="order-history-content inquiry-history-page">
        <header className="inquiry-heading">
          <div>
            <h1>문의 내역</h1>
            <p>1:1 문의를 등록하고 답변 상태를 확인하세요.</p>
          </div>

          <button type="button" onClick={openNewInquiry}>
            1:1 문의하기
          </button>
        </header>

        <OrderSummary
          orderCount={orders.length}
          couponCount={couponCount}
          pointBalance={pointBalance}
          wishlistCount={wishlistCount}
        />

        <section className="inquiry-guide">
          <div>
            <strong>1:1 문의 안내</strong>
            <span>주문 관련 문의는 주문번호를 함께 선택하면 더 빠르게 확인할 수 있습니다.</span>
          </div>

          <div>
            <span>고객센터 운영시간</span>
            <strong>평일 09:00 - 18:00</strong>
          </div>
        </section>

        <div className="inquiry-toolbar">
          <div className="inquiry-tabs">
            {INQUIRY_TABS.map((tab) => (
              <button
                type="button"
                key={tab.value}
                className={selectedTab === tab.value ? 'is-active' : ''}
                onClick={() => setSelectedTab(tab.value)}
              >
                {tab.label}
                <span>{counts[tab.value]}</span>
              </button>
            ))}
          </div>

          <div className="inquiry-filters">
            <select
              value={selectedCategory}
              onChange={(event) => setSelectedCategory(event.target.value)}
              aria-label="문의 유형 필터"
            >
              <option value="전체">전체 유형</option>
              {INQUIRY_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>

            <select
              value={periodMonths}
              onChange={(event) => setPeriodMonths(Number(event.target.value))}
              aria-label="문의 조회 기간"
            >
              {PERIOD_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {errorMessage || inquiryLoadError ? (
          <ErrorState className="inquiry-empty" message={inquiryLoadError || errorMessage} />
        ) : isInquiryLoading ? (
          <div className="inquiry-empty">문의 내역을 불러오는 중입니다.</div>
        ) : filteredInquiries.length === 0 ? (
          <EmptyState
            className="inquiry-empty"
            title="등록된 문의가 없습니다."
            description="궁금한 점이 있다면 1:1 문의를 남겨주세요."
          />
        ) : (
          <div className="inquiry-list">
            {filteredInquiries.map((inquiry) => {
              const isExpanded = expandedId === inquiry.inquiryId;
              const isAnswered = inquiry.status === 'answered';

              return (
                <article className="inquiry-item" key={inquiry.inquiryId}>
                  <button
                    type="button"
                    className="inquiry-item-summary"
                    onClick={() =>
                      setExpandedId((prev) =>
                        prev === inquiry.inquiryId ? null : inquiry.inquiryId
                      )
                    }
                  >
                    <span
                      className={`inquiry-status-badge ${
                        isAnswered ? 'is-answered' : 'is-waiting'
                      }`}
                    >
                      {isAnswered ? '답변 완료' : '답변 대기'}
                    </span>

                    <span className="inquiry-category">{inquiry.category}</span>

                    <span className="inquiry-title">{inquiry.title}</span>

                    <span className="inquiry-order">
                      {inquiry.orderId ? `주문 ${inquiry.orderId}` : '일반 문의'}
                    </span>

                    <span className="inquiry-date">{formatCompactDate(inquiry.createdAt)}</span>

                    <span className={`inquiry-chevron ${isExpanded ? 'is-open' : ''}`}>›</span>
                  </button>

                  {isExpanded && (
                    <div className="inquiry-detail">
                      <div className="inquiry-question">
                        <div className="inquiry-detail-label">Q</div>

                        <div>
                          <div className="inquiry-detail-meta">
                            <span>{inquiry.category}</span>
                            <span>{formatDateTime(inquiry.createdAt)}</span>
                          </div>

                          <strong>{inquiry.title}</strong>
                          <p>{inquiry.content}</p>

                          {!isAnswered && (
                            <div className="inquiry-question-actions">
                              <button type="button" onClick={() => openEditInquiry(inquiry)}>
                                수정
                              </button>

                              <button
                                type="button"
                                onClick={() => setDeleteTargetId(inquiry.inquiryId)}
                              >
                                삭제
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {isAnswered ? (
                        <div className="inquiry-answer">
                          <div className="inquiry-detail-label">A</div>

                          <div>
                            <div className="inquiry-detail-meta">
                              <span>ARC 고객센터</span>
                              <span>{formatDateTime(inquiry.answeredAt)}</span>
                            </div>

                            <strong>문의하신 내용에 답변드립니다.</strong>
                            <p>{inquiry.answer}</p>
                          </div>
                        </div>
                      ) : (
                        <div className="inquiry-waiting-note">
                          담당자가 문의 내용을 확인 중입니다. 답변이 등록되면 이곳에 표시됩니다.
                        </div>
                      )}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>

      {isEditorOpen && (
        <div className="inquiry-modal-backdrop" onClick={closeEditor}>
          <section
            className="inquiry-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="inquiryEditorTitle"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="inquiry-modal-header">
              <div>
                <h2 id="inquiryEditorTitle">{editingInquiryId ? '문의 수정' : '1:1 문의하기'}</h2>
                <p>문의 내용을 자세히 작성해주세요.</p>
              </div>

              <button type="button" aria-label="문의 작성 닫기" onClick={closeEditor}>
                ×
              </button>
            </div>

            <div className="inquiry-modal-body">
              <div className="inquiry-form-row">
                <label htmlFor="inquiryCategory">문의 유형</label>
                <select
                  id="inquiryCategory"
                  name="category"
                  value={form.category}
                  onChange={handleFormChange}
                >
                  {INQUIRY_CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div className="inquiry-form-row">
                <label htmlFor="inquiryOrder">관련 주문</label>
                <select
                  id="inquiryOrder"
                  name="orderId"
                  value={form.orderId}
                  onChange={handleFormChange}
                >
                  <option value="">관련 주문 없음</option>
                  {orders.map((order) => (
                    <option key={order.orderId} value={order.orderId}>
                      {formatCompactDate(order.orderDate)} · {order.orderId}
                    </option>
                  ))}
                </select>
              </div>

              <div className="inquiry-form-row">
                <label htmlFor="inquiryTitle">제목</label>
                <input
                  id="inquiryTitle"
                  name="title"
                  type="text"
                  maxLength={60}
                  value={form.title}
                  onChange={handleFormChange}
                  placeholder="문의 제목을 입력해주세요."
                />
              </div>

              <div className="inquiry-form-row inquiry-content-row">
                <label htmlFor="inquiryContent">문의 내용</label>
                <div>
                  <textarea
                    id="inquiryContent"
                    name="content"
                    maxLength={1000}
                    value={form.content}
                    onChange={handleFormChange}
                    placeholder="문의 내용을 입력해주세요."
                  />
                  <span>{form.content.length} / 1000</span>
                </div>
              </div>

              <div className="inquiry-contact-note">
                답변은 마이페이지 문의 내역에서 확인할 수 있습니다.
                {email && <span> 등록 이메일: {email}</span>}
              </div>

              {formError && <p className="inquiry-form-error">{formError}</p>}
            </div>

            <div className="inquiry-modal-actions">
              <button type="button" onClick={closeEditor}>
                취소
              </button>

              <button type="button" className="is-primary" onClick={handleSubmitInquiry}>
                {editingInquiryId ? '수정 저장' : '문의 접수'}
              </button>
            </div>
          </section>
        </div>
      )}

      <ConfirmModal
        open={Boolean(deleteTargetId)}
        title="문의를 삭제하시겠습니까?"
        description="삭제한 문의는 다시 복구할 수 없습니다."
        confirmText="삭제"
        cancelText="취소"
        onConfirm={handleDeleteInquiry}
        onClose={() => setDeleteTargetId(null)}
        titleId="inquiryDeleteTitle"
        backdropClassName="inquiry-modal-backdrop"
        modalClassName="inquiry-delete-modal"
        confirmClassName="is-primary"
      />

      {saveToastVisible && (
        <div className="inquiry-save-toast" role="status" aria-live="polite">
          문의가 저장되었습니다.
        </div>
      )}
    </>
  );
}

export default InquiryHistoryPage;
