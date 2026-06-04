# 모아몽 API 명세서

## 공통

**Base URL:** `http://localhost:8080`

**인증 방식:** 로그인 성공 시 서버가 `X-Auth-Token` 헤더로 세션 토큰을 발급합니다. 이후 모든 API 요청 헤더에 포함해야 합니다.

| 헤더 | 설명 |
|---|---|
| `X-Auth-Token` | 로그인 후 발급된 세션 토큰 |

세션 유효기간: **7일**

**Content-Type:** `application/json`

---

**공통 에러 코드**

| 상태코드 | 의미 |
|---|---|
| `400` | 잘못된 요청 (값 누락, 형식 오류, 유효성 검증 실패) |
| `401` | 미인증 (토큰 없음 또는 만료) |
| `403` | 권한 없음 |
| `404` | 리소스 없음 |
| `409` | 중복 (이미 존재) |

---

## 인증

### 카카오 로그인
```
GET /oauth2/authorization/kakao
```
카카오 로그인 페이지로 리다이렉트합니다.

**로그인 성공 흐름**
1. 카카오 인증 완료
2. 서버가 응답 헤더에 `X-Auth-Token: xxx` 포함
3. 프론트 콜백 페이지로 리다이렉트

```
http://localhost:5173/callback?newUser=true
```

| 파라미터 | 설명 |
|---|---|
| `newUser` | `true` - 신규 유저 (username 설정 필요) / `false` - 기존 유저 |

---

## 유저

### 내 정보 조회
```
GET /api/users/me
```

**Response**
```json
{
  "id": 1,
  "nickname": "홍길동",
  "username": "gildong",
  "isNotificationEnabled": true
}
```

---

### 닉네임 수정
```
PATCH /api/users/me
```

**Request**
```json
{
  "nickname": "새닉네임"
}
```
- 1~20자

**Response:** `200 OK`

---

### username 설정
```
POST /api/users/username
```

**Request**
```json
{
  "username": "gildong"
}
```
- 영문/숫자/언더스코어, 3~20자

**Response:** `200 OK`

**에러**

| 상태코드 | 조건 |
|---|---|
| `409` | 이미 사용 중인 username |

---

### username 중복 확인
```
GET /api/users/username/check?username={username}
```

**Response**
```json
{
  "available": true
}
```

---

### FCM 토큰 등록
```
PUT /api/users/fcm-token
```

**Request**
```json
{
  "token": "fcm_device_token_string"
}
```

**Response:** `200 OK`

앱 실행 시마다 최신 토큰으로 갱신해야 합니다.

---

### 알림 설정 변경
```
PATCH /api/users/me/notifications
```

**Request**
```json
{
  "enabled": true
}
```

**Response:** `200 OK`

---

### 로그아웃
```
POST /api/users/logout
```

FCM 토큰 삭제 + 세션 파기

**Response:** `200 OK`

---

### 회원 탈퇴
```
DELETE /api/users/me
```

**Response:** `204 No Content`

---

## 카테고리

> **구조**: `대카테고리(CategoryGroup)` → `소카테고리(Category)` 두 단계 계층.
> 색상·아이콘·순서는 대카테고리 단위로 관리. 소카테고리는 이름과 순서만 관리.

---

### 대카테고리 목록 조회
```
GET /api/users/me/category-groups
```

**Response**
```json
[
  {
    "groupKey": "FOOD",
    "label": "식비",
    "color": "#F97316",
    "icon": "Utensils",
    "sortOrder": 0
  },
  {
    "groupKey": "TRANSPORT",
    "label": "교통",
    "color": "#3B82F6",
    "icon": "Train",
    "sortOrder": 1
  }
]
```
- `sortOrder` 오름차순 정렬
- `color`, `icon`은 유저가 직접 수정 가능

---

### 대카테고리 색상/아이콘 수정
```
PATCH /api/users/me/category-groups/{groupKey}
```

**Request**
```json
{
  "color": "#FF0000",
  "icon": "Utensils"
}
```
- `color`: `#RRGGBB` 형식 필수
- `icon`: 빈 값 불가

**Response**
```json
{
  "groupKey": "FOOD",
  "label": "식비",
  "color": "#FF0000",
  "icon": "Utensils",
  "sortOrder": 0
}
```

**에러**

| 상태코드 | 조건 |
|---|---|
| `400` | color 형식 오류, icon 빈 값 |
| `404` | 해당 groupKey 없음 |

