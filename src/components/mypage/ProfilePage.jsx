import { useEffect, useMemo, useRef, useState } from 'react';

import { changePassword, updateMe } from '@/api/authApi';
import useAddresses from '@/hooks/useAddresses';
import useAuthStore from '@/store/authStore';
import { getStoredNoticeSettings, setStoredNoticeSettings } from '@/utils/storage';
import '@/styles/mypage.css';

const PASSWORD_MAX_LENGTH = 12;
const PASSWORD_PATTERN = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[.!@#$%^&*?])[a-zA-Z\d.!@#$%^&*?]{8,12}$/;

function IconLock() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
      <rect x="5" y="10" width="14" height="10" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

function IconEdit() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
      <path d="m4 20 4.2-1 10.9-10.9a2.1 2.1 0 0 0-3-3L5.2 16 4 20Z" />
      <path d="m14.8 6.4 2.8 2.8" />
    </svg>
  );
}

function maskName(name) {
  if (!name) return '-';
  if (name.length === 1) return name;
  return `${name.slice(0, 2)}${'*'.repeat(Math.max(1, name.length - 2))}`;
}

function maskLoginId(loginId) {
  if (!loginId) return '-';
  if (loginId.length <= 3) return `${loginId.charAt(0)}***`;
  return `${loginId.slice(0, 3)}***`;
}

function maskEmail(email) {
  if (!email || !email.includes('@')) return email || '-';

  const [localPart, domain] = email.split('@');
  const visible = localPart.slice(0, Math.min(3, localPart.length));

  return `${visible}***@${domain}`;
}

function maskPhone(phone) {
  if (!phone) return '-';

  const numbers = String(phone).replace(/\D/g, '');

  if (numbers.length === 11) {
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 8)}***`;
  }

  if (numbers.length === 10) {
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 6)}-${numbers.slice(6, 7)}***`;
  }

  return `${numbers.slice(0, 3)}-****`;
}

function maskPostcode(postcode) {
  if (!postcode) return '-';

  const value = String(postcode);

  if (value.length <= 2) return `${value}*`;

  return `${value.slice(0, Math.max(1, value.length - 1))}*`;
}

function maskAddress(address) {
  if (!address) return '-';

  const words = String(address).trim().split(' ').filter(Boolean);

  if (words.length <= 3) {
    return `${words.join(' ')} ***`;
  }

  return `${words.slice(0, 3).join(' ')} ***`;
}

function maskDetailAddress(detailAddress) {
  if (!detailAddress) return '-';

  const value = String(detailAddress);

  if (value.length <= 2) return `${value.charAt(0)}*`;

  return `${value.slice(0, Math.max(1, value.length - 1))}*`;
}

function formatPhoneNumber(value) {
  const numbers = String(value ?? '')
    .replace(/[^\d]/g, '')
    .slice(0, 11);

  if (numbers.length <= 3) {
    return numbers;
  }

  if (numbers.length <= 7) {
    return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
  }

  return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
}

function getInitialNoticeSetting(key, fallbackValue) {
  const settings = getStoredNoticeSettings();

  if (settings[key] === undefined) {
    return fallbackValue;
  }

  return Boolean(settings[key]);
}

function createInitialProfileForm(user) {
  return {
    name: user?.name ?? '',
    loginId: user?.loginId ?? user?.identifier ?? user?.id ?? '',
    email: user?.email ?? '',
    phone: formatPhoneNumber(user?.phone ?? user?.phoneNumber ?? user?.mobile ?? ''),
    birthday: user?.birthday ?? user?.birthDate ?? user?.dateOfBirth ?? '',
  };
}

