# 모아몽 (moamong) — React Native 앱 가이드

소셜 가계부 앱. 지출/수입 기록, 카테고리 관리, 친구와 핫템(쇼핑 공유) 피드 기능을 제공한다.

---

## 기술 스택

| 항목 | 내용 |
|---|---|
| 프레임워크 | React Native + Expo (SDK 56) |
| 라우터 | Expo Router (파일 기반 라우팅) |
| 서버 상태 | TanStack Query (React Query) |
| 로컬 저장소 | AsyncStorage (세션 토큰 전용) |
| 아이콘 | lucide-react-native |
| 인증 | X-Auth-Token 헤더 (세션 기반) |

---

## 프로젝트 구조

```
moamong-rn/
├── app/                        # 화면 (Expo Router 파일 기반)
│   ├── _layout.tsx             # 루트 레이아웃 (QueryClient, GestureHandler, Toast)
│   ├── index.tsx               # 진입점 (토큰 확인 후 탭/로그인 분기)
│   ├── (auth)/
│   │   ├── login.tsx           # 카카오 로그인
│   │   └── onboarding.tsx      # 신규 유저 username 설정
│   ├── (tabs)/
│   │   ├── _layout.tsx         # 하단 탭바 (3탭)
│   │   ├── calendar.tsx        # [탭1] 캘린더 / 지출 내역
│   │   ├── feed.tsx            # [탭2] 핫템 피드 (홈)
│   │   └── my.tsx              # [탭3] 마이페이지
│   ├── add-expense.tsx         # 지출/수입 추가 모달
│   ├── edit-expense/[id].tsx   # 지출/수입 수정
│   ├── stats.tsx               # 통계 (도넛차트, 주별 그래프)
│   ├── rooms.tsx               # 방 관리 (생성/참가/탈퇴)
│   ├── share.tsx               # 핫템 공유 입력
│   ├── share-item.tsx          # 핫템 상세
│   ├── share-spending/[id].tsx # 지출 → 핫템 공유 연결
│   ├── category-management.tsx         # 소카테고리 관리
│   ├── category-add.tsx                # 소카테고리 추가
│   ├── category-edit.tsx               # 소카테고리 이름 수정
│   ├── category-group-management.tsx   # 대카테고리 목록
│   └── category-group-edit.tsx         # 대카테고리 색상/아이콘 수정
└── src/
    ├── lib/
    │   └── api.ts              # fetch 래퍼 (토큰 주입, 401 처리)
    ├── components/             # 공통 컴포넌트
    └── features/               # 도메인별 훅/타입/쿼리/뮤테이션
        ├── user/
        ├── spending/
        ├── feed/
        └── room/
```

---

## 탭 구성

### 탭1: calendar (캘린더)
- 월간 달력 + 날짜별 지출 목록
- FAB로 지출/수입 추가 (`add-expense.tsx`)
- 우측 상단 차트 아이콘 → `stats.tsx`
- 관련 스크린: `stats`, `add-expense`, `edit-expense/[id]`, `share-spending/[id]`

### 탭2: feed (홈)
- 친구 방의 핫템 공유 피드
- 방/카테고리 필터, 무한 스크롤
- 댓글, 이모지 리액션 (❤️, 🛍️ 등)
- FAB로 핫템 공유 (`share.tsx`)
- 관련 스크린: `share`, `share-item`

### 탭3: my (마이페이지)
- 프로필 (닉네임, @username)
- 방 관리 → `rooms.tsx`
- 카테고리 설정 → `category-group-management.tsx`, `category-management.tsx`
- 알림 토글, 로그아웃
- 관련 스크린: `rooms`, `category-*`

---

## API 클라이언트 (`src/lib/api.ts`)

```typescript
apiClient<T>(url: string, options?: RequestInit): Promise<T>
```

