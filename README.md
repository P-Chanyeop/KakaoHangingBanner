# 지역별 게시대 지도 웹사이트

각 지역에 대한 지도에 게시대를 표시하는 웹사이트입니다. 사용자는 지도에서 게시대 위치를 확인하고, 지역별로 필터링하거나 현재 지도 영역 내의 게시대를 검색할 수 있습니다.

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
- **Thymeleaf**: 서버 사이드 템플릿 엔진
- **Leaflet**: 오픈소스 지도 라이브러리
- **JavaScript**: 클라이언트 사이드 기능 구현
- **Bootstrap 5**: UI 프레임워크
- **jQuery**: DOM 조작 및 이벤트 처리
- **CSS3**: 스타일링

## 📁 프로젝트 구조

```
KakaoHangingBanner/
├── src/                          # 소스 코드
│   └── main/
│       ├── java/
│       │   ├── com/mapboard/     
│       │   │   ├── controller/   # 웹 및 REST API 컨트롤러
│       │   │   ├── dto/          # 데이터 전송 객체
│       │   │   ├── entity/       # JPA 엔티티
│       │   │   ├── repository/   # 데이터 액세스 계층
│       │   │   ├── service/      # 비즈니스 로직
│       │   │   └── config/       # 설정 클래스
│       │   └── com/softcat/kakaohangingbanner/ # 메인 애플리케이션 클래스
│       └── resources/            
│           ├── static/           # 정적 리소스 (CSS, JS, 이미지)
│           │   ├── css/          # CSS 파일
│           │   ├── js/           # JavaScript 파일
│           │   └── images/       # 이미지 파일 (bannerPin.png 등)
│           ├── templates/        # Thymeleaf 템플릿
│           │   ├── index.html    # 메인 페이지
│           │   ├── stand-detail.html # 게시대 상세 페이지
│           │   ├── stand-form.html   # 게시대 생성/수정 폼
│           │   └── api-test.html     # API 테스트 페이지
│           └── application.properties # 애플리케이션 설정
└── build.gradle                  # Gradle 빌드 설정
```

## 🚀 설치 및 실행 방법

### 사전 요구사항
- Java 17 이상
- MySQL 8.0 이상 또는 H2 데이터베이스
- Gradle 7.0 이상

### 백엔드 설정

1. 프로젝트 클론:
```bash
git clone https://github.com/yourusername/KakaoHangingBanner.git
cd KakaoHangingBanner
```

2. 데이터베이스 설정:
   - MySQL 사용 시:
   ```sql
   CREATE DATABASE mapboard CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
   
   - `application.properties` 파일에서 MySQL 설정:
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/mapboard?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
   spring.datasource.username=your_username
   spring.datasource.password=your_password
   spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
   spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL8Dialect
   ```
   
   - 또는 H2 인메모리 데이터베이스 사용 (개발 및 테스트용):
   ```properties
   spring.datasource.url=jdbc:h2:mem:testdb;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE
   spring.datasource.driverClassName=org.h2.Driver
   spring.datasource.username=sa
   spring.datasource.password=
   spring.h2.console.enabled=true
   spring.h2.console.path=/h2-console
   spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.H2Dialect
   ```

3. 애플리케이션 실행:
```bash
./gradlew bootRun
```
서버는 기본적으로 `http://localhost:8081`에서 실행됩니다.

## ✨ 주요 기능

- **지도 기반 인터페이스**: Leaflet을 사용한 인터랙티브 지도
- **한국 지역 제한**: 지도가 한국 영역(32.0N~39.0N, 124.0E~132.0E)으로 제한됨
- **게시대 위치 표시**: 지도에 마커로 게시대 위치 표시
- **지역별 필터링**: 대구, 경북, 경남 지역 및 시군구별 필터링
- **현재 지도 영역 내 게시대 표시**: 지도 이동 시 현재 보이는 영역 내의 게시대만 표시
- **게시대 등록/수정**: 지도 아래 폼에서 위치 선택 및 게시대 정보 입력
- **게시대 삭제**: 등록된 게시대 삭제 기능
- **통일된 마커 아이콘**: 모든 게시대에 동일한 bannerPin.png 이미지 사용
- **반응형 디자인**: 모바일 및 데스크톱 환경 지원
- **API 테스트 페이지**: API 엔드포인트 테스트를 위한 전용 페이지

## 📡 API 엔드포인트

| 메서드 | 경로 | 설명 | 매개변수 |
|--------|------|------|----------|
| GET | /api/stands | 모든 게시대 조회 | - |
| GET | /api/stands?region={region} | 특정 지역의 게시대 조회 | region: 지역명 |
| GET | /api/stands/{id} | 특정 게시대 상세 조회 | id: 게시대 ID |
| POST | /api/stands | 새 게시대 등록 | 게시대 정보 (JSON) |
| PUT | /api/stands/{id} | 게시대 정보 수정 | id: 게시대 ID, 게시대 정보 (JSON) |
| DELETE | /api/stands/{id} | 게시대 삭제 | id: 게시대 ID |

## 📸 스크린샷

(프로젝트 스크린샷은 개발 완료 후 추가될 예정입니다)

## 🔮 향후 개선 사항

- **사용자 인증/인가**: Spring Security와 JWT를 사용한 인증 시스템 구현
- **이미지 업로드**: 게시대 이미지 업로드 기능 추가
- **성능 최적화**: 대량의 마커 처리를 위한 클러스터링 기능
- **검색 기능 강화**: 주소 검색 및 키워드 기반 게시대 검색
- **모바일 앱**: React Native를 사용한 모바일 앱 개발
- **지오코딩 통합**: 주소 입력 시 자동으로 좌표 변환

## 🤝 기여 방법

1. 이 저장소를 포크합니다.
2. 새 브랜치를 생성합니다: `git checkout -b feature/amazing-feature`
3. 변경 사항을 커밋합니다: `git commit -m 'Add some amazing feature'`
4. 브랜치에 푸시합니다: `git push origin feature/amazing-feature`
5. Pull Request를 제출합니다.

## 📄 라이센스

이 프로젝트는 MIT 라이센스 하에 배포됩니다. 자세한 내용은 `LICENSE` 파일을 참조하세요.
