import { Link, useNavigate } from 'react-router-dom';

import '@/styles/not-found.css';

function NotFoundPage() {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="not-found-container">
      <div className="not-found-glow-circle">
        <div className="not-found-error-code-wrapper">
          <h1 className="not-found-error-code">404</h1>
          <p className="not-found-error-sub">PAGE NOT FOUND</p>
        </div>

        <div className="not-found-error-message">
          <p className="not-found-message-title">요청하신 페이지를 찾을 수 없습니다.</p>

          <p className="not-found-message-desc">
            입력하신 주소가 정확한지 확인해주세요.
            <br />
            페이지가 삭제되었거나, 이동되었을 수 있습니다.
          </p>
        </div>

        <div className="not-found-button-group">
          <Link to="/" className="not-found-btn not-found-btn-primary">
            메인 페이지
          </Link>

          <button
            type="button"
            onClick={handleGoBack}
            className="not-found-btn not-found-btn-secondary"
          >
            이전 페이지
          </button>
        </div>

        <Link to="/" className="not-found-logo-wrapper">
          <svg
            className="not-found-app-logo"
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
      </div>
    </div>
  );
}

export default NotFoundPage;