- Base URL: `EXPO_PUBLIC_API_URL` 환경변수 or `localhost:8080` (iOS) / `10.0.2.2:8080` (Android 에뮬레이터)
- 세션 토큰: AsyncStorage에 `X-Auth-Token` 키로 저장. 매 요청 헤더에 자동 주입
- 응답 헤더에 `X-Auth-Token`이 오면 자동 갱신
- 401 → AsyncStorage 토큰 삭제 후 `/(auth)/login`으로 강제 이동
- 5xx → "서버 오류" 에러 / 4xx → `body.message` 그대로 throw

---

## features 구조 패턴

각 feature는 `queries/`, `mutations/`, `hooks/`, `types.ts`, `keys.ts`로 구성된다.

```
features/user/
├── queries/
│   ├── useCurrentUser.ts       GET /api/users/me
│   ├── useUserCategories.ts    GET /api/users/me/categories
│   └── useCategoryGroups.ts    GET /api/users/me/category-groups
├── mutations/
│   ├── useCreateCategory.ts    POST /api/users/me/categories
│   ├── useUpdateCategory.ts    PATCH /api/users/me/categories/{id}  (name만)
│   ├── useDeleteCategory.ts    DELETE /api/users/me/categories/{id}
│   ├── useReorderCategories.ts PATCH /api/users/me/categories/order
│   ├── useUpdateCategoryGroup.ts    PATCH /api/users/me/category-groups/{groupKey}
│   ├── useReorderCategoryGroups.ts  PATCH /api/users/me/category-groups/order
│   ├── useUpdateNickname.ts
│   ├── useSetUsername.ts
│   ├── useLogout.ts
│   ├── useToggleNotification.ts
│   └── useRegisterPushToken.ts
├── hooks/
│   ├── useGroupSettings.ts     대카테고리 색상/아이콘 (서버 동기화)
│   └── usePushTokenRegister.ts
├── types.ts
└── keys.ts
```

---

## 카테고리 구조

**대카테고리 (CategoryGroup)** — 유저별 색상/아이콘/순서 커스텀 가능

| groupKey | 한글 | 타입 |
|---|---|---|
| FOOD | 식비 | 지출 |
| DAILY_GOODS | 생활용품 | 지출 |
| TRANSPORT | 교통 | 지출 |
| COMMUNICATION | 통신 | 지출 |
| UTILITY | 공과금 | 지출 |
| HOUSING | 주거 | 지출 |
| SOCIAL | 교제/경조사 | 지출 |
| LEISURE | 여가/취미 | 지출 |
| EDUCATION | 교육 | 지출 |
| HEALTH | 의료/건강 | 지출 |
| FASHION | 패션/뷰티 | 지출 |
| CAR | 자동차 | 지출 |
| TAX | 세금/보험 | 지출 |
| BIG_SPENDING | 대형지출 | 지출 |
| ETC | 기타 | 지출/수입 |
| EMPLOYMENT | 근로소득 | 수입 |
| BUSINESS | 사업/부업 | 수입 |
| INVESTMENT | 투자/재테크 | 수입 |

**소카테고리 (UserCategory)** — 유저가 직접 만드는 항목 (이름, 순서만 관리)
- 색상/아이콘은 부모 대카테고리에서 상속

**타입 정의 (`src/features/user/types.ts`)**
```typescript
interface UserCategoryGroup {
  groupKey: CategoryGroup;
  label: string;
  color: string;   // 유저 커스텀 (서버 저장)
  icon: string;    // Lucide 아이콘명, 유저 커스텀 (서버 저장)
  sortOrder: number;
}

interface UserCategory {
  id: number;
  name: string;
  type: string;           // "EXPENSE" | "INCOME"
  parentGroup: CategoryGroup;
  parentGroupLabel: string;
  sortOrder: number;
}
```

---

## useGroupSettings 훅

```typescript
const { getColor, getIcon, getLabel, updateGroup, groups } = useGroupSettings();
```

- 서버에서 대카테고리 목록을 fetch (`GET /api/users/me/category-groups`)
- `getColor(group)` / `getIcon(group)` / `getLabel(group)` — 서버값 우선, 없으면 기본값 fallback
- `updateGroup(group, color, icon)` — `PATCH /api/users/me/category-groups/{groupKey}` 호출
- **AsyncStorage 사용 안 함** (서버 동기화)

