import { useState } from 'react';
import { Link } from 'react-router-dom';

import '@/styles/signup.css';

function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordCheck, setPasswordCheck] = useState('');

  const [birthDate, setBirthDate] = useState('');

  const [postcode, setPostcode] = useState('');
  const [address, setAddress] = useState('');
  const [detailAddress, setDetailAddress] = useState('');

  const [allAgree, setAllAgree] = useState(false);
  const [marketingAgree, setMarketingAgree] = useState(false);
  const [thirdPartyAgree, setThirdPartyAgree] = useState(false);

  const handleAllAgree = (event) => {
    const checked = event.target.checked;

    setAllAgree(checked);
    setMarketingAgree(checked);
    setThirdPartyAgree(checked);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    // 추후 api연결 위치
    console.log({
      name,
      email,
      password,
      passwordCheck,
      birthDate,
      postcode,
      address,
      detailAddress,
      marketingAgree,
      thirdPartyAgree,
    });
  };

  return (
    <main className="signup-page">
      <div className="signup-container">
        <Link to="/" className="signup-logo-wrapper" aria-label="ARC 홈으로 이동">
          <svg
            id="_레이어_1"
            data-name="레이어 1"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 658.06 315.87"
            className="signup-app-logo"
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

        <section className="signup-card">
          <div className="signup-card-header">
            <h1>회원가입</h1>

            <p>모든 항목을 정확히 입력해주세요.</p>
          </div>

          <form className="signup-form" onSubmit={handleSubmit}>
            <div className="signup-form-group">
              <label htmlFor="signupName">
                이름
                <span className="signup-required">*</span>
              </label>

              <div className="signup-input-with-icon">
                <input
                  id="signupName"
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="이름을 입력하세요"
                  required
                />

                {name && <span className="signup-check-icon">✓</span>}
              </div>
            </div>

            <div className="signup-form-group">
              <label htmlFor="signupEmail">
                아이디 (이메일)
                <span className="signup-required">*</span>
              </label>

              <div className="signup-input-row">
                <div className="signup-input-with-icon signup-flex-1">
                  <input
                    id="signupEmail"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="이메일을 입력하세요"
                    required
                  />

                  {email && <span className="signup-check-icon">✓</span>}
                </div>

                <button type="button" className="signup-inline-btn">
                  아이디 중복확인
                </button>
              </div>

              {email && <p className="signup-success-text">사용 가능한 이메일입니다.</p>}
            </div>

            <div className="signup-form-group">
              <label htmlFor="signupPassword">
                비밀번호
                <span className="signup-required">*</span>
              </label>

              <div className="signup-input-with-icon">
                <input
                  id="signupPassword"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="비밀번호를 입력하세요"
                  required
                />

                {password && <span className="signup-check-icon">✓</span>}
              </div>

              {password && <p className="signup-success-text">안전한 비밀번호입니다.</p>}
            </div>

            <div className="signup-form-group">
              <label htmlFor="signupPasswordCheck">
                비밀번호 확인
                <span className="signup-required">*</span>
              </label>

              <div className="signup-input-with-icon">
                <input
                  id="signupPasswordCheck"
                  type="password"
                  value={passwordCheck}
                  onChange={(event) => setPasswordCheck(event.target.value)}
                  placeholder="비밀번호를 다시 입력하세요"
                  required
                />

                {passwordCheck && password === passwordCheck && (
                  <span className="signup-check-icon">✓</span>
                )}
              </div>

              {passwordCheck && password !== passwordCheck && (
                <p className="signup-error-text">비밀번호가 일치하지 않습니다.</p>
              )}
            </div>

            <div className="signup-form-group">
              <label htmlFor="signupBirthDate">생년월일</label>

              <input
                id="signupBirthDate"
                type="date"
                value={birthDate}
                onChange={(event) => setBirthDate(event.target.value)}
              />
            </div>

            <div className="signup-form-group">
              <label htmlFor="signupPostcode">주소</label>

              <div className="signup-address-stack">
                <div className="signup-input-row">
                  <input
                    id="signupPostcode"
                    type="text"
                    value={postcode}
                    onChange={(event) => setPostcode(event.target.value)}
                    placeholder="우편번호"
                    className="signup-flex-1"
                  />

                  <button type="button" className="signup-inline-btn">
                    우편 번호 찾기
                  </button>
                </div>

                <input
                  type="text"
                  value={address}
                  onChange={(event) => setAddress(event.target.value)}
                  placeholder="주소"
                />

                <input
                  type="text"
                  value={detailAddress}
                  onChange={(event) => setDetailAddress(event.target.value)}
                  placeholder="상세주소"
                />
              </div>
            </div>

            <div className="signup-terms-section">
              <p className="signup-terms-main-title">이용약관 및 개인정보 수집 / 이용 동의</p>

              <label className="signup-checkbox-label signup-checkbox-bold">
                <input type="checkbox" checked={allAgree} onChange={handleAllAgree} />
                모두 동의합니다.
              </label>

              <div className="signup-terms-sub-group">
                <p className="signup-sub-title">선택 항목 (선택)</p>

                <label className="signup-checkbox-label">
                  <input
                    type="checkbox"
                    checked={marketingAgree}
                    onChange={(event) => setMarketingAgree(event.target.checked)}
                  />
                  이벤트 및 마케팅 정보 수신에 동의합니다.
                </label>

                <label className="signup-checkbox-label">
                  <input
                    type="checkbox"
                    checked={thirdPartyAgree}
                    onChange={(event) => setThirdPartyAgree(event.target.checked)}
                  />
                  개인정보 제 3자 제공에 동의합니다.
                </label>
              </div>
            </div>

            <button type="submit" className="signup-submit-btn">
              회원가입
            </button>
          </form>

          <p className="signup-bottom-link">
            이미 계정이 있으신가요?
            <Link to="/login">로그인</Link>
          </p>
        </section>
      </div>
    </main>
  );
}

export default SignupPage;