---

### 대카테고리 순서 변경
```
PATCH /api/users/me/category-groups/order
```

**Request**
```json
{
  "orderedKeys": ["TRANSPORT", "FOOD", "LEISURE"]
}
```
- 배열 내 위치(index)가 새 `sortOrder`가 됩니다.
- 목록에 포함되지 않은 그룹은 순서가 변경되지 않습니다.

**Response:** `200 OK`

---

### 소카테고리 목록 조회
```
GET /api/users/me/categories?type={type}
```

| 파라미터 | 필수 | 설명 |
|---|---|---|
| `type` | 선택 | `EXPENSE` 또는 `INCOME`. 생략 시 전체 반환 |

**Response**
```json
[
  {
    "id": 1,
    "name": "식사",
    "type": "EXPENSE",
    "parentGroup": "FOOD",
    "parentGroupLabel": "식비",
    "sortOrder": 0
  },
  {
    "id": 2,
    "name": "대중교통",
    "type": "EXPENSE",
    "parentGroup": "TRANSPORT",
    "parentGroupLabel": "교통",
    "sortOrder": 0
  }
]
```
- `sortOrder` 오름차순 정렬
- 색상·아이콘은 `parentGroup`으로 대카테고리 조회 후 참조

---

### 소카테고리 추가
```
POST /api/users/me/categories
```

**Request**
```json
{
  "name": "구독",
  "type": "EXPENSE",
  "parentGroup": "COMMUNICATION"
}
```
- `name`: 1~10자, 필수
- `type`: `EXPENSE` 또는 `INCOME`
- `parentGroup`: 대카테고리 groupKey

**Response**
```json
{
  "id": 12,
  "name": "구독",
  "type": "EXPENSE",
  "parentGroup": "COMMUNICATION",
  "parentGroupLabel": "통신",
  "sortOrder": 2
}
```

**에러**

| 상태코드 | 조건 |
|---|---|
| `400` | name 공백 또는 10자 초과 |
| `404` | 해당 parentGroup 없음 |
| `409` | 같은 대카테고리 내 동일 이름+타입 이미 존재 |

---

### 소카테고리 이름 수정
```
PATCH /api/users/me/categories/{categoryId}
```

**Request**
```json
{
  "name": "OTT 구독"
}
```

**Response**
```json
{
  "id": 12,
  "name": "OTT 구독",
  "type": "EXPENSE",
  "parentGroup": "COMMUNICATION",
  "parentGroupLabel": "통신",
  "sortOrder": 2
}
```

**에러**

| 상태코드 | 조건 |
|---|---|
| `400` | name 공백 또는 10자 초과 |
| `404` | 해당 카테고리 없음 |
| `409` | 같은 대카테고리 내 동일 이름+타입 이미 존재 |

---

### 소카테고리 순서 변경
```
PATCH /api/users/me/categories/order
```

**Request**
```json
{
  "orderedIds": [3, 1, 2, 4]
}
```
- 배열 내 위치(index)가 새 `sortOrder`가 됩니다.
- 목록에 포함되지 않은 카테고리는 순서가 변경되지 않습니다.

**Response:** `200 OK`

---

### 소카테고리 삭제
```
DELETE /api/users/me/categories/{categoryId}
```

**Response:** `204 No Content`

**에러**

| 상태코드 | 조건 |
|---|---|
| `404` | 해당 카테고리 없음 |

---

## 지출

### 지출 기록
```
POST /api/spendings
```

**Request**
```json
{
  "type": "EXPENSE",
  "categoryId": 1,
  "categoryGroupKey": null,
  "amount": 12000,
  "date": "2026-05-19",
  "memo": "점심"
}
```
- `type`: `EXPENSE`(지출) 또는 `INCOME`(수입)
- `categoryId`: 소카테고리 ID. **선택** — 소카테고리를 선택한 경우 사용
- `categoryGroupKey`: 대카테고리 key. `categoryId`가 null일 때 **필수** (예: `"FOOD"`)
- `categoryId`와 `categoryGroupKey` 중 하나는 반드시 있어야 함
- `memo`: 선택 (null 가능)

**Response**
```json
{
  "id": 42,
  "type": "EXPENSE",
  "categoryName": "점심",
  "categoryGroup": "FOOD",
  "categoryGroupLabel": "식비",
  "amount": 12000,
  "date": "2026-05-19",
  "createdAt": "2026-05-19T14:30:00"
}
```

