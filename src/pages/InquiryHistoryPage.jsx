import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import {
  clearAuthSession,
  getMe,
  getStoredOrders,
  getStoredUser,
  resolveUserProfile,
  setStoredOrders,
} from '@/api/authApi';
import { getOrders } from '@/api/orders';
import '@/styles/order-history.css';
import '@/styles/inquiry-history.css';

const MY_PAGE_MENU = [
  { label: '마이페이지 홈', to: '/mypage' },
  { label: '주문 내역', to: '/mypage/orders' },
  { label: '취소 / 교환 / 반품', to: '/mypage/claims' },
  { label: '내 리뷰', to: '/mypage/reviews' },
  { label: '쿠폰 및 혜택', to: '/mypage/coupons' },
  { label: '회원 정보 수정', to: '/mypage/profile' },
  { label: '문의 내역', to: '/mypage/inquiries' },
  { label: '찜한 상품', to: '/mypage/wishlist' },
];

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

function IconBag() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5.5 8.5h13l-.8 11h-11.4l-.8-11Z" />
      <path d="M9 9V6.7a3 3 0 0 1 6 0V9" />
    </svg>
  );
}

function IconCoupon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 7.5A2.5 2.5 0 0 0 6.5 10 2.5 2.5 0 0 0 4 12.5V17h16v-4.5A2.5 2.5 0 0 0 17.5 10 2.5 2.5 0 0 0 20 7.5V3H4v4.5Z" />
    </svg>
  );
}

function IconCoin() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <ellipse cx="12" cy="6" rx="7" ry="3" />
      <path d="M5 6v4c0 1.7 3.1 3 7 3s7-1.3 7-3V6" />
      <path d="M5 10v4c0 1.7 3.1 3 7 3s7-1.3 7-3v-4" />
      <path d="M5 14v4c0 1.7 3.1 3 7 3s7-1.3 7-3v-4" />
    </svg>
  );
}

function IconHeart() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20.8 5.9a5.2 5.2 0 0 0-7.4 0L12 7.3l-1.4-1.4a5.2 5.2 0 1 0-7.4 7.4L12 22l8.8-8.7a5.2 5.2 0 0 0 0-7.4Z" />
    </svg>
  );
}

function ProfileAvatar() {
  return (
    <div className="order-profile-avatar" aria-hidden="true">
      <svg viewBox="0 0 80 80">
        <circle cx="40" cy="27" r="16" />
        <path d="M16 68c3.5-16 13.6-24 24-24s20.5 8 24 24" />
      </svg>
    </div>
  );
}

