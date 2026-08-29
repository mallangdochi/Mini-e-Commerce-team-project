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
            className="signup-app-logo"
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
