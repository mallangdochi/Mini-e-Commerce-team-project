# ARC

## 1. 프로젝트 소개

- **서비스명**: ARC
- **판매 상품 분야**: 스포츠의류
- **주요 사용자**: 운동을 하는 성인 여성
- **핵심 콘셉트 / 차별화 포인트**: 사용자 UX 데이터에 기반한 기능 구현

## 2. 팀원과 역할

| 이름          | 담당                       | 주요 구현 기능                                               |
| ------------- | -------------------------- | ------------------------------------------------------------ |
| 정종범 (팀장) | 작업 총괄 및 프로젝트 기획 | 상품페이지, 상세페이지 제작(메인), 디자인 및 에셋 편집       |
| 김태은        | 서브 PM, 디자인            | 핵심 기능 개발(메인 작업), API 연동 및 전체 이미지 에셋 편집 |
| 이혜란        | 디자인                     | 메인페이지(HOME) 기능개발, 전체 반응형                       |
| 박근영        | 로그인/회원가입            | 오류 페이지, 회의록 작성, 상품 사진 편집                     |
| 손도현        | 장바구니/결제페이지        | 결제완료 페이지 제작, 상품 사진 생성 및 편집                 |

## 3. 주요 기능

### 필수 기능

- [x] 회원가입 / 로그인 / 인증 상태 유지 / 로그아웃
- [x] 메인 페이지 (배너, 카테고리, 상품 섹션)
- [x] 상품 목록 (카테고리 필터, 검색, 정렬)
- [x] 상품 상세 (수량 선택, 재고 표시, 장바구니 담기)
- [x] 장바구니 (수량 변경, 삭제, 금액 계산)
- [x] 결제 (mock 흐름, 재고 차감)
- [x] 주문 완료 / 주문내역
- [x] 404 페이지

### 선택 기능 (조건부, 여유 시 구현)

- [ ] 최근 본 상품
- [ ] AI 상품 요약 (Gemini API)
- [x] 찜 목록

### 공통 적용

- [x] 로딩 / 오류 / 빈 상태 처리
- [x] 반응형 (Mobile / Tablet / PC / Wide PC)
- [ ] 다크 모드
- [x] Skeleton UI
- [ ] 접근성 (alt, label, 키보드 접근, 색상 외 상태 구분) — 일부 컴포넌트에만 aria-label 적용, 전체 점검 필요

## 4. 기술 스택

| 분류        | 스택                           |
| ----------- | ------------------------------ |
| Core        | React, Vite                    |
| Routing     | React Router                   |
| State       | Zustand                        |
| Styling     | Tailwind CSS 4, 컴포넌트별 CSS |
| HTTP        | Axios                          |
| Lint/Format | ESLint, Prettier               |
| CI          | GitHub Actions                 |
| 협업        | Git, GitHub (PR 기반 워크플로) |

## 5. 프로젝트 파일 구조

폴더는 **파일 타입(역할) 기준**으로 구성되어 있습니다.

```
project-root/
├─ public/
│  └─ main_video_1~3.mp4          메인 배너용 영상
│
├─ src/
│  ├─ api/                        axios 클라이언트 + 도메인별 API 함수
│  │                               (authApi, homeApi, orders, products, wishlist, alert)
│  ├─ assets/home/                홈/히어로 이미지 에셋
│  ├─ components/
│  │  ├─ auth/
│  │  ├─ common/
│  │  ├─ home/                    Hero, BestSellerSection, TrendingSection,
│  │  │                            BrandStorySection, FeaturedLookSection,
│  │  │                            NewsletterSection, CustomCarousel, BannerCarousel
│  │  ├─ layout/                  Header, Footer
│  │  ├─ mypage/                  마이페이지 하위 화면
│  │  └─ product/                 ProductList 등
│  ├─ hooks/                      useCartSync, useOrders, useWishlist
│  ├─ pages/                      라우트에 매핑되는 최상위 페이지 컴포넌트
│  ├─ routes/AppRouter.jsx
│  ├─ store/                      zustand 스토어 (auth, cart, wishlist)
│  ├─ styles/                     컴포넌트별 CSS 파일
│  ├─ utils/storage.js
│  ├─ App.jsx
│  └─ main.jsx
│
├─ .gitignore
├─ package.json
└─ README.md
```

## 6. 실행 방법

```bash
# 저장소 클론
git clone <repository-url>
cd <project-folder>

# 패키지 설치
npm install

# 환경 변수 설정 (7번 항목 참고)
# .env 파일을 프로젝트 루트에 직접 생성

# 개발 서버 실행
npm run dev

# 빌드
npm run build
```

<!-- [ ] 배포 URL 추가 -->

**배포 링크**: (추후 추가)

## 7. 환경 변수 안내

프로젝트 루트에 `.env` 파일을 만들고 값을 채워주세요.

| 변수명                | 설명                              | 필수 여부 |
| --------------------- | --------------------------------- | --------- |
| `VITE_API_BASE_URL`   | Mock API 서버 base URL            | 필수      |
| `VITE_GEMINI_API_KEY` | AI 상품 요약 기능용 (조건부 기능) | 선택      |

