import { Link, useNavigate, useParams } from 'react-router-dom';
import '@/styles/terms.css';

const TERMS = {
  service: {
    title: 'ARC 이용약관',
    sections: [
      [
        '제1조 목적',
        '본 약관은 ARC가 제공하는 온라인 쇼핑몰 서비스의 이용 조건과 회원 및 서비스 제공자의 권리와 의무를 정하는 것을 목적으로 합니다.',
      ],
      [
        '제2조 회원가입',
        '이용자는 정확한 정보를 입력하고 본 약관과 개인정보 처리방침에 동의하여 회원가입을 신청할 수 있습니다. 타인의 정보를 사용하거나 사실과 다른 정보를 입력해서는 안 됩니다.',
      ],
      [
        '제3조 계정 관리',
        '회원은 자신의 아이디와 비밀번호를 안전하게 관리해야 하며, 계정의 부정 사용을 확인한 경우 즉시 ARC에 알려야 합니다.',
      ],
      [
        '제4조 상품 구매',
        '상품의 가격, 재고, 배송 조건은 주문 시 화면에 표시된 내용을 기준으로 합니다. 결제가 완료된 이후에도 품절이나 정보 오류가 확인되면 주문이 취소될 수 있습니다.',
      ],
      [
        '제5조 서비스 이용 제한',
        '서비스 운영을 방해하거나 부정한 방법으로 혜택을 취득한 경우 이용이 제한될 수 있습니다.',
      ],
    ],
  },
  privacy: {
    title: '개인정보 수집 및 이용 동의',
    sections: [
      [
        '수집 항목',
        '필수 항목은 이름, 이메일 아이디, 비밀번호입니다. 선택 항목은 생년월일, 우편번호, 주소, 상세주소입니다.',
      ],
      [
        '이용 목적',
        '회원 식별, 로그인, 회원 서비스 제공, 주문 및 배송 정보 관리, 고객 문의 대응을 위해 개인정보를 이용합니다.',
      ],
      [
        '보유 기간',
        '회원 탈퇴 시까지 보유하며, 관계 법령에서 별도의 보존 기간을 정한 경우에는 해당 기간 동안 보관합니다.',
      ],
      [
        '동의 거부 권리',
        '필수 개인정보 수집에 동의하지 않을 수 있으나, 이 경우 회원가입과 회원 서비스 이용이 제한됩니다. 선택 항목은 입력하지 않아도 회원가입할 수 있습니다.',
      ],
    ],
  },
  marketing: {
    title: '마케팅 정보 수신 동의',
    sections: [
      [
        '수집 및 이용 목적',
        '신상품, 할인, 이벤트 및 맞춤형 혜택 안내를 위해 이메일 정보를 이용합니다.',
      ],
      ['보유 기간', '회원 탈퇴 또는 마케팅 수신 동의 철회 시까지 보유합니다.'],
      [
        '선택 동의 안내',
        '본 동의는 선택 사항이며, 동의하지 않아도 ARC의 기본 회원 서비스를 이용할 수 있습니다.',
      ],
    ],
  },
};

function TermsPage({ selectedType, onConfirm }) {
  const params = useParams();
  const navigate = useNavigate();
  const type = selectedType || params.type;
  const content = TERMS[type];
  const handleConfirm = () => {
    if (onConfirm) onConfirm();
    else navigate('/signup', { replace: true });
  };

  if (!content) {
    return (
      <main className="terms-page">
        <div className="terms-container">
          <h1>약관을 찾을 수 없습니다.</h1>
          <Link to="/signup">회원가입으로 돌아가기</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="terms-page">
      <article className="terms-container">
        <div className="terms-brand-row">
          <div className="terms-brand" aria-label="ARC">
            <svg viewBox="0 0 658.06 315.87" className="terms-logo">
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
          </div>
          <span>회원가입 · 약관 및 동의</span>
        </div>

        <header className="terms-header">
          <div className="terms-title-row">
            <h1>{content.title}</h1>
            <span className="terms-badge">{type === 'marketing' ? '선택 동의' : '필수 동의'}</span>
          </div>
          <p className="terms-intro">
            {type === 'service'
              ? 'ARC 회원 서비스 이용에 관한 내용을 안내합니다.'
              : type === 'privacy'
                ? '회원가입 시 수집하는 개인정보와 이용 목적을 확인해 주세요.'
                : '신상품과 이벤트 소식을 이메일로 받아보실 수 있습니다.'}
          </p>
        </header>
        {type === 'service' ? (
          <>
            <div className="terms-content">
              {content.sections.map(([title, description], index) => (
                <section id={'clause-' + index} key={title}>
                  <h2>{title}</h2>
                  <p>{description}</p>
                </section>
              ))}
            </div>
          </>
        ) : (
          <div className="terms-table-wrap">
            <table className="terms-table">
              <caption>{content.title} 상세 안내</caption>
              <tbody>
                {content.sections.map(([title, description]) => (
                  <tr key={title}>
                    <th scope="row">{title}</th>
                    <td>{description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <footer className="terms-footer">
          <p>‘확인’은 약관 열람을 마치는 버튼이며, 동의 여부는 변경되지 않습니다.</p>
          <button type="button" className="terms-confirm" onClick={handleConfirm}>
            확인
          </button>
        </footer>
      </article>
    </main>
  );
}

export default TermsPage;