앱 전체에서 대카테고리 색상/아이콘이 필요한 모든 곳에서 이 훅을 사용한다:
- `DonutChart`, `DailyExpenseList`, `StatsCategoryTab`, `ExpenseFormFields`, `CategoryGroupManagementScreen`

---

## 지출 데이터 구조

```typescript
interface Spending {
  id: number;
  type: "EXPENSE" | "INCOME";
  categoryName: string;      // 소카테고리 이름 (스냅샷)
  categoryGroup: string;     // 대카테고리 groupKey (스냅샷)
  categoryGroupLabel: string;
  amount: number;
  date: string;
  memo: string | null;
  shared: boolean;
  createdAt: string;
}
```

- 지출 생성 시 `categoryId`만 보냄. 서버에서 카테고리명과 groupKey를 스냅샷으로 저장
- 이후 카테고리를 수정해도 과거 지출 기록은 변경되지 않음
- 색상/아이콘은 응답에 포함되지 않음 → 프론트에서 `categoryGroup`으로 `useGroupSettings`를 통해 파생

---

## 피드 (SharedItem) 구조

```typescript
interface FeedItem {
  sharedItemId: number;
  userId: number;
  senderUsername: string;
  title: string;
  url: string | null;
  imageUrl: string | null;
  review: string | null;      // 한마디 (서버 엔티티에는 memo로 저장)
  category: string;           // SharedItemCategory key (FASHION, SPORTS 등)
  amount: number;
  reactions: Reaction[];
  commentCount: number;
  viewCount: number;
  createdAt: string;
}
```

- 피드 카테고리는 `SYSTEM_CATEGORIES` (`src/features/feed/types.ts`) — UserCategory와 별개
- 커서 기반 페이지네이션: `{ content, hasNext, nextCursor }`

---

## 코드 스타일 규칙

### React Query 패턴
- 모든 서버 상태는 React Query로 관리
- `queryKey`는 `features/*/keys.ts`에 중앙화
- mutation 성공 시 관련 queryKey `invalidateQueries`
- `staleTime`은 명시적으로 설정하지 않으면 기본값(0) 사용

### 컴포넌트 스타일
- `StyleSheet.create()` 사용 (인라인 스타일 최소화)
- 색상: `#191f28` (텍스트), `#3182f6` (primary), `#f2f4f6` (배경), `#adb5bd` (비활성)
- 폰트: `fontWeight: "700"` (헤더/강조), `"600"` (일반 강조), `"500"` (본문)
- 버튼 비활성화: `opacity: 0.3`
- pressed 상태: `pressed && { opacity: 0.8 }` 또는 `{ opacity: 0.5 }`

### 네비게이션
- `router.push()` — 스택 푸시
- `router.replace()` — 현재 화면 교체 (로그인 후 등)
- `router.back()` — 뒤로 가기
- 동적 파라미터: `useLocalSearchParams<{ id: string }>()`

### SafeArea
- 탭 화면: `SafeAreaView edges={["top"]}`
- 모달/스택 화면: `useSafeAreaInsets()` 후 `paddingTop: insets.top + N`

### 에러 처리
- Toast로 에러 메시지 표시 (전역 Toast 컴포넌트)
- mutation의 `onError`에서 `showToast(e.message)` 패턴

---

## 백엔드 연동

- 백엔드: Spring Boot (`buddi-api/`)
- 인증: 카카오 OAuth2 → 서버 세션 → `X-Auth-Token` 헤더
- 세션 유효기간: 7일
- 로컬 개발: `http://localhost:8080` (iOS) / `http://10.0.2.2:8080` (Android 에뮬레이터)
- 환경변수: `EXPO_PUBLIC_API_URL`로 오버라이드 가능

백엔드 API 명세는 `buddi-api/API_SPEC.md` 참고.