---

### 월별 지출 조회
```
GET /api/spendings?year={year}&month={month}
```

**Response**
```json
[
  {
    "id": 42,
    "type": "EXPENSE",
    "categoryName": "점심",
    "categoryGroup": "FOOD",
    "categoryGroupLabel": "식비",
    "amount": 12000,
    "date": "2026-05-19",
    "memo": "편의점 점심",
    "shared": false,
    "createdAt": "2026-05-19T14:30:00"
  }
]
```
- `shared`: 이 지출이 방에 공유된 적 있으면 `true`
- `categoryGroup`: 분류 key (색상/아이콘은 클라이언트에서 분류 기준으로 표시)

---

### 지출 수정
```
PATCH /api/spendings/{id}
```

**Request** (지출 기록과 동일한 구조)
```json
{
  "type": "EXPENSE",
  "categoryId": 3,
  "categoryGroupKey": null,
  "amount": 35000,
  "date": "2026-05-19",
  "memo": "옷 구매"
}
```

**Response:** 수정된 지출 객체 (지출 기록 Response와 동일)

---

### 지출 삭제
```
DELETE /api/spendings/{id}
```

**Response:** `204 No Content`

---

### 공유 아이템 등록 (자동)
```
POST /api/spendings/{id}/shared-item
```

서버가 URL에서 OG 메타데이터(제목, 이미지)를 자동으로 추출합니다.

**Request**
```json
{
  "url": "https://example.com/product/123",
  "review": "진짜 강추",
  "category": "FASHION",
  "roomIds": [1, 2],
  "isPublic": false
}
```
- `category`: 필수. `GET /api/shared-items/categories` 참고
- `review`: 선택 (null 가능)
- `isPublic`: `true`면 전체 공개 피드에도 노출. 기본값 `false`
- `roomIds`: 공유할 방 ID 목록. 필수, 비어있으면 `400`

**Response**
```json
{
  "sharedItemId": 1,
  "url": "https://example.com/product/123",
  "title": "코카콜라 제로 355ml",
  "imageUrl": "https://example.com/image.jpg",
  "review": "진짜 강추",
  "category": "FASHION"
}
```

**에러**

| 상태코드 | 조건 | 메시지 |
|---|---|---|
| `400` | URL에서 제목 자동 추출 불가 | `"친구들에게 보여줄 제목을 입력해 주세요."` |

> `400` 응답 수신 시 프론트에서 제목 입력 UI를 표시하고 `/shared-item/manual`을 호출하세요.

---

### 공유 아이템 등록 (수동)
```
POST /api/spendings/{id}/shared-item/manual
```

**Request**
```json
{
  "url": "https://example.com/product/123",
  "title": "코카콜라 제로 355ml",
  "imageUrl": "https://example.com/image.jpg",
  "review": "진짜 강추",
  "category": "FASHION",
  "roomIds": [1, 2],
  "isPublic": false
}
```

**Response:** 공유 아이템 등록(자동) Response와 동일

---

## 피드

### 공유 카테고리 목록 조회
```
GET /api/shared-items/categories
```

**Response**
```json
[
  { "key": "FASHION",     "name": "패션/의류",   "emoji": "👗", "color": "#E11D48" },
  { "key": "BEAUTY",      "name": "뷰티/헬스",   "emoji": "💄", "color": "#EC4899" },
  { "key": "FOOD",        "name": "식품/음료",   "emoji": "🍔", "color": "#F97316" },
  { "key": "ELECTRONICS", "name": "가전/디지털", "emoji": "💻", "color": "#3B82F6" },
  { "key": "SPORTS",      "name": "스포츠/레저", "emoji": "⚽", "color": "#10B981" },
  { "key": "HOME",        "name": "홈/리빙",     "emoji": "🏠", "color": "#F59E0B" },
  { "key": "ETC",         "name": "기타",        "emoji": "📦", "color": "#6B7280" }
]
```

---

### 방 피드 조회 (커서 기반 페이지네이션)
```
GET /api/shared-items?roomId={roomId}&size={size}&cursor={cursor}
```

| 파라미터 | 필수 | 설명 |
|---|---|---|
| `roomId` | 필수 | 조회할 방 ID |
| `size` | 선택 | 페이지 크기 (기본값 `20`) |
| `cursor` | 선택 | 이전 페이지의 `nextCursor` 값. 생략 시 최신 피드부터 조회 |

