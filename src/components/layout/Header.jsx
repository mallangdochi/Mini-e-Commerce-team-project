import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import '@/styles/header.css';

const NAV_ITEMS = [
  { label: '소개', to: '/' },
  { label: '여성', to: '/products' },
  { label: '남성', to: '/products' },
  { label: '신제품', to: '/products' },
];

// 스크롤이 이 값을 넘어간 뒤부터 스크롤 다운 시 헤더 숨김
const HEADER_HIDE_THRESHOLD = 80;

// TODO: 인증 store(zustand) 연결되면 교체. 지금은 localStorage 플래그로 임시 처리.
// 로그인/로그아웃 코드는 AUTH_TOKEN_KEY 설정/삭제 후 window.dispatchEvent(new Event(AUTH_CHANGE_EVENT)) 호출할 것.
const AUTH_TOKEN_KEY = 'accessToken';
const AUTH_CHANGE_EVENT = 'auth-change';
const readLoggedIn = () => !!localStorage.getItem(AUTH_TOKEN_KEY);

function Header() {
  const navigate = useNavigate();
  const [hidden, setHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [loggedIn, setLoggedIn] = useState(readLoggedIn);
  const lastY = useRef(0);
  const searchInputRef = useRef(null);

  // 로그인 상태 동기화 (다른 탭 storage 이벤트 + 같은 탭 커스텀 이벤트)
  useEffect(() => {
    const sync = () => setLoggedIn(readLoggedIn());
    window.addEventListener('storage', sync);
    window.addEventListener(AUTH_CHANGE_EVENT, sync);
    return () => {
      window.removeEventListener('storage', sync);
      window.removeEventListener(AUTH_CHANGE_EVENT, sync);
    };
  }, []);

  const submitSearch = (e) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    navigate(`/products?q=${encodeURIComponent(q)}`);
    setSearchOpen(false);
    setQuery('');
  };

  // 스크롤 내리면 헤더 숨김, 올리면 표시. 최상단 근처(80px)에선 항상 표시.
  useEffect(() => {
    let ticking = false;
    const update = () => {
      const y = window.scrollY;
      setHidden(y >= HEADER_HIDE_THRESHOLD && y > lastY.current);
      lastY.current = y;
      ticking = false;
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // 모바일 메뉴 열림 동안: 배경 스크롤 잠금, 리사이즈 / Esc 시 닫기
  useEffect(() => {
    if (!menuOpen) return undefined;
    const close = () => setMenuOpen(false);
    const onKey = (e) => {
      if (e.key === 'Escape') close();
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('resize', close);
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('resize', close);
      window.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  // 검색바: 열리면 입력창 포커스, Esc 시 닫기
  useEffect(() => {
    if (!searchOpen) return undefined;
    searchInputRef.current?.focus();
    const onKey = (e) => {
      if (e.key === 'Escape') setSearchOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [searchOpen]);

  return (
    <header className={`site-header${hidden ? ' site-header--hidden' : ''}`}>
      <div className="site-header-inner">
        {/* ARC LOGO */}
        <Link to="/" className="site-logo" aria-label="홈으로 이동">
          <svg
            id="_레이어_1"
            data-name="레이어 1"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 658.06 315.87"
          >
            <g>
              <path d="M358.38,172.98l73,54h-40.5l-84.5-65h62.5c3.87,0,15.05-4.19,18.44-6.56,10.05-7.05,18.44-25.02,6-33.87-1-.71-6.79-3.57-7.43-3.57h-115.5c.37-2.24.71-4.54,1.02-6.9.23-1.72.43-3.42.61-5.08,41.3-.02,82.6-.03,123.91-.05,44.35,4.58,33,52.14-.86,64.21-1.72.61-9,2.83-10.17,2.83h-26.5Z" />

              <path d="M576.38,206.98l-15.56,11.94c-34.3-3.13-122.87,15.06-127.43-37.46-3.57-41.13,40.34-69.87,76.61-74.36,31.05-3.85,65.93.14,97.37-.63l-14.7,12.3c-40.86,3.54-92.55-11.84-121.71,25.29-21.54,27.42-12.47,62.92,25.92,62.92h79.5Z" />
            </g>

            <path d="M617.37,79.97c-.26.53-.53,1.06-.79,1.59.11-.58.23-1.16.34-1.74.14-.68.34-1.67.56-2.88.05-.31.88-5.03.98-7.46.2-4.8-2.06-8.87-3.04-10.61-2.87-5.15-7.35-8.47-12.24-10.98-19.28-9.89-48.24-9.95-48.24-9.95-29.07-.06-50.13,2.6-50.13,2.6-23.31,2.55-41.23,6.73-53.55,10.19-12.25,3.45-39.24,11.9-42.45,12.9-5.54,1.74-11.12,3.38-16.65,5.16-15.6,5.04-24.58,8.52-37.98,9.49-1.62.12-2.96.17-3.81.2,18.5-7.13,37.26-13.94,56.24-19.77,47.26-14.51,102.63-27.2,152.31-24.78,25.23,1.23,73.95,9.81,58.44,46.04Z" />

            <g>
              <path d="M54.38,218.98l128.45-114.06,40.68,62.97c13.55-3.33,28.72-6.33,45.35-8.49,20.37-2.65,39.05-3.53,55.5-3.44-72.03,8.74-144.15,29.55-209.35,61.15-20.09,9.74-71.48,37.9-79.83,58.17-2.2,5.35-2.94,8.24,2.24,12.13l9.94,4.55c-19.48-2.39-33.26-7.08-19.63-28.12,14.12-21.78,56.68-44.55,80.28-55.72,29.93-14.16,61.46-25.22,93.35-34.16l-24.5-39.97-77.99,72.99c-3.9.27-21.71,11.99-23.01,11.99h-21.5Z" />

              <polygon points="254.38 218.98 228.88 218.98 208.38 184.99 229.77 179.19 254.38 218.98" />
            </g>
          </svg>
        </Link>

        {/* NAVIGATION (데스크톱) */}
        <nav className="site-nav">
          {NAV_ITEMS.map((item) => (
            <Link key={item.label} to={item.to}>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* HEADER ACTIONS */}
        <div className="site-header-actions">
          <button
            type="button"
            className="site-header-action"
            aria-label={searchOpen ? '검색 닫기' : '검색 열기'}
            aria-expanded={searchOpen}
            onClick={() => setSearchOpen((v) => !v)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              viewBox="0 0 256 256"
              aria-hidden="true"
            >
              <path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z" />
            </svg>
          </button>

          {loggedIn ? (
            <Link to="/mypage" className="site-header-action" aria-label="마이페이지">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                viewBox="0 0 16 16"
              >
                <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6m2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0m4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4m-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10s-3.516.68-4.168 1.332c-.678.678-.83 1.418-.832 1.664z" />
              </svg>
            </Link>
          ) : (
            <Link to="/login" className="site-header-action header-login-btn">
              로그인
            </Link>
          )}

          <Link to="/cart" className="site-header-action" aria-label="장바구니">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              viewBox="0 0 256 256"
            >
              <path d="M216,42H40A14,14,0,0,0,26,56V200a14,14,0,0,0,14,14H216a14,14,0,0,0,14-14V56A14,14,0,0,0,216,42Zm2,158a2,2,0,0,1-2,2H40a2,2,0,0,1-2-2V56a2,2,0,0,1,2-2H216a2,2,0,0,1,2,2ZM174,88a46,46,0,0,1-92,0,6,6,0,0,1,12,0,34,34,0,0,0,68,0,6,6,0,0,1,12,0Z" />
            </svg>
          </Link>
        </div>

        {/* 모바일 햄버거 (데스크톱 숨김) */}
        <button
          type="button"
          className="site-nav-toggle"
          aria-label={menuOpen ? '메뉴 닫기' : '메뉴 열기'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
      </div>

      {/* 검색바 */}
      {searchOpen && (
        <form className="site-search" role="search" onSubmit={submitSearch}>
          <div className="site-search-inner">
            <input
              ref={searchInputRef}
              className="site-search-input"
              type="search"
              placeholder="검색어를 입력하세요"
              aria-label="상품 검색"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button type="submit" className="site-search-submit" aria-label="검색">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                fill="currentColor"
                viewBox="0 0 256 256"
                aria-hidden="true"
              >
                <path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z" />
              </svg>
            </button>
          </div>
        </form>
      )}

      {/* 모바일 메뉴 — 풀스크린 오버레이 */}
      {menuOpen && (
        <div className="site-mobile-menu">
          <div className="site-mobile-menu-top">
            <button
              type="button"
              className="site-mobile-menu-close"
              aria-label="메뉴 닫기"
              onClick={() => setMenuOpen(false)}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>

          <nav className="site-mobile-menu-primary">
            {NAV_ITEMS.map((item) => (
              <Link key={item.label} to={item.to} onClick={() => setMenuOpen(false)}>
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="site-mobile-menu-secondary">
            {loggedIn ? (
              <Link to="/mypage" onClick={() => setMenuOpen(false)}>
                마이페이지
              </Link>
            ) : (
              <Link to="/login" onClick={() => setMenuOpen(false)}>
                로그인
              </Link>
            )}
            <Link to="/cart" onClick={() => setMenuOpen(false)}>
              장바구니
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

export default Header;
