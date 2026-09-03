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
            viewBox="0 0 658.06 315.87"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
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
                <svg
                  width="30"
                  height="29"
                  viewBox="0 0 30 29"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect width="29.3721" height="28.7847" rx="8.6354" fill="#00C300" />
                  <path
                    d="M17.2443 14.7926L12.3603 7.91602H8.31238V20.764H12.5541V13.8874L17.4372 20.764H21.486V7.91602H17.2443V14.7926Z"
                    fill="white"
                  />
                </svg>
              </button>

              <button
                type="button"
                className="login-social-btn login-social-kakao"
                aria-label="카카오 로그인"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="currentColor"
                  className="bi bi-chat-fill"
                  viewBox="0 0 16 16"
                >
                  <path d="M8 15c4.418 0 8-3.134 8-7s-3.582-7-8-7-8 3.134-8 7c0 1.76.743 3.37 1.97 4.6-.097 1.016-.417 2.13-.771 2.966-.079.186.074.394.273.362 2.256-.37 3.597-.938 4.18-1.234A9 9 0 0 0 8 15" />
                </svg>
              </button>

              <button
                type="button"
                className="login-social-btn login-social-google"
                aria-label="구글 로그인"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="currentColor"
                  className="bi bi-google"
                  viewBox="0 0 16 16"
                >
                  <path d="M15.545 6.558a9.4 9.4 0 0 1 .139 1.626c0 2.434-.87 4.492-2.384 5.885h.002C11.978 15.292 10.158 16 8 16A8 8 0 1 1 8 0a7.7 7.7 0 0 1 5.352 2.082l-2.284 2.284A4.35 4.35 0 0 0 8 3.166c-2.087 0-3.86 1.408-4.492 3.304a4.8 4.8 0 0 0 0 3.063h.003c.635 1.893 2.405 3.301 4.492 3.301 1.078 0 2.004-.276 2.722-.764h-.003a3.7 3.7 0 0 0 1.599-2.431H8v-3.08z" />
                </svg>
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
