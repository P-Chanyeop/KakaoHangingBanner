# 참신한 게시대 - 현수막 게시대 관리 시스템

경상북도와 경상남도 지역의 현수막 게시대 위치를 관리하고, 지도에서 쉽게 찾을 수 있는 웹 애플리케이션입니다.

<p align="center">
  <img src="https://img.shields.io/badge/Spring%20Boot-3.5.3-brightgreen" alt="Spring Boot">
  <img src="https://img.shields.io/badge/React-18.3.1-blue" alt="React">
  <img src="https://img.shields.io/badge/Java-17-orange" alt="Java">
  <img src="https://img.shields.io/badge/License-MIT-yellow" alt="License">
</p>

## 📋 목차

- [주요 기능](#-주요-기능)
- [기술 스택](#-기술-스택)
- [성능 최적화](#-성능-최적화)
- [프로젝트 구조](#-프로젝트-구조)
- [시작하기](#-시작하기)
- [주요 기능 상세](#-주요-기능-상세)
- [API 문서](#-api-문서)
- [배포](#-배포)
- [기여](#-기여)
- [라이선스](#-라이선스)

## ✨ 주요 기능

### 🔐 사용자 인증 및 권한 관리
- **Spring Security + JWT** 기반 인증 시스템
- 회원가입 및 로그인
- 역할 기반 접근 제어 (USER, ADMIN)
- 관리자 전용 페이지

### 🗺️ 다중 지도 제공자 지원
- **Leaflet** (OpenStreetMap)
- **Kakao Maps** (부드러운 panTo 이동)
- **Naver Maps** (Roadview/로드뷰 포함, morph 애니메이션)
- 탭 방식으로 지도 제공자 전환 가능
- 탭 위치 커스터마이징 (상단 중앙 / 우측 하단)

### 📍 게시대 관리
- 게시대 등록, 수정, 삭제 (CRUD)
- **가로형 레이아웃**: 왼쪽 폼 + 오른쪽 지도 (PC)
- **반응형 디자인**: 모바일에서 세로 배치
- 지도 클릭으로 좌표 선택
- 역지오코딩: 좌표 → 주소 자동 변환
- 주소 검색 후 역지오코딩으로 정확한 주소 표시
- 이미지 업로드 (최대 5MB)
- 지역별 필터링 (경북 23개, 경남 20개 시군구)
- **기존 게시대 마커 표시**: 등록 시 중복 방지

### 🏷️ 마커 라벨 시스템
- **CustomOverlay 방식**: 지도 이동 방해 없음
- 마커 위에 게시대 이름 상시 표시
- 카카오맵/네이버맵 모두 지원
- `pointer-events: none`으로 클릭 이벤트 통과

### 🏛️ 인터랙티브 행정구역 지도
- 경상북도/경상남도 시군구 단위 경계 표시
- 각 시군구 클릭 가능
- 호버 시 하이라이트 효과
- 지역별 정보 모달 표시
- 통계청 SGIS API 기반 정확한 행정구역 경계

### 📱 Naver Maps Roadview
- **선택 모드**: 도로 선택 후 로드뷰 보기 (MapSearch 페이지)
- **토글 모드**: 즉시 로드뷰 열기/닫기 (StandForm 페이지)
- **핀 위치 로드뷰**: 클릭한 핀 위치의 로드뷰 표시
- PanoramaLayer를 통한 도로 시각화
- 미니맵 연동 및 방향 표시

### 🔍 지도 검색 페이지
- 사이드바 게시대 목록
- 지역 선택 시 해당 지역 게시대만 필터링
- **장소 검색 기능**: 카카오 Places API 연동
  - 건물명, 상호명, 주소 등 키워드 검색
  - 검색 결과 드롭다운 목록 표시
  - 선택 시 해당 위치로 지도 이동 (핀 없음)
- **엑셀 다운로드**: CSV 형식으로 게시대 목록 저장
- 인포윈도우 위치 최적화 (핀 가림 방지)
- 모바일 메뉴 z-index 최적화

### 🎨 관리자 페이지
- **버튼 링크 관리**: 경북/경남 협회 사이트 링크
- **Hero 이미지 관리**: 메인 페이지 배경 이미지
- **팝업 메시지 관리**:
  - 웹하드 정보 (입력창 500px 확대)
  - 공지사항
  - 지역별 메시지 (43개 시군구 개별 관리)

### 📅 캘린더 기능
- 월별 일정 관리
- **일정 수정 기능**: 캘린더 항목 클릭 시 수정
- 메모 추가/삭제
- 색상 코드로 일정 구분

### 🚀 최신 웹 기술
- React 18 SPA (Single Page Application)
- React Router v6
- Spring Boot REST API
- Responsive Design
- Cache-busting 전략

## 🛠 기술 스택

### Backend
| 기술 | 버전 | 용도 |
|------|------|------|
| Spring Boot | 3.5.3 | 애플리케이션 프레임워크 |
| Java | 17 | 프로그래밍 언어 |
| Spring Security | 6.x | 인증 및 권한 관리 |
| JWT (JJWT) | 0.12.3 | 토큰 기반 인증 |
| Spring Data JPA | 3.x | ORM 및 데이터 액세스 |
| H2 Database | - | 개발용 인메모리 DB |
| MySQL | 8.x | 프로덕션 DB |
| Lombok | - | 보일러플레이트 코드 감소 |
| Gradle | 8.x | 빌드 도구 |

### Frontend
| 기술 | 버전 | 용도 |
|------|------|------|
| React | 18.3.1 | UI 라이브러리 |
| React Router | 6.28.0 | 클라이언트 라우팅 |
| Leaflet | 1.9.4 | 오픈소스 지도 |
| Kakao Maps API | - | 카카오 지도 |
| Naver Maps API | 3.0 | 네이버 지도 + 로드뷰 |
| Font Awesome | 6.7.1 | 아이콘 |

### 외부 API 및 데이터
| 출처 | 용도 |
|------|------|
| [statgarten/maps](https://github.com/statgarten/maps) | 대한민국 행정구역 경계 SVG (통계청 SGIS API 기반) |
| Kakao Maps API | 지도 표시 및 지오코딩 |
| Naver Maps API | 지도 표시, 로드뷰, 역지오코딩 |
| VWorld API | 주소 → 좌표 변환 (도로명/지번 주소 지원) |

## ⚡ 성능 최적화

### 뷰포트 기반 마커 렌더링

대량의 마커를 효율적으로 처리하기 위해 **뷰포트 기반 렌더링**을 적용했습니다.
현재 지도 화면에 보이는 영역의 마커만 렌더링하여 성능을 최적화합니다.

#### 예상 성능 향상

| 상황 | 전체 마커 | 화면 내 마커 | 렌더링 감소율 |
|------|----------|-------------|--------------|
| 전국 보기 (줌 아웃) | 1000개 | ~50개 | **95% 감소** |
| 지역 보기 (줌 인) | 1000개 | ~20개 | **98% 감소** |
| 특정 위치 확대 | 1000개 | ~5개 | **99.5% 감소** |

#### 실제 효과
- DOM 요소 생성/삭제 횟수 감소
- 메모리 사용량 감소
- 지도 이동/줌 시 반응 속도 향상

#### 사용 방법
```jsx
<UnifiedMap
  markers={markers}
  useViewportRendering={true}  // 뷰포트 렌더링 활성화
  showPermanentLabels={true}   // 라벨 표시
/>
```

### 마커 최적화 기법
- **지도 idle 이벤트**: 지도 이동/줌 완료 시에만 마커 재계산
- **useMemo/useCallback**: 불필요한 리렌더링 방지
- **Ref 기반 마커 관리**: 마커 인스턴스 재사용

## 📁 프로젝트 구조

```
KakaoHangingBanner/
├── src/main/
│   ├── java/com/mapboard/
│   │   ├── controller/          # REST API 컨트롤러
│   │   │   ├── AuthController.java
│   │   │   ├── StandApiController.java
│   │   │   ├── CalendarEventApiController.java
│   │   │   ├── PopupMessageController.java
│   │   │   └── HeroImageApiController.java
│   │   ├── entity/              # JPA 엔티티
│   │   │   ├── Stand.java
│   │   │   ├── User.java
│   │   │   ├── CalendarEvent.java
│   │   │   ├── ButtonLink.java
│   │   │   └── PopupMessage.java
│   │   ├── repository/          # Spring Data JPA 리포지토리
│   │   ├── service/             # 비즈니스 로직
│   │   │   ├── JwtService.java
│   │   │   └── UserService.java
│   │   ├── security/            # 보안 설정
│   │   │   └── JwtAuthenticationFilter.java
│   │   └── config/              # 설정 클래스
│   │       ├── SecurityConfig.java
│   │       ├── WebConfig.java
│   │       └── DataInitializer.java
│   └── resources/
│       ├── application.properties
│       └── static/              # React 빌드 결과물 (프로덕션)
│
├── react-app/                   # React 프론트엔드
│   ├── public/
│   │   ├── index.html
│   │   └── static/
│   │       ├── 경상북도_시군구.svg
│   │       └── 경상남도_시군구.svg
│   ├── src/
│   │   ├── components/          # React 컴포넌트
│   │   │   ├── Header.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── UnifiedMap.jsx   # 통합 지도 컴포넌트
│   │   │   ├── KakaoMap.jsx     # 카카오맵 (클러스터링, 뷰포트 렌더링)
│   │   │   ├── NaverMap.jsx     # 네이버맵 (로드뷰, 뷰포트 렌더링)
│   │   │   ├── LeafletMap.jsx
│   │   │   ├── MapTabs.jsx      # 지도 탭 전환
│   │   │   └── InteractiveMap.jsx
│   │   ├── pages/               # 페이지 컴포넌트
│   │   │   ├── Home.jsx         # 메인 (캘린더 수정 기능)
│   │   │   ├── MapSearch.jsx    # 지도 검색 (엑셀 다운로드)
│   │   │   ├── StandForm.jsx    # 게시대 등록 (가로형 레이아웃)
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── AdminButtons.jsx
│   │   │   └── AdminPopupMessages.jsx
│   │   ├── contexts/            # React Context
│   │   │   └── AuthContext.jsx
│   │   ├── services/            # API 서비스
│   │   │   └── api.js
│   │   ├── assets/              # 정적 자산
│   │   │   └── css/
│   │   │       └── common.css
│   │   └── App.js
│   └── package.json
│
├── build.gradle                 # Gradle 빌드 설정
├── DEPLOYMENT.md                # 배포 가이드
└── README.md
```

## 🚀 시작하기

### 사전 요구사항

- **Java 17** 이상
- **Node.js 18** 이상 및 npm
- **H2 Database** (개발용, 내장) 또는 **MySQL 8.0** 이상 (프로덕션)
- **Gradle 8.x** 이상

### 설치

1. **프로젝트 클론**
```bash
git clone https://github.com/yourusername/KakaoHangingBanner.git
cd KakaoHangingBanner
```

2. **백엔드 설정**

`src/main/resources/application.properties` 파일 설정:

```properties
# H2 데이터베이스 (개발용)
spring.datasource.url=jdbc:h2:mem:testdb;DB_CLOSE_DELAY=-1
spring.datasource.driver-class-name=org.h2.Driver
spring.h2.console.enabled=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.H2Dialect

# 관리자 계정 설정
admin.username=admin
admin.password=admin password

# JWT 설정
jwt.secret=mySecretKeyForJWTTokenGenerationAndValidationMustBeLongEnoughForHS256Algorithm
jwt.expiration=86400000
```

3. **프론트엔드 의존성 설치**
```bash
cd react-app
npm install
cd ..
```

### 개발 서버 실행

#### 방법 1: 별도 실행 (개발 시 권장)

**터미널 1 - 백엔드 서버:**
```bash
./gradlew bootRun
```
→ http://localhost:8081

**터미널 2 - React 개발 서버:**
```bash
cd react-app
npm start
```
→ http://localhost:3000

#### 방법 2: 통합 빌드 및 실행

```bash
./gradlew clean build
java -jar build/libs/mapboard-0.0.1-SNAPSHOT.jar
```
→ http://localhost:8081

### 기본 계정

- **관리자**: `admin` / `[admin password]`
- 일반 사용자는 회원가입 필요

### API 테스트

- **H2 Console**: http://localhost:8081/h2-console
  - JDBC URL: `jdbc:h2:mem:testdb`
  - Username: `sa`
  - Password: (공백)

## 📚 주요 기능 상세

### 1. 인증 시스템

#### 회원가입
- 사용자명과 비밀번호만으로 간단 가입
- 비밀번호는 BCrypt로 암호화되어 저장
- 자동으로 USER 역할 부여

#### 로그인
- JWT 토큰 발급 (유효기간: 24시간)
- 토큰은 localStorage에 저장
- Authorization 헤더로 API 요청 시 자동 전송

#### 보호된 라우트
- `/`, `/map`, `/stands/new`: 로그인 필요
- `/admin/**`: ADMIN 역할 필요

### 2. 다중 지도 제공자

#### Leaflet (OpenStreetMap)
- 오픈소스, 무료
- 전 세계 커버리지
- 가벼운 성능

#### Kakao Maps
- 한국 지역 상세 지도
- 정확한 지오코딩
- 로드맵/스카이뷰 지원
- **panTo**: 부드러운 지도 이동

#### Naver Maps
- **Roadview/로드뷰 지원** (핵심 기능)
- 역지오코딩: 좌표 → 주소 변환
- PanoramaLayer를 통한 도로 시각화
- **morph**: 부드러운 지도 이동 애니메이션

**Roadview 모드**:
- **Selector 모드** (MapSearch): 도로 선택 후 로드뷰 열기
- **Toggle 모드** (StandForm): 즉시 로드뷰 열기/닫기

### 3. 게시대 관리

#### 등록 (가로형 레이아웃)
- **PC**: 왼쪽 폼(400px) + 오른쪽 지도
- **모바일**: 세로 배치 (주소 → 지도 → 좌표 순서)
1. 지역 선택 (경북/경남 시군구)
2. 지도 클릭으로 좌표 선택
3. 자동 역지오코딩으로 주소 채우기
4. 이미지 업로드 (선택사항, 최대 5MB)
5. 설명 입력 (선택사항)
6. **기존 게시대 마커 확인**: 중복 등록 방지

#### 수정/삭제
- MapSearch 페이지에서 게시대 클릭
- 사이드바에서 "수정" 또는 "삭제" 버튼

#### 필터링
- 지역별 필터 (43개 시군구)
- 현재 지도 영역 내 게시대만 표시 (뷰포트 렌더링)

### 4. 인터랙티브 행정구역 지도

#### 데이터 출처
- [statgarten/maps](https://github.com/statgarten/maps)
- 통계청 SGIS API 기반
- 시군구 단위로 분리된 SVG

#### 기능
- 각 시군구 호버 시 노란색 하이라이트
- 클릭 시 해당 지역 정보 모달 표시
- 관리자 페이지에서 지역별 메시지 설정 가능

### 5. 관리자 기능

#### 버튼 링크 관리
- 경북/경남 협회 사이트 링크 추가/수정/삭제
- 아이콘, 색상, 정렬 순서 설정

#### Hero 이미지 관리
- 메인 페이지 배경 이미지 2개 설정
- 이미지 업로드 및 미리보기

#### 팝업 메시지 관리
- **웹하드 정보**: 아이디/비밀번호 등 (입력창 500px)
- **공지사항**: 전체 공지
- **지역별 메시지**: 43개 시군구별 개별 메시지
  - 경북 23개: 경산시, 경주시, 포항시, 안동시 등
  - 경남 20개: 창원시, 김해시, 부산시, 양산시 등

## 📡 API 문서

### 인증 API

| Method | Endpoint | 설명 | 인증 필요 |
|--------|----------|------|-----------|
| POST | `/api/auth/register` | 회원가입 | ❌ |
| POST | `/api/auth/login` | 로그인 | ❌ |
| GET | `/api/auth/me` | 현재 사용자 정보 | ✅ |

### 게시대 API

| Method | Endpoint | 설명 | 인증 필요 |
|--------|----------|------|-----------|
| GET | `/api/stands` | 모든 게시대 조회 | ✅ |
| GET | `/api/stands?region={region}` | 지역별 게시대 조회 | ✅ |
| GET | `/api/stands/{id}` | 게시대 상세 조회 | ✅ |
| POST | `/api/stands/with-file` | 게시대 등록 (이미지 포함) | ✅ |
| PUT | `/api/stands/{id}` | 게시대 수정 | ✅ |
| DELETE | `/api/stands/{id}` | 게시대 삭제 | ✅ |
| GET | `/api/stands/geocode?address={address}` | 주소 → 좌표 변환 (도로명/지번) | ✅ |
| GET | `/api/stands/reverse-geocode?lat={lat}&lng={lng}` | 좌표 → 주소 변환 | ✅ |

### 버튼 링크 API

| Method | Endpoint | 설명 | 인증 필요 |
|--------|----------|------|-----------|
| GET | `/api/button-links` | 모든 버튼 조회 | ✅ |
| POST | `/api/button-links` | 버튼 등록 | ✅ (ADMIN) |
| PUT | `/api/button-links/{id}` | 버튼 수정 | ✅ (ADMIN) |
| DELETE | `/api/button-links/{id}` | 버튼 삭제 | ✅ (ADMIN) |

### 팝업 메시지 API

| Method | Endpoint | 설명 | 인증 필요 |
|--------|----------|------|-----------|
| GET | `/api/popup-messages/{name}` | 메시지 조회 | ✅ |
| POST | `/api/popup-messages` | 메시지 저장 | ✅ (ADMIN) |

### 캘린더 API

| Method | Endpoint | 설명 | 인증 필요 |
|--------|----------|------|-----------|
| GET | `/api/calendar-events/range?startDate={start}&endDate={end}` | 기간별 일정 조회 | ✅ |
| POST | `/api/calendar-events` | 일정 추가 | ✅ |
| PUT | `/api/calendar-events/{id}` | 일정 수정 | ✅ |
| DELETE | `/api/calendar-events/{id}` | 일정 삭제 | ✅ |

## 📦 배포

### 프로덕션 빌드

```bash
# React + Spring Boot 통합 빌드
./gradlew clean build

# JAR 파일 생성 위치
# build/libs/mapboard-0.0.1-SNAPSHOT.jar
```

### JAR 실행

```bash
java -jar build/libs/mapboard-0.0.1-SNAPSHOT.jar
```

### 환경 변수 설정

**MySQL 사용 시:**
```bash
export SPRING_DATASOURCE_URL=jdbc:mysql://localhost:3306/mapboard
export SPRING_DATASOURCE_USERNAME=myuser
export SPRING_DATASOURCE_PASSWORD=mypassword
export ADMIN_USERNAME=admin
export ADMIN_PASSWORD=your_secure_password
export JWT_SECRET=your_jwt_secret_key_here
```

자세한 배포 가이드는 [DEPLOYMENT.md](DEPLOYMENT.md)를 참조하세요.

## 🤝 기여

1. 이 저장소를 포크합니다
2. 새 브랜치를 생성합니다: `git checkout -b feature/amazing-feature`
3. 변경 사항을 커밋합니다: `git commit -m 'feat: Add amazing feature'`
4. 브랜치에 푸시합니다: `git push origin feature/amazing-feature`
5. Pull Request를 제출합니다

### 커밋 메시지 규칙

- `feat:` 새로운 기능
- `fix:` 버그 수정
- `docs:` 문서 수정
- `style:` 코드 포맷팅
- `refactor:` 리팩토링
- `perf:` 성능 개선
- `test:` 테스트 코드
- `chore:` 빌드, 설정 변경

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

---

## 📞 문의

프로젝트에 대한 질문이나 제안이 있으시면 이슈를 생성해주세요.

## 🙏 감사의 말

- [statgarten/maps](https://github.com/statgarten/maps) - 대한민국 행정구역 경계 SVG 제공
- [southkorea/southkorea-maps](https://github.com/southkorea/southkorea-maps) - 행정구역 지도 데이터
- Kakao Maps, Naver Maps - 지도 API 제공
- OpenStreetMap & Leaflet - 오픈소스 지도 솔루션
- VWorld - 주소 좌표 변환 API 제공
