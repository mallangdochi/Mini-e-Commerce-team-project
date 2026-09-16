import { useState } from 'react';

import '@/styles/footer.css';

const FOOTER_SECTIONS = [
  {
    id: 'account',
    title: '내 계정',
    type: 'nav',
    items: [
      { href: '/mypage/orders', label: '주문 조회 & 반품' },
      { href: '/wishlist', label: '위시리스트' },
      { href: '/gift-card', label: '기프트 카드' },
    ],
  },
  {
    id: 'help',
    title: '도움말',
    type: 'nav',
    items: [
      { href: '/help/faq', label: '자주 묻는 질문' },
      { href: '/help/order', label: '주문 & 결제' },
      { href: '/help/shipping', label: '배송 정보' },
      { href: '/help/return', label: '반품 & 환불' },
      { href: '/help/repair', label: '수선 안내' },
      { href: '/help/size-guide', label: '사이즈 가이드' },
    ],
  },
  {
    id: 'company',
    title: '회사소개',
    type: 'nav',
    items: [
      { href: '/company/social', label: '사회공헌프로그램' },
      { href: '/company/sustainability', label: '지속 가능성' },
      { href: '/company/group-order', label: '단체 주문' },
      { href: '/company/events', label: '베스트 리뷰 이벤트' },
    ],
  },
  {
    id: 'contact',
    title: '문의하기',
    type: 'contact',
    items: [
      { href: '/contact', label: '게스트 에듀케이션 센터 (GEC)' },
      { label: '운영시간: 평일 9:00AM-6:00PM' },
      { label: '(점심시간 12:00PM-1:00PM)' },
      { href: '/contact/kakao', label: '<카카오톡 문의하기>', className: 'footer-underlined' },
      { href: 'mailto:contact@arc.co.kr', label: '이메일: contact@arc.co.kr' },
      { href: 'tel:07047697965', label: '전화: 070.4769.7965' },
      { href: '/stores', label: '스토어 찾기' },
      { href: '/sitemap', label: '사이트맵' },
    ],
  },
];

function FooterSection({ section, isOpen, onToggle }) {
  const panelId = `footer-panel-${section.id}`;
  const titleId = `footer-title-${section.id}`;
  const LinkWrapper = section.type === 'nav' ? 'nav' : 'div';

  return (
    <div className={`footer-group${section.type === 'contact' ? ' footer-contact' : ''}`}>
      <h2 className="footer-title" id={titleId}>
        <button
          type="button"
          className="footer-title-button"
          aria-expanded={isOpen}
          aria-controls={panelId}
          onClick={onToggle}
        >
          <span>{section.title}</span>
          <span className="footer-title-icon" aria-hidden="true" />
        </button>
      </h2>

      <div
        className={`footer-accordion-panel${isOpen ? ' is-open' : ''}`}
        id={panelId}
        aria-labelledby={titleId}
      >
        <LinkWrapper className="footer-links">
          {section.items.map((item) =>
            item.href ? (
              <a key={`${section.id}-${item.label}`} href={item.href} className={item.className}>
                {item.label}
              </a>
            ) : (
              <span key={`${section.id}-${item.label}`}>{item.label}</span>
            )
          )}
        </LinkWrapper>
      </div>
    </div>
  );
}

function Footer() {
  const [openSections, setOpenSections] = useState({});

  const toggleSection = (sectionId) => {
    setOpenSections((prevOpenSections) => ({
      ...prevOpenSections,
      [sectionId]: !prevOpenSections[sectionId],
    }));
  };

  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        {FOOTER_SECTIONS.map((section) => (
          <FooterSection
            key={section.id}
            section={section}
            isOpen={Boolean(openSections[section.id])}
            onToggle={() => toggleSection(section.id)}
          />
        ))}

        {/* SNS */}
        <div className="footer-group footer-social-group">
          <h2 className="footer-title footer-social-title">CONNECT WITH US</h2>

          <div className="footer-social">
            <a href="/" aria-label="카카오톡">
              <span className="social-kakao">K</span>
            </a>

            <a href="/" aria-label="인스타그램">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <rect x="4" y="4" width="16" height="16" rx="4" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.5" cy="6.5" r="1" />
              </svg>
            </a>

            <a href="/" aria-label="페이스북">
              <span className="social-facebook">f</span>
            </a>
          </div>
        </div>

        <p className="footer-copyright">© 2026 404.4조를 찾을 수 없음. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;
