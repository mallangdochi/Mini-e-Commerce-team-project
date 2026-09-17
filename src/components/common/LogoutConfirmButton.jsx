import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';

import useAuthStore from '@/store/authStore';
import '@/styles/logout-confirm.css';

function LogoutConfirmButton({ className = '', onOpen }) {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const [isOpen, setIsOpen] = useState(false);

  const openModal = () => {
    onOpen?.();
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
  };

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    navigate('/login');
  };

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        closeModal();
      }
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const modal = isOpen
    ? createPortal(
        <div className="logout-confirm-backdrop" onClick={closeModal}>
          <section
            className="logout-confirm-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="logoutConfirmTitle"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="logout-confirm-icon" aria-hidden="true">
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

            <h2 id="logoutConfirmTitle">로그아웃하시겠습니까?</h2>

            <p>
              현재 계정에서 로그아웃됩니다.
              <br />
              다시 이용하려면 로그인이 필요합니다.
            </p>

            <div className="logout-confirm-actions">
              <button type="button" className="is-cancel" onClick={closeModal}>
                취소
              </button>

              <button type="button" className="is-confirm" onClick={handleLogout}>
                로그아웃
              </button>
            </div>
          </section>
        </div>,
        document.body
      )
    : null;

  return (
    <>
      <button type="button" className={className} onClick={openModal}>
        로그아웃
      </button>
      {modal}
    </>
  );
}

export default LogoutConfirmButton;