**Response**
```json
{
  "content": [
    {
      "sharedItemId": 5,
      "senderUsername": "쇼핑왕민준",
      "amount": 132000,
      "url": "https://musinsa.com/products/aaa111",
      "title": "무신사 베스트 아이템",
      "imageUrl": "https://musinsa.com/image.jpg",
      "review": "이거 진짜 핵인싸템",
      "category": "FASHION",
      "createdAt": "2026-05-19T14:30:00",
      "reactions": [
        { "emoji": "❤️", "count": 3, "reacted": true }
      ],
      "commentCount": 2,
      "viewCount": 17
    }
  ],
  "hasNext": true,
  "nextCursor": 4
}
```
- `content`: 피드 아이템 목록 (최신순, ID 내림차순)
- `hasNext`: 다음 페이지 존재 여부
- `nextCursor`: 다음 페이지 요청 시 `cursor` 파라미터로 사용. 마지막 페이지면 `null`
- `senderUsername`: 공유자의 닉네임
- `review`: 공유 시 작성한 한마디 (null 가능)
- `viewCount`: 조회수

---

### 전체 공개 피드 조회
```
GET /api/shared-items/public
```

`isPublic=true`로 공유된 아이템 전체 목록. 최신순 정렬. 페이지네이션 없음.

**Response:** 방 피드 `content` 배열과 동일한 형태의 배열

---

### 리액션 토글
```
POST /api/shared-items/{sharedItemId}/reactions
```

**Request**
```json
{ "emoji": "❤️" }
```
- 허용 이모지: `❤️`, `🛍️`

**Response:** 해당 아이템의 전체 리액션 목록
```json
[
  { "emoji": "❤️", "count": 2, "reacted": false },
  { "emoji": "🛍️", "count": 1, "reacted": true }
]
```

**에러**

| 상태코드 | 조건 |
|---|---|
| `400` | 허용되지 않는 이모지 |

---

### 댓글 목록
```
GET /api/shared-items/{sharedItemId}/comments
```

**Response**
```json
[
  {
    "id": 1,
    "username": "건강러지수",
    "content": "나도 샀어!",
    "createdAt": "2026-05-19T15:00:00"
  }
]
```

---

### 댓글 작성
```
POST /api/shared-items/{sharedItemId}/comments
```

**Request**
```json
{
  "content": "나도 샀어!"
}
```

**Response:** 작성된 댓글 객체 (댓글 목록의 단일 항목과 동일)

---

### 조회수 기록
```
POST /api/shared-items/{sharedItemId}/view
```

피드 아이템 상세 진입 시 호출합니다.

**Response:** `200 OK`

---

## 방

### 내 방 목록
```
GET /api/rooms
```

**Response**
```json
[
  {
    "id": 1,
    "name": "테스트방",
    "inviteCode": "AB12CD34",
    "createdBy": 1,
    "isSystem": false,
    "unreadCount": 3
  }
]
```
- `isSystem`: 시스템 공용 방이면 `true`
- `unreadCount`: 마지막 읽음 이후 새로 공유된 아이템 수

---

### 방 만들기
```
POST /api/rooms
```

**Request**
```json
{ "name": "우리 방" }
```

**Response:** 생성된 방 객체

---

### 방 참여
```
POST /api/rooms/join
```

**Request**
```json
{ "inviteCode": "AB12CD34" }
```

**Response:** 참여한 방 객체

**에러**

| 상태코드 | 조건 |
|---|---|
| `409` | 이미 참여 중인 방 |

---

### 방 멤버 목록
```
GET /api/rooms/{roomId}/members
```

**Response**
```json
[
  { "userId": 1, "nickname": "홍길동", "role": "OWNER" }
]
```

---

### 방 나가기
```
DELETE /api/rooms/{roomId}/leave
```

**Response:** `204 No Content`

**에러**

| 상태코드 | 조건 |
|---|---|
| `400` | 방장은 나갈 수 없음 |

---

### 멤버 내보내기 (방장 전용)
```
DELETE /api/rooms/{roomId}/members/{targetUserId}
```

**Response:** `204 No Content`

---

### 방 읽음 처리
```
POST /api/rooms/{roomId}/read
```

**Response:** `204 No Content`

---

## 정기 지출

매달 특정 날짜에 반복되는 지출/수입 템플릿. 실제 Spending 레코드를 생성하지 않고, 월별 조회 시 가상으로 합쳐서 반환됩니다.

