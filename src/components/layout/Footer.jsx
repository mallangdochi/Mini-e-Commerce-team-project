import '@/styles/footer.css';

function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        {/* 내 계정 */}
        <div className="footer-group">
          <h2 className="footer-title">내 계정</h2>

          <nav className="footer-links">
            <a href="/mypage/orders">주문 조회 &amp; 반품</a>
            <a href="/wishlist">위시리스트</a>
            <a href="/gift-card">기프트 카드</a>
          </nav>
        </div>

        {/* 도움말 */}
        <div className="footer-group">
          <h2 className="footer-title">도움말</h2>

          <nav className="footer-links">
            <a href="/help/faq">자주 묻는 질문</a>
            <a href="/help/order">주문 &amp; 결제</a>
            <a href="/help/shipping">배송 정보</a>
            <a href="/help/return">반품 &amp; 환불</a>
            <a href="/help/repair">수선 안내</a>
            <a href="/help/size-guide">사이즈 가이드</a>
          </nav>
        </div>

        {/* 회사소개 */}
        <div className="footer-group">
          <h2 className="footer-title">회사소개</h2>

          <nav className="footer-links">
            <a href="/company/social">사회공헌프로그램</a>
            <a href="/company/sustainability">지속 가능성</a>
            <a href="/company/group-order">단체 주문</a>
            <a href="/company/events">베스트 리뷰 이벤트</a>
          </nav>
        </div>

        {/* 문의하기 */}
        <div className="footer-group footer-contact">
          <h2 className="footer-title">문의하기</h2>

          <div className="footer-links">
            <a href="/contact">게스트 에듀케이션 센터 (GEC)</a>

            <span>운영시간: 평일 9:00AM-6:00PM</span>
            <span>(점심시간 12:00PM-1:00PM)</span>

            <a href="/contact/kakao" className="footer-underlined">
              &lt;카카오톡 문의하기&gt;
            </a>

            <a href="mailto:contact@arc.co.kr">이메일: contact@arc.co.kr</a>

            <a href="tel:07047697965">전화: 070.4769.7965</a>

            <a href="/stores">스토어 찾기</a>

            <a href="/sitemap">사이트맵</a>
          </div>
        </div>

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
      </div>
    </footer>
  );
}

export default Footer;
