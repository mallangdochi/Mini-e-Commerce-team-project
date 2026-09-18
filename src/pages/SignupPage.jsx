import { useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { checkEmailAvailability, checkIdAvailability, signup } from '@/api/authApi';
import '@/styles/signup.css';
import TermsPage from '@/pages/TermsPage';

const LIMITS = {
  name: 20,
  loginId: 50,
  email: 50,
  password: 50,
  phone: 13,
  address: 100,
  detailAddress: 50,
};

const FIELD_IDS = {
  name: 'signupName',
  loginId: 'signupLoginId',
  email: 'signupEmail',
  password: 'signupPassword',
  passwordCheck: 'signupPasswordCheck',
  phone: 'signupPhone',
};

const NAME_PATTERN = /^[가-힣a-zA-Z ]+$/;
const EMAIL_PATTERN = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const PASSWORD_PATTERN = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[.!@#$%^&*?])[a-zA-Z\d.!@#$%^&*?]{12,}$/;
const PHONE_PATTERN = /^\d{10,11}$/;

function getAvailabilityResult(response) {
  const data = response?.data ?? response ?? {};

  if (typeof data.available === 'boolean') return data.available;
  if (typeof data.isAvailable === 'boolean') return data.isAvailable;
  if (typeof data.duplicate === 'boolean') return !data.duplicate;
  if (typeof data.isDuplicate === 'boolean') return !data.isDuplicate;

  return true;
}

function formatPhoneNumber(value) {
  const numbers = String(value ?? '')
    .replace(/\D/g, '')
    .slice(0, 11);

  if (numbers.length <= 3) {
    return numbers;
  }

  if (numbers.length <= 7) {
    return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
  }

  return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
}

function getPhoneNumbers(value) {
  return String(value ?? '')
    .replace(/\D/g, '')
    .slice(0, 11);
}

function StatusIcon({ status }) {
  if (status === 'success') return <span className="signup-status-icon success">✓</span>;
  if (status === 'error') return <span className="signup-status-icon error">✕</span>;
  return null;
}

function SignupPage() {
  const navigate = useNavigate();
  const termsDialog = useRef(null);
  const [selectedTerms, setSelectedTerms] = useState(null);
  const addressDialog = useRef(null);
  const addressContainer = useRef(null);
  const loginIdRevision = useRef(0);
  const emailRevision = useRef(0);
  const [addressLoading, setAddressLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    loginId: '',
    email: '',
    password: '',
    passwordCheck: '',
    phone: '',
    postcode: '',
    address: '',
    detailAddress: '',
  });
  const [agreements, setAgreements] = useState({
    service: false,
    privacy: false,
    marketing: false,
  });
  const [loginIdStatus, setLoginIdStatus] = useState('idle');
  const [loginIdMessage, setLoginIdMessage] = useState('');
  const [emailStatus, setEmailStatus] = useState('idle');
  const [emailMessage, setEmailMessage] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [validationError, setValidationError] = useState(null);
  const [isCheckingLoginId, setIsCheckingLoginId] = useState(false);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const passwordStatus = useMemo(() => {
    const trimmedPassword = form.password.trim();

    if (!trimmedPassword) return 'idle';
    return PASSWORD_PATTERN.test(trimmedPassword) ? 'success' : 'error';
  }, [form.password]);

  const passwordCheckStatus = useMemo(() => {
    const trimmedPassword = form.password.trim();
    const trimmedPasswordCheck = form.passwordCheck.trim();

    if (!trimmedPasswordCheck) return 'idle';
    return trimmedPassword === trimmedPasswordCheck ? 'success' : 'error';
  }, [form.password, form.passwordCheck]);

  const allAgreed = Object.values(agreements).every(Boolean);

  const clearValidationError = (targetId) => {
    setValidationError((previous) => (previous?.targetId === targetId ? null : previous));
  };

  const updateForm = (name, value) => {
    setForm((previous) => ({ ...previous, [name]: value }));
    setSubmitError('');

    const targetId = FIELD_IDS[name];
    if (targetId) clearValidationError(targetId);
  };

  const updateAgreement = (name, checked) => {
    setAgreements((previous) => ({
      ...previous,
      [name]: checked,
    }));
    setSubmitError('');

    if (checked) {
      clearValidationError(`signupAgreement-${name}`);
    }
  };

  const focusAndFlashField = (targetId) => {
    window.requestAnimationFrame(() => {
      const target = document.getElementById(targetId);
      if (!target) return;

      const flashTarget =
        target.type === 'checkbox' ? target.closest('.signup-term-row') || target : target;

      target.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });

      // 같은 오류를 다시 제출해도 애니메이션이 다시 실행되도록 초기화
      flashTarget.classList.remove('signup-error-flash');
      void flashTarget.offsetWidth;
      flashTarget.classList.add('signup-error-flash');

      window.setTimeout(() => {
        target.focus({ preventScroll: true });
      }, 250);

      window.setTimeout(() => {
        flashTarget.classList.remove('signup-error-flash');
      }, 1000);
    });
  };

  const showFieldError = (targetId, message) => {
    setValidationError({ targetId, message });
    setSubmitError('');
    focusAndFlashField(targetId);
  };

  const handleLoginIdChange = (event) => {
    const value = event.target.value.replace(/\s/g, '').slice(0, LIMITS.loginId);

    loginIdRevision.current += 1;
    updateForm('loginId', value);
    setLoginIdStatus('idle');
    setLoginIdMessage('');
  };

  const handleEmailChange = (event) => {
    const value = event.target.value.replace(/[^a-zA-Z0-9@._%+-]/g, '').slice(0, LIMITS.email);

    emailRevision.current += 1;
    updateForm('email', value);
    setEmailStatus('idle');
    setEmailMessage('');
  };

  const handlePasswordChange = (name, value) => {
    updateForm(name, value.replace(/[^a-zA-Z0-9.!@#$%^&*?]/g, '').slice(0, LIMITS.password));
  };

  const handleCheckLoginId = async () => {
    const loginId = form.loginId.trim();

    if (!loginId) {
      const message = '아이디를 입력해 주세요.';

      setLoginIdStatus('error');
      setLoginIdMessage(message);
      showFieldError(FIELD_IDS.loginId, message);
      return;
    }

    const revision = loginIdRevision.current;

    setLoginIdMessage('');
    setIsCheckingLoginId(true);
    setLoginIdStatus('idle');

    try {
      const response = await checkIdAvailability(loginId);

      if (revision !== loginIdRevision.current) return;

      const available = getAvailabilityResult(response);
      const message =
        response?.message ||
        response?.data?.message ||
        (available ? '사용 가능한 아이디입니다.' : '이미 사용 중인 아이디입니다.');

      setLoginIdStatus(available ? 'success' : 'error');
      setLoginIdMessage(message);

      if (available) {
        clearValidationError(FIELD_IDS.loginId);
      } else {
        showFieldError(FIELD_IDS.loginId, message);
      }
    } catch (error) {
      if (revision !== loginIdRevision.current) return;

      const message = error?.message || '아이디 중복확인에 실패했습니다.';

      setLoginIdStatus('error');
      setLoginIdMessage(message);
      showFieldError(FIELD_IDS.loginId, message);
    } finally {
      setIsCheckingLoginId(false);
    }
  };

  const handleCheckEmail = async () => {
    const email = form.email.trim();

    if (!EMAIL_PATTERN.test(email)) {
      const message = '올바른 이메일 형식으로 입력해 주세요.';

      setEmailStatus('error');
      setEmailMessage(message);
      showFieldError(FIELD_IDS.email, message);
      return;
    }

    const revision = emailRevision.current;

    setEmailMessage('');
    setIsCheckingEmail(true);
    setEmailStatus('idle');

    try {
      const response = await checkEmailAvailability(email);

      if (revision !== emailRevision.current) return;

      const available = getAvailabilityResult(response);
      const message =
        response?.message ||
        response?.data?.message ||
        (available ? '사용 가능한 이메일입니다.' : '이미 사용 중인 이메일입니다.');

      setEmailStatus(available ? 'success' : 'error');
      setEmailMessage(message);

      if (available) {
        clearValidationError(FIELD_IDS.email);
      } else {
        showFieldError(FIELD_IDS.email, message);
      }
    } catch (error) {
      if (revision !== emailRevision.current) return;

      const message = error?.message || '이메일 중복확인에 실패했습니다.';

      setEmailStatus('error');
      setEmailMessage(message);
      showFieldError(FIELD_IDS.email, message);
    } finally {
      setIsCheckingEmail(false);
    }
  };

  const handleAddressSearch = async () => {
    if (addressLoading) return;
    setAddressLoading(true);
    setSubmitError('');
    try {
      if (!window.kakao?.Postcode && !window.daum?.Postcode) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          const timer = window.setTimeout(
            () => reject(new Error('주소 검색 연결 시간이 초과되었습니다.')),
            15000
          );
          script.src = 'https://t1.kakaocdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
          script.onload = () => {
            window.clearTimeout(timer);
            resolve();
          };
          script.onerror = () => {
            window.clearTimeout(timer);
            reject(new Error('주소 검색 서비스를 불러오지 못했습니다.'));
          };
          document.head.appendChild(script);
        });
      }
      const Postcode = window.kakao?.Postcode || window.daum?.Postcode;
      if (!Postcode) throw new Error('주소 검색 서비스를 불러오지 못했습니다.');
      addressContainer.current.replaceChildren();
      addressDialog.current.showModal();
      new Postcode({
        width: '100%',
        height: '100%',
        oncomplete: (data) => {
          setForm((previous) => ({
            ...previous,
            postcode: data.zonecode,
            address: data.address,
            detailAddress: '',
          }));
          addressDialog.current.close();
          window.requestAnimationFrame(() =>
            document.getElementById('signupDetailAddress')?.focus()
          );
        },
      }).embed(addressContainer.current);
    } catch (error) {
      addressDialog.current?.close();
      setSubmitError(error.message + ' 일반 브라우저에서 다시 시도해 주세요.');
    } finally {
      setAddressLoading(false);
    }
  };

  const validateForm = () => {
    if (!form.name.trim()) {
      return {
        targetId: FIELD_IDS.name,
        message: '이름을 입력해 주세요.',
      };
    }

    if (!NAME_PATTERN.test(form.name)) {
      return {
        targetId: FIELD_IDS.name,
        message: '이름은 한글과 영문만 입력할 수 있습니다.',
      };
    }

    if (loginIdStatus !== 'success') {
      return {
        targetId: FIELD_IDS.loginId,
        message: '아이디 중복확인을 완료해 주세요.',
      };
    }

    if (emailStatus !== 'success') {
      return {
        targetId: FIELD_IDS.email,
        message: '이메일 중복확인을 완료해 주세요.',
      };
    }

    if (passwordStatus !== 'success') {
      return {
        targetId: FIELD_IDS.password,
        message: '비밀번호는 12자 이상이며 영문, 숫자, 특수문자를 포함해야 합니다.',
      };
    }

    if (passwordCheckStatus !== 'success') {
      return {
        targetId: FIELD_IDS.passwordCheck,
        message: '비밀번호가 일치하지 않습니다.',
      };
    }

    if (!PHONE_PATTERN.test(getPhoneNumbers(form.phone))) {
      return {
        targetId: FIELD_IDS.phone,
        message: '휴대폰 번호를 숫자 10~11자리로 입력해 주세요.',
      };
    }

    if (!agreements.service) {
      return {
        targetId: 'signupAgreement-service',
        message: 'ARC 이용약관에 동의해 주세요.',
      };
    }

    if (!agreements.privacy) {
      return {
        targetId: 'signupAgreement-privacy',
        message: '개인정보 수집 및 이용에 동의해 주세요.',
      };
    }

    return null;
  };

  const getServerErrorTarget = (message = '') => {
    if (/아이디|loginId|login id/i.test(message)) return FIELD_IDS.loginId;
    if (/이메일|email/i.test(message)) return FIELD_IDS.email;
    if (/비밀번호 확인|password confirmation|confirm password/i.test(message)) {
      return FIELD_IDS.passwordCheck;
    }
    if (/비밀번호|password/i.test(message)) return FIELD_IDS.password;
    if (/이름|name/i.test(message)) return FIELD_IDS.name;
    if (/휴대폰|전화|phone/i.test(message)) return FIELD_IDS.phone;
    if (/개인정보|privacy/i.test(message)) return 'signupAgreement-privacy';
    if (/이용약관|service terms|terms of service/i.test(message)) {
      return 'signupAgreement-service';
    }
    return null;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const error = validateForm();

    if (error) {
      showFieldError(error.targetId, error.message);
      return;
    }

    setValidationError(null);
    setIsSubmitting(true);
    setSubmitError('');

    try {
      const response = await signup({
        loginId: form.loginId.trim(),
        email: form.email.trim(),
        password: form.password.trim(),
        name: form.name.trim(),
        phone: getPhoneNumbers(form.phone),
        postcode: form.postcode.trim(),
        address: form.address.trim(),
        detailAddress: form.detailAddress.trim(),
        agreeTerms: agreements.service,
        agreePrivacy: agreements.privacy,
        agreeMarketing: agreements.marketing,
      });

      navigate('/login', {
        replace: true,
        state: {
          signupMessage: response.message || '회원가입이 완료되었습니다. 로그인해 주세요.',
        },
      });
    } catch (error) {
      const message = error?.message || '회원가입에 실패했습니다.';
      const targetId = getServerErrorTarget(message);

      if (targetId) {
        showFieldError(targetId, message);
      } else {
        setValidationError(null);
        setSubmitError(message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const agreementItems = [
    {
      name: 'service',
      required: true,
      text: 'ARC 이용약관에 동의합니다.',
      to: '/terms/service',
    },
    {
      name: 'privacy',
      required: true,
      text: '개인정보 수집 및 이용에 동의합니다.',
      to: '/terms/privacy',
    },
    {
      name: 'marketing',
      required: false,
      text: '이벤트 및 마케팅 정보 수신에 동의합니다.',
      to: '/terms/marketing',
    },
  ];

  return (
    <main className="signup-page">
      <dialog
        ref={termsDialog}
        className="signup-terms-dialog"
        aria-label="약관 상세"
        onClose={() => setSelectedTerms(null)}
      >
        {selectedTerms && (
          <TermsPage selectedType={selectedTerms} onConfirm={() => termsDialog.current.close()} />
        )}
      </dialog>
      <dialog
        ref={addressDialog}
        className="signup-address-dialog"
        aria-labelledby="addressDialogTitle"
      >
        <div className="signup-address-dialog-header">
          <h2 id="addressDialogTitle">우편번호 찾기</h2>
          <button
            type="button"
            onClick={() => addressDialog.current.close()}
            aria-label="주소 검색 닫기"
          >
            ✕
          </button>
        </div>
        <div ref={addressContainer} className="signup-address-embed" />
      </dialog>
      <div className="signup-container">
        <Link to="/" className="signup-logo-wrapper" aria-label="ARC 홈으로 이동">
          <svg viewBox="0 0 658.06 315.87" className="signup-app-logo">
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
        <section className="signup-card">
          <div className="signup-card-header">
            <h1>회원가입</h1>
            <p>모든 항목을 정확히 입력해 주세요.</p>
          </div>
          <form className="signup-form" onSubmit={handleSubmit} noValidate>
            <div className="signup-form-group">
              <label htmlFor="signupName">
                이름 <span className="signup-required">*</span>
              </label>
              <div className="signup-input-with-icon">
                <input
                  id="signupName"
                  type="text"
                  value={form.name}
                  onChange={(event) => {
                    const value = event.target.value.slice(0, LIMITS.name);
                    updateForm(
                      'name',
                      value.replace(/[^ㄱ-ㅎㅏ-ㅣ가-힣a-zA-Z\u1100-\u11ff\u3130-\u318f ]/g, '')
                    );
                  }}
                  maxLength={LIMITS.name}
                  placeholder="이름을 입력하세요"
                  autoComplete="name"
                  required
                />
                {form.name.trim() && (
                  <StatusIcon status={NAME_PATTERN.test(form.name) ? 'success' : 'error'} />
                )}
              </div>
              {validationError?.targetId === FIELD_IDS.name && (
                <p className="signup-field-error-message" role="alert">
                  {validationError.message}
                </p>
              )}
            </div>
            <div className="signup-form-group">
              <label htmlFor="signupLoginId">
                아이디 <span className="signup-required">*</span>
              </label>
              <div className="signup-input-row">
                <div className="signup-input-with-icon signup-flex-1">
                  <input
                    id="signupLoginId"
                    type="text"
                    value={form.loginId}
                    onChange={handleLoginIdChange}
                    maxLength={LIMITS.loginId}
                    placeholder="아이디를 입력하세요"
                    autoComplete="username"
                    required
                  />
                  <StatusIcon status={loginIdStatus} />
                </div>
                <button
                  type="button"
                  className="signup-inline-btn"
                  onClick={handleCheckLoginId}
                  disabled={isCheckingLoginId}
                >
                  {isCheckingLoginId ? '확인 중' : '아이디 중복확인'}
                </button>
              </div>
              <div className="signup-feedback-row">
                {validationError?.targetId === FIELD_IDS.loginId ? (
                  <p className="signup-message error" role="alert">
                    {validationError.message}
                  </p>
                ) : loginIdMessage ? (
                  <p className={`signup-message ${loginIdStatus}`}>{loginIdMessage}</p>
                ) : (
                  <span />
                )}
              </div>
            </div>

            <div className="signup-form-group">
              <label htmlFor="signupEmail">
                이메일 <span className="signup-required">*</span>
              </label>
              <div className="signup-input-row">
                <div className="signup-input-with-icon signup-flex-1">
                  <input
                    id="signupEmail"
                    type="email"
                    value={form.email}
                    onChange={handleEmailChange}
                    maxLength={LIMITS.email}
                    placeholder="이메일을 입력하세요"
                    autoComplete="email"
                    required
                  />
                  <StatusIcon status={emailStatus} />
                </div>
                <button
                  type="button"
                  className="signup-inline-btn"
                  onClick={handleCheckEmail}
                  disabled={isCheckingEmail}
                >
                  {isCheckingEmail ? '확인 중' : '이메일 중복확인'}
                </button>
              </div>
              <div className="signup-feedback-row">
                {validationError?.targetId === FIELD_IDS.email ? (
                  <p className="signup-message error" role="alert">
                    {validationError.message}
                  </p>
                ) : emailMessage ? (
                  <p className={`signup-message ${emailStatus}`}>{emailMessage}</p>
                ) : (
                  <span />
                )}
              </div>
            </div>
            <div className="signup-form-group">
              <label htmlFor="signupPassword">
                비밀번호 <span className="signup-required">*</span>
              </label>
              <div className="signup-input-with-icon">
                <input
                  id="signupPassword"
                  type="password"
                  value={form.password}
                  onChange={(event) => handlePasswordChange('password', event.target.value)}
                  maxLength={LIMITS.password}
                  placeholder="비밀번호를 입력하세요"
                  autoComplete="new-password"
                  required
                />
                <StatusIcon status={passwordStatus} />
              </div>
              <div className="signup-feedback-row">
                <p
                  className={`signup-message ${
                    validationError?.targetId === FIELD_IDS.password || passwordStatus === 'error'
                      ? 'error'
                      : ''
                  }`}
                  role={validationError?.targetId === FIELD_IDS.password ? 'alert' : undefined}
                >
                  {validationError?.targetId === FIELD_IDS.password
                    ? validationError.message
                    : '12자 이상 · 영문, 숫자, 특수문자(.!@#$%^&*?) 포함'}
                </p>
              </div>
            </div>
            <div className="signup-form-group">
              <label htmlFor="signupPasswordCheck">
                비밀번호 확인 <span className="signup-required">*</span>
              </label>
              <div className="signup-input-with-icon">
                <input
                  id="signupPasswordCheck"
                  type="password"
                  value={form.passwordCheck}
                  onChange={(event) => handlePasswordChange('passwordCheck', event.target.value)}
                  maxLength={LIMITS.password}
                  placeholder="비밀번호를 다시 입력하세요"
                  autoComplete="new-password"
                  required
                />
                <StatusIcon status={passwordCheckStatus} />
              </div>
              <div className="signup-feedback-row">
                {validationError?.targetId === FIELD_IDS.passwordCheck ? (
                  <p className="signup-message error" role="alert">
                    {validationError.message}
                  </p>
                ) : passwordCheckStatus === 'error' ? (
                  <p className="signup-message error">비밀번호가 일치하지 않습니다.</p>
                ) : (
                  <span />
                )}
              </div>
            </div>
            <div className="signup-form-group">
              <label htmlFor="signupPhone">
                휴대폰 번호 <span className="signup-required">*</span>
              </label>
              <div className="signup-input-with-icon">
                <input
                  id="signupPhone"
                  type="tel"
                  inputMode="numeric"
                  value={form.phone}
                  onChange={(event) => updateForm('phone', formatPhoneNumber(event.target.value))}
                  maxLength={LIMITS.phone}
                  placeholder="010-0000-0000"
                  autoComplete="tel"
                  required
                />
                {form.phone && (
                  <StatusIcon
                    status={PHONE_PATTERN.test(getPhoneNumbers(form.phone)) ? 'success' : 'error'}
                  />
                )}
              </div>
              {validationError?.targetId === FIELD_IDS.phone && (
                <p className="signup-field-error-message" role="alert">
                  {validationError.message}
                </p>
              )}
            </div>
            <div className="signup-form-group">
              <label htmlFor="signupPostcode">주소</label>
              <div className="signup-address-stack">
                <div className="signup-input-row">
                  <input
                    id="signupPostcode"
                    type="text"
                    value={form.postcode}
                    placeholder="우편번호"
                    className="signup-flex-1"
                    maxLength={5}
                    readOnly
                  />
                  <button
                    type="button"
                    className="signup-inline-btn"
                    onClick={handleAddressSearch}
                    disabled={addressLoading}
                  >
                    우편번호 찾기
                  </button>
                </div>
                <input
                  type="text"
                  value={form.address}
                  placeholder="주소"
                  maxLength={LIMITS.address}
                  readOnly
                />
                <div className="signup-counted-input">
                  <input
                    id="signupDetailAddress"
                    type="text"
                    value={form.detailAddress}
                    onChange={(event) =>
                      updateForm('detailAddress', event.target.value.slice(0, LIMITS.detailAddress))
                    }
                    placeholder="상세주소"
                    maxLength={LIMITS.detailAddress}
                  />
                </div>
              </div>
            </div>
            <div className="signup-terms-section">
              <p className="signup-terms-main-title">이용약관 및 개인정보 수집·이용 동의</p>
              <label className="signup-checkbox-label signup-checkbox-bold">
                <input
                  type="checkbox"
                  checked={allAgreed}
                  onChange={(event) => {
                    const checked = event.target.checked;
                    setAgreements({
                      service: checked,
                      privacy: checked,
                      marketing: checked,
                    });
                    setSubmitError('');

                    if (checked) {
                      setValidationError((previous) =>
                        previous?.targetId?.startsWith('signupAgreement-') ? null : previous
                      );
                    }
                  }}
                />
                <span>모두 동의합니다.</span>
              </label>
              <div className="signup-terms-list">
                {agreementItems.map((item) => (
                  <div className="signup-term-row" key={item.name}>
                    <label className="signup-checkbox-label">
                      <input
                        id={`signupAgreement-${item.name}`}
                        type="checkbox"
                        checked={agreements[item.name]}
                        onChange={(event) => updateAgreement(item.name, event.target.checked)}
                      />
                      <span>
                        <strong>[{item.required ? '필수' : '선택'}]</strong> {item.text}
                      </span>
                    </label>
                    <button
                      type="button"
                      className="signup-terms-view"
                      onClick={() => {
                        setSelectedTerms(item.name);
                        termsDialog.current.showModal();
                      }}
                    >
                      보기
                    </button>
                  </div>
                ))}
              </div>
              {validationError?.targetId?.startsWith('signupAgreement-') && (
                <p className="signup-field-error-message signup-terms-error-message" role="alert">
                  {validationError.message}
                </p>
              )}
            </div>
            {submitError && !validationError && (
              <p className="signup-submit-error" role="alert">
                {submitError}
              </p>
            )}
            <button type="submit" className="signup-submit-btn" disabled={isSubmitting}>
              {isSubmitting ? '가입 중...' : '회원가입'}
            </button>
          </form>
          <p className="signup-bottom-link">
            이미 계정이 있으신가요?<Link to="/login">로그인</Link>
          </p>
        </section>
      </div>
    </main>
  );
}

export default SignupPage;
