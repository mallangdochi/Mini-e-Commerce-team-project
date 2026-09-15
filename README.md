# ARC

## 1. 프로젝트 소개

- **서비스명**: ARC
- **판매 상품 분야**: 스포츠의류
- **주요 사용자**: 운동을 하는 성인 남성/여성
- **핵심 콘셉트 / 차별화 포인트**: 사용자 UX 데이터에 기반한 기능 구현

## 2. 팀원과 역할

| 이름 | 담당 | 주요 구현 기능                                                         |
| ---- | ---- | ---------------------------------------------------------------------- |
| A    |      | 공통 컴포넌트, 메인페이지                                              |
| B    |      | 공통 레이아웃, 메인페이지                                              |
| C    |      | 인증 (회원가입, 로그인, 인증 상태 유지)                                |
| D    |      | 장바구니/결제 (장바구니, 결제 mock, 재고, 주문완료)                    |
| E    |      | 상품 (상품목록/상세, 검색·정렬·필터, 찜(조건부), 최근 본 상품/AI 요약) |

<!-- [ ] 이름 칸에 실명 또는 GitHub 아이디로 교체하세요 -->

## 3. 주요 기능

### 필수 기능

- [ ] 회원가입 / 로그인 / 인증 상태 유지 / 로그아웃
- [ ] 메인 페이지 (배너, 카테고리, 상품 섹션)
- [ ] 상품 목록 (카테고리 필터, 검색, 정렬)
- [ ] 상품 상세 (수량 선택, 재고 표시, 장바구니 담기)
- [ ] 장바구니 (수량 변경, 삭제, 금액 계산)
- [ ] 결제 (mock 흐름, 재고 차감)
- [ ] 주문 완료 / 주문내역
- [ ] 404 페이지

### 선택 기능 (조건부, 여유 시 구현)

- [ ] 최근 본 상품
- [ ] AI 상품 요약 (Gemini API)
- [ ] 찜 목록

### 공통 적용

- [ ] 로딩 / 오류 / 빈 상태 처리
- [ ] 반응형 (Mobile / Tablet / PC / Wide PC)
- [ ] 다크 모드
- [ ] Skeleton UI
- [ ] 접근성 (alt, label, 키보드 접근, 색상 외 상태 구분)

## 4. 기술 스택

| 분류        | 스택                                            |
| ----------- | ----------------------------------------------- |
| Core        | React, Vite                                     |
| Routing     | React Router                                    |
| State       | Zustand                                         |
| Styling     | Tailwind CSS                                    |
| HTTP        | <!-- [ ] Fetch API / Axios 중 확정되면 작성 --> |
| Lint/Format | ESLint, Prettier                                |
| CI          | GitHub Actions                                  |
| 협업        | Git, GitHub (PR 기반 워크플로)                  |

<!-- [ ] 테스트 도구 도입 시 추가: Vitest 등 -->

## 5. 프로젝트 파일 구조

폴더는 **기능(도메인) 기준**으로 구성했습니다. `pages/`, `components/`, `api/`처럼 파일 타입별로 나누지 않고 담당 영역별로 묶어 **폴더 = 담당자**가 되도록 설계했습니다.

```
project-root/
├─ public/
│  └─ images/fallback-product.webp
│
├─ src/
│  ├─ common/                      (A, B)
│  │  ├─ components/               Button, LoadingSpinner, ErrorMessage, Skeleton
│  │  ├─ layout/                   Header, Footer, Layout
│  │  └─ pages/                    HomePage, NotFoundPage
│  │
│  ├─ features/
│  │  ├─ auth/                     (C) 회원가입/로그인
│  │  ├─ product/                  (E) 상품목록/상세
│  │  └─ order/                    (D) 장바구니/결제/주문
│  │
│  ├─ routes/AppRouter.jsx         (A, B)
│  ├─ constants/
│  ├─ utils/
│  ├─ styles/globals.css
│  ├─ App.jsx
│  └─ main.jsx
│
├─ .env.example
├─ .gitignore
├─ package.json
└─ README.md
```

자세한 설계 배경은 `프로젝트 구조 및 협업 명세` 문서를 참고하세요.

## 6. 실행 방법

```bash
# 저장소 클론
git clone <repository-url>
cd <project-folder>

# 패키지 설치
npm install

# 환경 변수 설정 (7번 항목 참고)
cp .env.example .env

# 개발 서버 실행
npm run dev

# 빌드
npm run build
```

<!-- [ ] 배포 URL 추가 -->

**배포 링크**: (추후 추가)

## 7. 환경 변수 안내

`.env.example`을 복사해 `.env`를 만들고 값을 채워주세요.

| 변수명                | 설명                              | 필수 여부 |
| --------------------- | --------------------------------- | --------- |
| `VITE_API_BASE_URL`   | Mock API 서버 base URL            | 필수      |
| `VITE_GEMINI_API_KEY` | AI 상품 요약 기능용 (조건부 기능) | 선택      |

API 키 등 민감 정보는 절대 코드에 직접 작성하지 않으며, `.env`는 `.gitignore`에 포함되어 저장소에 커밋되지 않습니다.

## 8. API 사용 방법

<!-- [ ] 3단계 API 명세 작성 완료 후 이 섹션을 채우세요 -->

- **Base URL**: `{VITE_API_BASE_URL}`
- **인증 방식**: <!-- 예: Bearer Token, 헤더에 Authorization 포함 -->

**주요 엔드포인트 요약**

| Method | Endpoint           | 설명                                         | 인증 필요 |
| ------ | ------------------ | -------------------------------------------- | --------- |
| GET    | `/products`        | 상품 목록 조회 (검색/정렬/필터/페이지네이션) | X         |
| GET    | `/products/:id`    | 상품 상세 조회                               | X         |
| POST   | `/auth/signup`     | 회원가입                                     | X         |
| POST   | `/auth/login`      | 로그인                                       | X         |
| POST   | `/orders`          | 주문 생성 (mock 결제)                        | O         |
| GET    | `/orders/:orderId` | 주문 상세 조회                               | O         |

전체 API 명세는 별도 문서(Notion/Swagger 등 링크)를 참고하세요. <!-- [ ] 링크 추가 -->

## 9. 주요 화면

<!-- [ ] 각 화면 스크린샷 또는 GIF 삽입 -->

| 화면            | 스크린샷 |
| --------------- | -------- |
| 메인 페이지     |          |
| 상품 목록       |          |
| 상품 상세       |          |
| 장바구니        |          |
| 결제 / 주문완료 |          |

## 10. 트러블슈팅

<!-- [ ] 개발 중 겪은 문제와 해결 과정을 진행하면서 누적 작성하세요 -->

### 문제 1: (제목)

- **상황**:
- **원인**:
- **해결**:

## 11. 프로젝트 회고

<!-- [ ] 마무리 단계에서 작성 -->

### 잘한 점

### 아쉬운 점 / 개선하고 싶은 부분
