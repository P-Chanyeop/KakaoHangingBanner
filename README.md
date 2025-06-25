# 지역별 게시대 지도 웹사이트

각 지역에 대한 지도에 게시대를 표시하는 웹사이트입니다. 사용자는 지도에서 게시대 위치를 확인하고, 지역별로 필터링하거나 특정 반경 내의 게시대를 검색할 수 있습니다.

## 📋 목차
- [기술 스택](#기술-스택)
- [프로젝트 구조](#프로젝트-구조)
- [설치 및 실행 방법](#설치-및-실행-방법)
- [주요 기능](#주요-기능)
- [API 엔드포인트](#api-엔드포인트)
- [스크린샷](#스크린샷)
- [향후 개선 사항](#향후-개선-사항)
- [기여 방법](#기여-방법)
- [라이센스](#라이센스)

## 🛠 기술 스택

### 백엔드
- **Spring Boot 3.5.3**: 애플리케이션 프레임워크
- **Java 17**: 프로그래밍 언어
- **Spring Data JPA**: 데이터 액세스 계층
- **MySQL**: 데이터베이스
- **Lombok**: 보일러플레이트 코드 감소
- **SpringDoc OpenAPI**: API 문서화

### 프론트엔드
- **React**: UI 라이브러리
- **Leaflet**: 오픈소스 지도 라이브러리
- **React-Leaflet**: React용 Leaflet 래퍼
- **Axios**: HTTP 클라이언트
- **React Router**: 클라이언트 사이드 라우팅

## 📁 프로젝트 구조

```
KakaoHangingBanner/
├── src/                          # 백엔드 소스 코드
│   └── main/
│       ├── java/
│       │   └── com/mapboard/     
│       │       ├── controller/   # REST API 컨트롤러
│       │       ├── dto/          # 데이터 전송 객체
│       │       ├── entity/       # JPA 엔티티
│       │       ├── repository/   # 데이터 액세스 계층
│       │       └── service/      # 비즈니스 로직
│       └── resources/            # 설정 파일
│           └── application.properties
├── frontend/                     # 프론트엔드 소스 코드
│   ├── public/                   # 정적 파일
│   └── src/
│       ├── components/           # React 컴포넌트
│       │   ├── Map/              # 지도 관련 컴포넌트
│       │   └── PostStand/        # 게시대 관련 컴포넌트
│       ├── services/             # API 서비스
│       └── App.jsx               # 메인 애플리케이션 컴포넌트
└── build.gradle                  # Gradle 빌드 설정
```

## 🚀 설치 및 실행 방법

### 사전 요구사항
- Java 17 이상
- Node.js 14 이상
- MySQL 8.0 이상

### 백엔드 설정

1. 프로젝트 클론:
```bash
git clone https://github.com/yourusername/KakaoHangingBanner.git
cd KakaoHangingBanner
```

2. MySQL 데이터베이스 생성:
```sql
CREATE DATABASE mapboard CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

3. `application.properties` 파일에서 데이터베이스 연결 정보 수정:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/mapboard?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
spring.datasource.username=your_username
spring.datasource.password=your_password
```

4. 백엔드 서버 실행:
```bash
./gradlew bootRun
```
서버는 기본적으로 `http://localhost:8080`에서 실행됩니다.

### 프론트엔드 설정

1. 프론트엔드 디렉토리로 이동:
```bash
cd frontend
```

2. 의존성 설치:
```bash
npm install
```

3. 개발 서버 실행:
```bash
npm start
```
프론트엔드는 기본적으로 `http://localhost:3000`에서 실행됩니다.

## ✨ 주요 기능

- **지도 기반 인터페이스**: Leaflet을 사용한 인터랙티브 지도
- **게시대 위치 표시**: 지도에 마커로 게시대 위치 표시
- **지역별 필터링**: 특정 지역의 게시대만 표시
- **반경 검색**: 특정 위치 주변의 게시대 검색
- **상세 정보 조회**: 게시대 클릭 시 상세 정보 표시
- **게시대 관리**: 게시대 등록/수정/삭제 기능
- **반응형 디자인**: 모바일 및 데스크톱 환경 지원

## 📡 API 엔드포인트

| 메서드 | 경로 | 설명 | 매개변수 |
|--------|------|------|----------|
| GET | /api/stands | 모든 게시대 조회 | - |
| GET | /api/stands?region={region} | 특정 지역의 게시대 조회 | region: 지역명 |
| GET | /api/stands?lat={lat}&lng={lng}&radius={radius} | 특정 반경 내의 게시대 조회 | lat: 위도, lng: 경도, radius: 반경(km) |
| GET | /api/stands/{id} | 특정 게시대 상세 조회 | id: 게시대 ID |
| POST | /api/stands | 새 게시대 등록 | 게시대 정보 (JSON) |
| PUT | /api/stands/{id} | 게시대 정보 수정 | id: 게시대 ID, 게시대 정보 (JSON) |
| DELETE | /api/stands/{id} | 게시대 삭제 | id: 게시대 ID |

## 📸 스크린샷

(프로젝트 스크린샷은 개발 완료 후 추가될 예정입니다)

## 🔮 향후 개선 사항

- **사용자 인증/인가**: Spring Security와 JWT를 사용한 인증 시스템 구현
- **이미지 업로드**: AWS S3 또는 로컬 스토리지를 사용한 이미지 업로드 기능
- **성능 최적화**: 대량의 마커 처리를 위한 클러스터링 기능
- **검색 기능 강화**: 주소 검색 및 키워드 기반 게시대 검색
- **모바일 앱**: React Native를 사용한 모바일 앱 개발

## 🤝 기여 방법

1. 이 저장소를 포크합니다.
2. 새 브랜치를 생성합니다: `git checkout -b feature/amazing-feature`
3. 변경 사항을 커밋합니다: `git commit -m 'Add some amazing feature'`
4. 브랜치에 푸시합니다: `git push origin feature/amazing-feature`
5. Pull Request를 제출합니다.

## 📄 라이센스

이 프로젝트는 MIT 라이센스 하에 배포됩니다. 자세한 내용은 `LICENSE` 파일을 참조하세요.
