---
name: project-ios-setup
description: iOS 빌드 설정 - prebuild 후 반드시 복원해야 하는 파일들
metadata:
  type: project
---

`npx expo prebuild --clean` 실행 시 `ios/` 폴더가 통째로 재생성되어 수동 변경사항이 사라짐.

**Why:** Expo prebuild --clean은 ios/ 디렉토리를 삭제 후 재생성. app.json에 없는 설정은 유실됨.

**How to apply:** prebuild --clean 후 반드시 아래 항목 확인/복원:

## 복원 필요 항목

### 1. ios/app/Info.plist — 수동 추가 필요
- `KAKAO_APP_KEY`: `f481347e0578b734ef7deee10b002433` (app.json infoPlist에도 있으나 CFBundleURLSchemes는 별도)
- `CFBundleURLSchemes`에 `kakaof481347e0578b734ef7deee10b002433` 추가 (app.json scheme 배열로 자동화됨)
- `LSApplicationQueriesSchemes`: `kakaokompassauth`, `storekvault`
- `ITSAppUsesNonExemptEncryption`: false

### 2. ios/app/AppDelegate.swift — 수동 추가 필요
- `import KakaoSDKAuth` 추가
- `open url` 메서드에 KakaoSDK URL 핸들러 추가:
```swift
if AuthApi.isKakaoTalkLoginUrl(url) {
  return AuthController.handleOpenUrl(url: url)
}
```

### 3. ios/app/GoogleService-Info.plist — 파일 복사 필요
- 위치: `~/Downloads/GoogleService-Info.plist` → `ios/app/GoogleService-Info.plist`
- Xcode에서 Add Files to "app"으로 프로젝트에도 추가 필요

### 4. ios/Podfile — use_modular_headers! 추가 필요
```ruby
target 'app' do
  use_modular_headers!  # Firebase Swift pod 호환성
  use_expo_modules!
```

## app.json에 이미 반영된 항목 (자동 복원됨)
- `scheme`: `["moamong", "kakaof481347e0578b734ef7deee10b002433"]`
- `usesAppleSignIn`: true
- `KAKAO_APP_KEY` (infoPlist)
- `LSApplicationQueriesSchemes` (infoPlist)
- `ITSAppUsesNonExemptEncryption` (infoPlist)

## 권장사항
- `--clean` 없이 `npx expo prebuild --platform ios` 사용
- `--clean`은 네이티브 의존성 크게 바뀔 때만 사용
