import { useState } from 'react';
import { Link } from 'react-router-dom';

import '@/styles/login.css';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // 나중에 API 로그인 실패 시 여기에 메시지를 넣으면 됨
  const [loginError, setLoginError] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();

    setLoginError('');
  };

  return (
    <main className="login-page">
      <div className="login-container">
        <Link to="/" className="login-logo-wrapper" aria-label="ARC 홈으로 이동">
          <svg
            className="login-app-logo"
            viewBox="0 0 200 60"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M15 45C50 15 110 5 185 10C120 18 60 30 30 50"
              stroke="currentColor"
              strokeWidth="3"
            />

            <text
              x="35"
              y="42"
              fontFamily="sans-serif"
              fontSize="36"
              fontWeight="900"
              fontStyle="italic"
              fill="currentColor"
              letterSpacing="2"
            >
              ARC
            </text>
          </svg>
        </Link>

        <section className="login-card">
          <div className="login-left-banner">
            <p className="login-banner-sub">PERFORMANCE WEAR</p>

            <h2 className="login-banner-title">
              ENGINEERED
              <br />
              TO MOVE
            </h2>
          </div>

          <div className="login-form-section">
            <h1 className="login-form-title">로그인</h1>

            <p className="login-form-subtitle">ARC와 함께 더 나은 움직임을 만나보세요.</p>

            <form className="login-form" onSubmit={handleSubmit}>
              <label className="login-field">
                <span className="login-field-label">이메일</span>

                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="이메일"
                  className="login-input"
                  autoComplete="email"
                  required
                />
              </label>

              <label className="login-field">
                <span className="login-field-label">비밀번호</span>

                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="비밀번호"
                  className="login-input"
                  autoComplete="current-password"
                  required
                />
              </label>

              <button type="submit" className="login-submit-btn">
                로그인
              </button>
            </form>

            {loginError && (
              <p className="login-error-text" role="alert">
                {loginError}
              </p>
            )}

            <div className="login-divider">
              <span>또는</span>
            </div>

            <div className="login-social-group">
              <button
                type="button"
                className="login-social-btn login-social-naver"
                aria-label="네이버 로그인"
              >
                N
              </button>

              <button
                type="button"
                className="login-social-btn login-social-kakao"
                aria-label="카카오 로그인"
              >
                💬
              </button>

              <button
                type="button"
                className="login-social-btn login-social-google"
                aria-label="구글 로그인"
              >
                G
              </button>
            </div>

            <p className="login-bottom-link">
              계정이 없으신가요?
              <Link to="/signup">회원가입</Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

export default LoginPage;