> 월별 지출 조회(`GET /api/spendings`) 응답에 `recurring: true` 항목으로 포함됩니다.

---

### 정기 지출 생성
```
POST /api/recurring-spendings
```

**Request**
```json
{
  "type": "EXPENSE",
  "categoryId": null,
  "categoryGroupKey": "HOUSING",
  "amount": 800000,
  "dayOfMonth": 25,
  "startDate": "2024-01-25",
  "endDate": null,
  "memo": "월세"
}
```
- `type`: `EXPENSE`(지출) 또는 `INCOME`(수입)
- `categoryId`: 소카테고리 ID (선택)
- `categoryGroupKey`: 대카테고리 key. `categoryId`가 null일 때 **필수**
- `dayOfMonth`: 매월 반복 날짜. **1~28**만 허용
- `startDate`: 반복 시작일 (필수)
- `endDate`: 반복 종료일 (선택, null이면 무기한)
- `memo`: 선택

**Response**
```json
{
  "id": 1,
  "type": "EXPENSE",
  "categoryName": "주거",
  "categoryGroup": "HOUSING",
  "categoryGroupLabel": "주거/통신",
  "amount": 800000,
  "dayOfMonth": 25,
  "startDate": "2024-01-25",
  "endDate": null,
  "memo": "월세",
  "createdAt": "2026-06-04T10:00:00"
}
```

---

### 정기 지출 목록 조회
```
GET /api/recurring-spendings
```

**Response:** 정기 지출 생성 Response와 동일한 구조의 배열. `dayOfMonth` 오름차순 정렬.

---

### 정기 지출 수정
```
POST /api/recurring-spendings/{id}
```

**Request:** 정기 지출 생성 Request와 동일한 구조

**Response:** 수정된 정기 지출 객체

---

### 정기 지출 삭제
```
DELETE /api/recurring-spendings/{id}
```

**Response:** `204 No Content`

---

### 월별 지출 조회 응답 변경

`GET /api/spendings?year={year}&month={month}` 응답에 `recurring`, `recurringId` 필드가 추가됩니다.

```json
[
  {
    "id": 42,
    "type": "EXPENSE",
    "categoryName": "식사",
    "categoryGroup": "FOOD",
    "categoryGroupLabel": "식비",
    "amount": 12000,
    "date": "2026-06-02",
    "memo": "점심 국밥",
    "shared": false,
    "createdAt": "2026-06-02T14:30:00",
    "recurring": false,
    "recurringId": null
  },
  {
    "id": null,
    "type": "EXPENSE",
    "categoryName": "주거",
    "categoryGroup": "HOUSING",
    "categoryGroupLabel": "주거/통신",
    "amount": 800000,
    "date": "2026-06-25",
    "memo": "월세",
    "shared": false,
    "createdAt": "2024-01-25T00:00:00",
    "recurring": true,
    "recurringId": 1
  }
]
```
- `recurring: true` 항목은 실제 저장된 지출이 아닌 정기 지출 템플릿에서 생성된 가상 항목
- `id`가 `null`이므로 수정/삭제 시 `recurringId`로 정기 지출 API 호출 필요
- 해당 달의 `startDate ~ endDate` 범위 내에 있는 정기 지출만 포함

---

## 통계

### 월별 주차별 지출 조회
```
GET /api/stats/weekly?year={year}&month={month}
```

**Response**
```json
{
  "year": 2026,
  "month": 5,
  "weeks": [
    {
      "week": 1,
      "startDate": "2026-05-01",
      "endDate": "2026-05-03",
      "amount": 30000
    }
  ]
}
```

---

### 분류별 지출 통계
```
GET /api/stats/category?year={year}&month={month}
```

이번 달 분류(대카테고리)별 지출 합계 및 전달 비교.

**Response**
```json
{
  "year": 2026,
  "month": 5,
  "totalAmount": 150000,
  "lastMonthTotalAmount": 120000,
  "categories": [
    {
      "categoryGroup": "FOOD",
      "categoryGroupLabel": "식비",
      "amount": 80000,
      "count": 10,
      "percentage": 53.3,
      "lastMonthAmount": 60000
    }
  ]
}
```
- `categories`: 이번 달 지출(EXPENSE)이 있는 분류만 포함, 금액 내림차순
- `categoryGroup`: 분류 key (클라이언트에서 색상/아이콘 매핑)
- `percentage`: 이번 달 총 지출 대비 비율
