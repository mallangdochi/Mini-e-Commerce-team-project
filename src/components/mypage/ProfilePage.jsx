import { useEffect, useMemo, useRef, useState } from 'react';

import useAuthStore from '@/store/authStore';
import {
  getStoredNoticeSettings,
  getStoredProfileOverrides,
  setStoredNoticeSettings,
  setStoredPasswordChangeDraft,
  setStoredProfileOverrides,
  setStoredUserInfo,
} from '@/utils/storage';
import '@/styles/mypage.css';

const PASSWORD_MAX_LENGTH = 12;
const PASSWORD_PATTERN = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[.!@#$%^&*?])[a-zA-Z\d.!@#$%^&*?]{8,12}$/;

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
  const overrides = getStoredProfileOverrides();

  return {
    name: overrides.name ?? user?.name ?? '',
    loginId: overrides.loginId ?? user?.loginId ?? user?.identifier ?? user?.id ?? '',
    email: overrides.email ?? user?.email ?? '',
    phone: formatPhoneNumber(
      overrides.phone ?? user?.phone ?? user?.phoneNumber ?? user?.mobile ?? ''
    ),
    birthday: overrides.birthday ?? user?.birthday ?? user?.birthDate ?? user?.dateOfBirth ?? '',
  };
}

function ProfilePage() {
  const user = useAuthStore((state) => state.user);
  const syncAuthFromStorage = useAuthStore((state) => state.syncAuthFromStorage);
  const saveToastTimerRef = useRef(null);

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

  useEffect(
    () => () => {
      if (saveToastTimerRef.current) {
        window.clearTimeout(saveToastTimerRef.current);
      }
    },
    []
  );

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
    if (!passwordForm.newPassword) return 'idle';
    return PASSWORD_PATTERN.test(passwordForm.newPassword) ? 'success' : 'error';
  }, [passwordForm.newPassword]);

  const passwordCheckStatus = useMemo(() => {
    if (!passwordForm.newPasswordConfirm) return 'idle';
    return passwordForm.newPassword === passwordForm.newPasswordConfirm ? 'success' : 'error';
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

  const handlePasswordSave = () => {
    if (!passwordForm.currentPassword) {
      setPasswordSaveMessage('현재 비밀번호를 입력해주세요.');
      return;
    }

    if (passwordStatus !== 'success') {
      setPasswordSaveMessage('영문, 숫자, 특수문자(.!@#$%^&*?)를 포함한 8~12자로 입력해주세요.');
      return;
    }

    if (passwordCheckStatus !== 'success') {
      setPasswordSaveMessage('새 비밀번호가 일치하지 않습니다.');
      return;
    }

    setStoredPasswordChangeDraft({
      changedAt: new Date().toISOString(),
    });

    setPasswordSaveMessage('비밀번호 변경 값이 저장되었습니다.');

    window.setTimeout(() => {
      closePasswordEditor();
    }, 600);
  };

  const handleSaveAll = () => {
    const phoneNumbers = profileForm.phone.replace(/[^\d]/g, '');

    if (phoneNumbers.length !== 11) {
      setSaveMessage('휴대폰 번호는 3-4-4 형식으로 입력해주세요.');
      return;
    }

    const profileOverrides = {
      name: profileForm.name,
      loginId: profileForm.loginId,
      email: profileForm.email,
      phone: formatPhoneNumber(profileForm.phone),
      birthday: profileForm.birthday,
    };

    const nextUser = {
      ...(user ?? {}),
      ...profileOverrides,
    };

    setStoredUserInfo(nextUser);
    setStoredProfileOverrides(profileOverrides);
    setStoredNoticeSettings({
      emailNotice,
      smsNotice,
      pushNotice,
    });

    syncAuthFromStorage();
    window.dispatchEvent(new Event('auth-change'));
    setSaveMessage('');

    if (saveToastTimerRef.current) {
      window.clearTimeout(saveToastTimerRef.current);
    }

    setIsSaveToastVisible(true);

    saveToastTimerRef.current = window.setTimeout(() => {
      setIsSaveToastVisible(false);
      saveToastTimerRef.current = null;
    }, 2000);
  };

  return (
    <>
      <section className="mypage-content">
        <header className="mypage-heading mypage-profile-heading">
          <h1>회원 정보 수정</h1>
          <p>더 나은 서비스를 위해 회원 정보를 최신 상태로 관리해주세요.</p>
        </header>

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
              <input
                type="text"
                name="loginId"
                value={profileForm.loginId}
                onChange={handleProfileInputChange}
              />
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
              <input
                type="date"
                name="birthday"
                value={profileForm.birthday}
                onChange={handleProfileInputChange}
              />
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
            className="mypage-solid-button mypage-all-save-button"
            onClick={handleSaveAll}
          >
            전체 저장
          </button>
        </div>
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
                  영문, 숫자, 특수문자(.!@#$%^&amp;*?)를 포함한 8~12자
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