function ProfilePage() {
  const user = useAuthStore((state) => state.user);
  const fetchMe = useAuthStore((state) => state.fetchMe);
  const saveToastTimerRef = useRef(null);
  const { addresses } = useAddresses();

  const [isProfileEditorOpen, setIsProfileEditorOpen] = useState(false);

  const [emailNotice, setEmailNotice] = useState(() =>
    getInitialNoticeSetting('emailNotice', true)
  );

  const [smsNotice, setSmsNotice] = useState(() => getInitialNoticeSetting('smsNotice', true));

  const [pushNotice, setPushNotice] = useState(() => getInitialNoticeSetting('pushNotice', false));

  const [profileForm, setProfileForm] = useState(() => createInitialProfileForm(user));

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    newPasswordConfirm: '',
  });

  const [isPasswordEditorOpen, setIsPasswordEditorOpen] = useState(false);
  const [passwordSaveMessage, setPasswordSaveMessage] = useState('');
  const [saveMessage, setSaveMessage] = useState('');
  const [isSaveToastVisible, setIsSaveToastVisible] = useState(false);

  const userName = user?.name ?? user?.nickname ?? user?.loginId ?? user?.id ?? '회원';

  const loginId = user?.loginId ?? user?.identifier ?? user?.id ?? '';

  const email = user?.email ?? '';
  const phone = user?.phone ?? user?.phoneNumber ?? user?.mobile ?? '';

  const defaultAddress = addresses.find((item) => item.isDefault) ?? addresses[0] ?? null;

  useEffect(
    () => () => {
      if (saveToastTimerRef.current) {
        window.clearTimeout(saveToastTimerRef.current);
      }
    },
    []
  );

  const openProfileEditor = () => {
    setProfileForm(createInitialProfileForm(user));
    setSaveMessage('');
    setIsProfileEditorOpen(true);
  };

  const handleProfileInputChange = (event) => {
    const { name, value } = event.target;
    let nextValue = value;

    if (name === 'name') {
      nextValue = value.replace(/[^가-힣a-zA-Z\s]/g, '').slice(0, 20);
    }

    if (name === 'phone') {
      nextValue = formatPhoneNumber(value);
    }

    setProfileForm((prev) => ({
      ...prev,
      [name]: nextValue,
    }));

    setSaveMessage('');
  };

  const handlePasswordInputChange = (event) => {
    const { name, value } = event.target;

    const nextValue =
      name === 'currentPassword'
        ? value
        : value.replace(/[^a-zA-Z0-9.!@#$%^&*?]/g, '').slice(0, PASSWORD_MAX_LENGTH);

    setPasswordForm((prev) => ({
      ...prev,
      [name]: nextValue,
    }));

    setPasswordSaveMessage('');
  };

  const passwordStatus = useMemo(() => {
    const trimmedNewPassword = passwordForm.newPassword.trim();

    if (!trimmedNewPassword) return 'idle';

    return PASSWORD_PATTERN.test(trimmedNewPassword) ? 'success' : 'error';
  }, [passwordForm.newPassword]);

  const passwordCheckStatus = useMemo(() => {
    const trimmedNewPassword = passwordForm.newPassword.trim();

    const trimmedNewPasswordConfirm = passwordForm.newPasswordConfirm.trim();

    if (!trimmedNewPasswordConfirm) return 'idle';

    return trimmedNewPassword === trimmedNewPasswordConfirm ? 'success' : 'error';
  }, [passwordForm.newPassword, passwordForm.newPasswordConfirm]);

  const closePasswordEditor = () => {
    setIsPasswordEditorOpen(false);
    setPasswordSaveMessage('');

    setPasswordForm({
      currentPassword: '',
      newPassword: '',
      newPasswordConfirm: '',
    });
  };

  const handlePasswordSave = async () => {
    const trimmedCurrentPassword = passwordForm.currentPassword.trim();

    const trimmedNewPassword = passwordForm.newPassword.trim();

    const trimmedNewPasswordConfirm = passwordForm.newPasswordConfirm.trim();

    if (!trimmedCurrentPassword) {
      setPasswordSaveMessage('현재 비밀번호를 입력해주세요.');
      return;
    }

    if (!PASSWORD_PATTERN.test(trimmedNewPassword)) {
      setPasswordSaveMessage('영문, 숫자, 특수문자(.!@#$%^&*?)를 포함한 8~12자로 입력해주세요.');
      return;
    }

    if (trimmedNewPassword !== trimmedNewPasswordConfirm) {
      setPasswordSaveMessage('새 비밀번호가 일치하지 않습니다.');
      return;
    }

    try {
      await changePassword({
        currentPassword: trimmedCurrentPassword,
        newPassword: trimmedNewPassword,
      });

      setPasswordSaveMessage('비밀번호가 변경되었습니다.');

      window.setTimeout(() => closePasswordEditor(), 600);
    } catch (error) {
      setPasswordSaveMessage(error.message || '비밀번호를 변경하지 못했습니다.');
    }
  };

  const handleSaveAll = async () => {
    const phoneNumbers = profileForm.phone.replace(/[^\d]/g, '');

    if (phoneNumbers.length !== 11) {
      setSaveMessage('휴대폰 번호는 3-4-4 형식으로 입력해주세요.');
      return;
    }

    try {
      await updateMe({
        name: profileForm.name,
        email: profileForm.email,
        phone: phoneNumbers,
      });

      setStoredNoticeSettings({
        emailNotice,
        smsNotice,
        pushNotice,
      });

      await fetchMe({ force: true });

      setSaveMessage('');
      setIsProfileEditorOpen(false);
      setIsSaveToastVisible(true);

      if (saveToastTimerRef.current) {
        window.clearTimeout(saveToastTimerRef.current);
      }

      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          window.scrollTo({
            top: 0,
            left: 0,
            behavior: 'smooth',
          });
        });
      });

      saveToastTimerRef.current = window.setTimeout(() => {
        setIsSaveToastVisible(false);
        saveToastTimerRef.current = null;
      }, 2000);
    } catch (error) {
      setSaveMessage(error.message || '회원 정보를 저장하지 못했습니다.');
    }
  };

  return (
    <>
      <section className="mypage-content">
        <header className="mypage-heading mypage-profile-heading">
          <h1>회원 정보 수정</h1>
          <p>회원 정보와 기본 배송지 정보를 확인하고 필요한 경우 수정할 수 있습니다.</p>
        </header>

        {!isProfileEditorOpen ? (
          <section className="mypage-info-card">
            <div className="mypage-info-toolbar">
              <div className="mypage-security-badge">
                <span className="mypage-security-icon">
                  <IconLock />
                </span>
                <span>비밀번호 확인 후 수정 가능</span>
              </div>

              <button type="button" className="mypage-solid-button" onClick={openProfileEditor}>
                <IconEdit />
                <span>수정하기</span>
              </button>
            </div>

            <section className="mypage-info-section">
              <h2>기본 회원 정보</h2>

              <div className="mypage-info-grid">
                <div className="mypage-info-item">
                  <span className="mypage-info-label">이름</span>
                  <strong>{maskName(userName)}</strong>
                </div>

                <div className="mypage-info-item">
                  <span className="mypage-info-label">아이디</span>
                  <strong>{maskLoginId(loginId)}</strong>
                </div>

                <div className="mypage-info-item">
                  <span className="mypage-info-label">이메일</span>
                  <strong>{maskEmail(email)}</strong>
                </div>

                <div className="mypage-info-item">
                  <span className="mypage-info-label">휴대폰 번호</span>
                  <strong>{maskPhone(phone)}</strong>
                </div>
              </div>
            </section>

            <section className="mypage-info-section mypage-address-section">
              <h2>기본 배송지</h2>

              <div className="mypage-info-grid">
                <div className="mypage-info-item">
                  <span className="mypage-info-label">수령인</span>
                  <strong>{maskName(defaultAddress?.receiverName ?? userName)}</strong>
                </div>

                <div className="mypage-info-item">
                  <span className="mypage-info-label">우편번호</span>
                  <strong>{maskPostcode(defaultAddress?.postcode)}</strong>
                </div>

                <div className="mypage-info-item">
                  <span className="mypage-info-label">주소</span>
                  <strong>{maskAddress(defaultAddress?.address)}</strong>
                </div>

                <div className="mypage-info-item">
                  <span className="mypage-info-label">상세 주소</span>
                  <strong>{maskDetailAddress(defaultAddress?.detailAddress)}</strong>
                </div>
              </div>
            </section>
          </section>
        ) : (
          <>
            <section className="mypage-edit-section">
              <div className="mypage-edit-section-header">
                <div>
                  <h2>기본 회원 정보</h2>
                  <p>회원 정보와 생일을 바로 수정할 수 있습니다.</p>
                </div>
              </div>

              <div className="mypage-direct-form">
                <label className="mypage-direct-row">
                  <span>이름</span>
                  <input
                    type="text"
                    name="name"
                    maxLength={20}
                    value={profileForm.name}
                    onChange={handleProfileInputChange}
                  />
                </label>

                <label className="mypage-direct-row">
                  <span>아이디</span>
                  <input type="text" name="loginId" value={profileForm.loginId} readOnly />
                </label>

                <label className="mypage-direct-row">
                  <span>이메일</span>
                  <input
                    type="email"
                    name="email"
                    value={profileForm.email}
                    onChange={handleProfileInputChange}
                  />
                </label>

                <label className="mypage-direct-row">
                  <span>휴대폰 번호</span>
                  <input
                    type="text"
                    name="phone"
                    inputMode="numeric"
                    maxLength={13}
                    value={profileForm.phone}
                    onChange={handleProfileInputChange}
                    placeholder="010-1234-5678"
                  />
                </label>

                <label className="mypage-direct-row">
                  <span>생일</span>
                  <input type="date" name="birthday" value={profileForm.birthday} readOnly />
                </label>
              </div>

              <div className="mypage-password-toggle-row">
                <div>
                  <h3>비밀번호</h3>
                  <p>비밀번호를 변경하려면 별도 패널에서 진행해주세요.</p>
                </div>

                <button
                  type="button"
                  className="mypage-outline-button"
                  onClick={() => {
                    setPasswordSaveMessage('');
                    setIsPasswordEditorOpen(true);
                  }}
                >
                  비밀번호 변경
                </button>
              </div>
            </section>

            <section className="mypage-edit-section">
              <div className="mypage-edit-section-header">
                <div>
                  <h2>수신 설정</h2>
                  <p>상품, 혜택, 이벤트 소식을 받아보세요. 선택 사항입니다.</p>
                </div>
              </div>

              <div className="mypage-notice-list">
                <label className="mypage-notice-row">
                  <span>
                    <strong>이메일 수신</strong>
                    <small>이메일로 마케팅 소식과 이벤트 정보를 받습니다.</small>
                  </span>

                  <input
                    type="checkbox"
                    checked={emailNotice}
                    onChange={(event) => setEmailNotice(event.target.checked)}
                  />
                </label>

                <label className="mypage-notice-row">
                  <span>
                    <strong>SMS 수신</strong>
                    <small>SMS로 주요 혜택 및 이벤트 정보를 받습니다.</small>
                  </span>

                  <input
                    type="checkbox"
                    checked={smsNotice}
                    onChange={(event) => setSmsNotice(event.target.checked)}
                  />
                </label>

                <label className="mypage-notice-row">
                  <span>
                    <strong>푸시 알림 수신</strong>
                    <small>앱 푸시 알림으로 실시간 소식을 받습니다.</small>
                  </span>

                  <input
                    type="checkbox"
                    checked={pushNotice}
                    onChange={(event) => setPushNotice(event.target.checked)}
                  />
                </label>
              </div>
            </section>

            <div className="mypage-all-save-bar">
              {saveMessage && <span>{saveMessage}</span>}

              <button
                type="button"
                className="mypage-outline-button"
                onClick={() => {
                  setSaveMessage('');
                  setIsProfileEditorOpen(false);
                }}
              >
                취소
              </button>

              <button
                type="button"
                className="mypage-solid-button mypage-all-save-button"
                onClick={handleSaveAll}
              >
                전체 저장
              </button>
            </div>
          </>
        )}
      </section>

      {isSaveToastVisible && (
        <div className="mypage-save-toast" role="status" aria-live="polite">
          저장되었습니다.
        </div>
      )}

      {isPasswordEditorOpen && (
        <div className="mypage-password-modal-backdrop" onClick={closePasswordEditor}>
          <section
            className="mypage-password-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="mypagePasswordModalTitle"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mypage-password-modal-header">
              <div>
                <h2 id="mypagePasswordModalTitle">비밀번호 변경</h2>
                <p>회원가입과 동일한 비밀번호 조건을 사용합니다.</p>
              </div>

              <button type="button" aria-label="비밀번호 변경 닫기" onClick={closePasswordEditor}>
                ×
              </button>
            </div>

            <div className="mypage-password-modal-body">
              <label>
                <span>현재 비밀번호</span>

                <input
                  type="password"
                  name="currentPassword"
                  value={passwordForm.currentPassword}
                  onChange={handlePasswordInputChange}
                  placeholder="현재 비밀번호를 입력해주세요."
                  autoComplete="current-password"
                />
              </label>

              <label>
                <span>새 비밀번호</span>

                <input
                  type="password"
                  name="newPassword"
                  value={passwordForm.newPassword}
                  onChange={handlePasswordInputChange}
                  placeholder="새 비밀번호를 입력해주세요."
                  maxLength={PASSWORD_MAX_LENGTH}
                  autoComplete="new-password"
                />

                <small className={passwordStatus === 'error' ? 'is-error' : ''}>
                  영문, 숫자, 특수문자 (.!@#$%^&amp;*?)를 포함한 8~12자
                </small>
              </label>

              <label>
                <span>새 비밀번호 확인</span>

                <input
                  type="password"
                  name="newPasswordConfirm"
                  value={passwordForm.newPasswordConfirm}
                  onChange={handlePasswordInputChange}
                  placeholder="새 비밀번호를 다시 입력해주세요."
                  maxLength={PASSWORD_MAX_LENGTH}
                  autoComplete="new-password"
                />

                {passwordCheckStatus === 'error' && (
                  <small className="is-error">비밀번호가 일치하지 않습니다.</small>
                )}
              </label>

              {passwordSaveMessage && (
                <p className="mypage-password-save-message">{passwordSaveMessage}</p>
              )}
            </div>

            <div className="mypage-password-modal-actions">
              <button type="button" className="is-cancel" onClick={closePasswordEditor}>
                취소
              </button>

              <button type="button" className="is-save" onClick={handlePasswordSave}>
                저장
              </button>
            </div>
          </section>
        </div>
      )}
    </>
  );
}

export default ProfilePage;