API 키 등 민감 정보는 절대 코드에 직접 작성하지 않으며, `.env`는 `.gitignore`에 포함되어 저장소에 커밋되지 않습니다.

## 8. API 사용 방법

- **Base URL**: `{VITE_API_BASE_URL}`
- **인증 방식**: 로그인 시 발급되는 토큰을 `Authorization: Bearer <token>` 헤더에 포함 (`src/api/client.js` 인터셉터에서 자동 첨부)

**주요 엔드포인트**

| Method | Endpoint                  | 설명                                           | 인증 필요 |
| ------ | ------------------------- | ---------------------------------------------- | --------- |
| GET    | `/main`                   | 메인 페이지 데이터 (배너/베스트셀러/트렌딩 등) | X         |
| GET    | `/categories`             | 카테고리 목록                                  | X         |
| GET    | `/products`               | 상품 목록 조회 (검색/정렬/필터/페이지네이션)   | X         |
| GET    | `/products/filters`       | 상품 필터 옵션 조회                            | X         |
| GET    | `/products/:id`           | 상품 상세 조회                                 | X         |
| GET    | `/search`                 | 상품 검색                                      | X         |
| GET    | `/sets`                   | 코디 세트 조회                                 | X         |
| POST   | `/auth/signup`            | 회원가입                                       | X         |
| GET    | `/auth/check-id`          | 아이디 중복 확인                               | X         |
| POST   | `/auth/login`             | 로그인                                         | X         |
| GET    | `/auth/me`                | 로그인 사용자 정보 조회                        | O         |
| GET    | `/wishlist`               | 찜 목록 조회                                   | O         |
| POST   | `/wishlist`               | 찜 추가/삭제                                   | O         |
| POST   | `/orders`                 | 주문 생성 (mock 결제)                          | O         |
| GET    | `/orders`                 | 주문 목록 조회                                 | O         |
| GET    | `/orders/:orderId`        | 주문 상세 조회                                 | O         |
| PATCH  | `/orders/:orderId/cancel` | 주문 취소                                      | O         |

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

### 문제 1: 검색창 디바운스와 한글(IME) 조합 입력 충돌

- **상황**: 상품 검색 입력창에 디바운스를 걸었더니, 한글을 입력할 때 자모가 조합되는 매 순간(`onChange`)마다 디바운스가 계속 재시작되면서 의도한 타이밍에 검색이 안 되는 문제가 있었다.
- **원인**: 브라우저가 한글 같은 조합형 문자를 입력할 때 완성되지 않은 글자 상태에서도 `onChange`를 계속 발생시키기 때문.
- **해결**: 처음에는 `compositionstart`/`compositionend` 이벤트로 조합 중 여부(`isSearchComposing`)를 추적해서, 조합 중에는 디바운스를 걸지 않고 조합이 끝나는 시점에만 검색을 동기화하도록 구현했다. 이후 로직을 단순화하면서 조합 감지 로직은 걷어내고, 디바운스 지연시간을 700ms로 조정해 타이핑 중 API가 과도하게 호출되지 않도록 대응했다.

### 문제 2: 이미지 호스팅 해상도 저하

- **상황**: 초기에 ibb(imgbb)로 이미지를 호스팅했는데, 실제 서비스에 노출되는 이미지 해상도가 낮아지는 문제가 있었다.
- **원인**: ibb가 이미지를 자체적으로 리사이징/압축해서 제공하는 방식이라 원본 해상도를 그대로 유지하기 어려웠다.
- **해결**: 이미지킷(ImageKit)으로 호스팅을 이전해서 원본 해상도를 유지하면서도 CDN을 통한 최적화 전송이 가능하도록 변경했다.

## 11. 프로젝트 회고

### 잘한 점

- 모바일/태블릿 전용 레이아웃으로 분리해서 반응형 가독성을 확보했다.
- 실제 API로 데이터를 검증하면서 작업하는 방식 자체가 실무 흐름과 비슷했고, 추후 마이그레이션을 통해 실무 활용 가능성도 꽤 높다고 본다.

### 아쉬운 점 / 개선하고 싶은 부분

- 미디어쿼리에서 요소를 재정의할 때 관련 속성을 통째로 안 챙겨서, 같은 CSS 버그(`top` 값이 특정 breakpoint에만 새어나오는 문제)가 여러 번 반복됐다. 다음엔 속성을 일괄 리셋하는 습관을 들이고 싶다.
- 디자인 토큰이 정리되어 있지 않아 색상·간격 값이 컴포넌트 CSS 파일마다 하드코딩돼 있다. 컴포넌트가 늘어나기 전에 Tailwind `@theme` 기반으로 한 번 정리가 필요하다.
- 히어로 이미지처럼 시안·에셋이 완전히 준비되기 전에 먼저 구현부터 진행하다 보니, 나중에 실제 에셋으로 교체하면서 다시 맞추는 작업이 반복됐다. 이미지 교체 대기 같은 외부 의존성 때문에 일부 작업은 아직 완전히 끝난 상태가 아니다.