function getStoredInquiries() {
  try {
    const saved = JSON.parse(localStorage.getItem('arc-inquiries') ?? '[]');

    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

function saveStoredInquiries(inquiries) {
  localStorage.setItem('arc-inquiries', JSON.stringify(inquiries));
}

function formatDate(dateString) {
  if (!dateString) {
    return '-';
  }

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
    .format(date)
    .replace(/\s/g, '');
}

function formatDateTime(dateString) {
  if (!dateString) {
    return '-';
  }

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function isWithinPeriod(dateString, months) {
  if (!months) {
    return true;
  }

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return false;
  }

  const boundary = new Date();
  boundary.setMonth(boundary.getMonth() - months);

  return date >= boundary;
}

function makeInquiryId() {
  const now = new Date();
  const date = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
  ].join('');
  const random = String(Math.floor(Math.random() * 10000)).padStart(4, '0');

  return `INQ-${date}-${random}`;
}

function InquiryHistoryPage() {
  const navigate = useNavigate();

  const [user, setUser] = useState(() => getStoredUser());
  const [isLogoutPanelOpen, setIsLogoutPanelOpen] = useState(false);
  const [orders, setOrders] = useState(() => getStoredOrders());
  const [inquiries, setInquiries] = useState(() => getStoredInquiries());
  const [selectedTab, setSelectedTab] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [periodMonths, setPeriodMonths] = useState(3);
  const [expandedId, setExpandedId] = useState(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingInquiryId, setEditingInquiryId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [saveToastVisible, setSaveToastVisible] = useState(false);

  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');

    if (!accessToken) {
      navigate('/login', { replace: true });
      return;
    }

    const loadData = async () => {
      setErrorMessage('');

      try {
        const [profileResult, ordersResult] = await Promise.allSettled([
          getMe(accessToken),
          getOrders({ page: 1, limit: 50 }),
        ]);

        if (ordersResult.status === 'rejected') {
          throw ordersResult.reason;
        }

        if (profileResult.status === 'fulfilled') {
          setUser(resolveUserProfile(profileResult.value));
        }
        const nextOrders = ordersResult.value?.data?.orders ?? [];
        setOrders(nextOrders);
        setStoredOrders(nextOrders);
      } catch (error) {
        setErrorMessage(error.message || '문의 내역을 불러오지 못했습니다.');
      }
    };

    loadData();
  }, [navigate]);

  const userName = user?.name ?? user?.nickname ?? user?.loginId ?? user?.id ?? '회원';
  const email = user?.email ?? '';
  const couponCount = Number(user?.couponCount ?? user?.availableCouponCount ?? 0);
  const pointBalance = Number(user?.points ?? user?.pointBalance ?? user?.mileage ?? 0);
  const wishlistCount = Number(user?.wishlistCount ?? user?.wishCount ?? 0);

  const summaryItems = [
    {
      label: '주문 내역',
      value: `${orders.length}건`,
      to: '/mypage/orders',
      icon: <IconBag />,
    },
    {
      label: '보유 쿠폰',
      value: `${couponCount}개`,
      to: '/mypage/coupons',
      icon: <IconCoupon />,
    },
    {
      label: '적립금',
      value: `${pointBalance.toLocaleString()}원`,
      to: '/mypage/coupons',
      icon: <IconCoin />,
    },
    {
      label: '찜한 상품',
      value: `${wishlistCount}개`,
      to: '/mypage/wishlist',
      icon: <IconHeart />,
    },
  ];

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

  const handleLogout = () => {
    setIsLogoutPanelOpen(true);
  };

  const confirmLogout = () => {
    clearAuthSession();
    setIsLogoutPanelOpen(false);
    navigate('/login');
  };

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

  const handleSubmitInquiry = () => {
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

    let nextInquiries;

    if (editingInquiryId) {
      nextInquiries = inquiries.map((inquiry) =>
        inquiry.inquiryId === editingInquiryId
          ? {
              ...inquiry,
              category: form.category,
              orderId: form.orderId,
              title: form.title.trim(),
              content: form.content.trim(),
              updatedAt: new Date().toISOString(),
            }
          : inquiry
      );
    } else {
      const newInquiry = {
        inquiryId: makeInquiryId(),
        category: form.category,
        orderId: form.orderId,
        title: form.title.trim(),
        content: form.content.trim(),
        status: 'waiting',
        answer: '',
        answeredAt: null,
        createdAt: new Date().toISOString(),
      };

      nextInquiries = [newInquiry, ...inquiries];
    }

    setInquiries(nextInquiries);
    saveStoredInquiries(nextInquiries);
    closeEditor();
    showSavedToast();
  };

  const handleDeleteInquiry = () => {
    if (!deleteTargetId) {
      return;
    }

    const nextInquiries = inquiries.filter((inquiry) => inquiry.inquiryId !== deleteTargetId);

    setInquiries(nextInquiries);
    saveStoredInquiries(nextInquiries);
    setDeleteTargetId(null);
    setExpandedId(null);
  };

  return (
    <main className="order-history-page inquiry-history-page">
      <div className="order-history-shell">
        <aside className="order-history-sidebar">
          <div className="order-history-user">
            <ProfileAvatar />
            <strong>{userName}님</strong>
            <span>{email}</span>
          </div>

          <div className="order-history-sidebar-divider" />

          <nav className="order-history-nav" aria-label="마이페이지 메뉴">
            {MY_PAGE_MENU.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                className={`order-history-nav-link${
                  item.to === '/mypage/inquiries' ? ' is-active' : ''
                }`}
              >
                {item.label}
              </Link>
            ))}

            <button
              type="button"
              className="order-history-nav-link order-history-logout"
              onClick={handleLogout}
            >
              로그아웃
            </button>
          </nav>
        </aside>

        <section className="order-history-content">
          <header className="inquiry-heading">
            <div>
              <h1>문의 내역</h1>
              <p>1:1 문의를 등록하고 답변 상태를 확인하세요.</p>
            </div>

            <button type="button" onClick={openNewInquiry}>
              1:1 문의하기
            </button>
          </header>

          <section className="order-history-summary">
            {summaryItems.map((item) => (
              <Link key={item.label} to={item.to} className="order-history-summary-card">
                <div className="order-history-summary-top">
                  <span className="order-history-summary-icon">{item.icon}</span>
                  <span aria-hidden="true">›</span>
                </div>

                <span>{item.label}</span>
                <strong>{item.value}</strong>
              </Link>
            ))}
          </section>

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

          {errorMessage ? (
            <div className="inquiry-empty">{errorMessage}</div>
          ) : filteredInquiries.length === 0 ? (
            <div className="inquiry-empty">
              <strong>등록된 문의가 없습니다.</strong>
              <span>궁금한 점이 있다면 1:1 문의를 남겨주세요.</span>
              <button type="button" onClick={openNewInquiry}>
                문의 작성하기
              </button>
            </div>
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

                      <span className="inquiry-date">{formatDate(inquiry.createdAt)}</span>

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
      </div>

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
                      {formatDate(order.orderDate)} · {order.orderId}
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

      {deleteTargetId && (
        <div className="inquiry-modal-backdrop" onClick={() => setDeleteTargetId(null)}>
          <section
            className="inquiry-delete-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="inquiryDeleteTitle"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 id="inquiryDeleteTitle">문의를 삭제하시겠습니까?</h2>
            <p>삭제한 문의는 다시 복구할 수 없습니다.</p>

            <div>
              <button type="button" onClick={() => setDeleteTargetId(null)}>
                취소
              </button>
              <button type="button" className="is-primary" onClick={handleDeleteInquiry}>
                삭제
              </button>
            </div>
          </section>
        </div>
      )}

      {saveToastVisible && (
        <div className="inquiry-save-toast" role="status" aria-live="polite">
          문의가 저장되었습니다.
        </div>
      )}

      {isLogoutPanelOpen && (
        <div className="mypage-inline-logout-backdrop" onClick={() => setIsLogoutPanelOpen(false)}>
          <section
            className="mypage-inline-logout-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="mypageInlineLogoutTitle"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mypage-inline-logout-icon" aria-hidden="true">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M10 17l5-5-5-5" />
                <path d="M15 12H3" />
                <path d="M14 3h4a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3h-4" />
              </svg>
            </div>
            <h2 id="mypageInlineLogoutTitle">로그아웃하시겠습니까?</h2>
            <p>
              현재 계정에서 로그아웃됩니다.
              <br />
              다시 이용하려면 로그인이 필요합니다.
            </p>
            <div className="mypage-inline-logout-actions">
              <button type="button" onClick={() => setIsLogoutPanelOpen(false)}>
                취소
              </button>
              <button type="button" className="is-confirm" onClick={confirmLogout}>
                로그아웃
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}

export default InquiryHistoryPage;
