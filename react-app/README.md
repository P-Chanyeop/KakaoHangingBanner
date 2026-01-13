# 참신한 게시대 현수막 아지트 - React SPA

이 프로젝트는 게시대 관리 시스템을 React SPA(Single Page Application)로 구현한 버전입니다.

## 주요 기능

- **홈 페이지**: 협회 사이트 링크 및 일정 관리 캘린더
- **지도 검색**: Leaflet을 사용한 인터랙티브 지도에서 게시대 검색
- **게시대 등록**: 지도 기반 게시대 위치 등록 시스템
- **관리자 페이지**: 버튼 링크 관리 CRUD

## 설치 및 실행

### 1. 의존성 설치

```bash
npm install
```

### 2. 개발 서버 실행

```bash
npm start
```

개발 서버가 [http://localhost:3000](http://localhost:3000)에서 실행됩니다.

### 3. 프로덕션 빌드

```bash
npm run build
```

빌드된 파일은 `build` 폴더에 생성됩니다.

## API 연동

API 서버는 `http://localhost:8081`에서 실행되어야 합니다.

API 베이스 URL은 `src/services/api.js` 파일에서 수정할 수 있습니다:

```javascript
const API_BASE_URL = 'http://localhost:8081/api';
```

## 프로젝트 구조

```
react-app/
├── public/
│   └── index.html
├── src/
│   ├── assets/
│   │   └── css/
│   │       └── common.css
│   ├── components/
│   │   ├── Header.jsx
│   │   └── Footer.jsx
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── Home.css
│   │   ├── MapSearch.jsx
│   │   ├── MapSearch.css
│   │   ├── StandForm.jsx
│   │   ├── StandForm.css
│   │   ├── AdminButtons.jsx
│   │   └── AdminButtons.css
│   ├── services/
│   │   └── api.js
│   ├── App.js
│   ├── index.js
│   └── index.css
└── package.json
```

## 사용된 기술

- **React** 18.2.0
- **React Router** 6.20.0
- **Leaflet** 1.9.4 (지도 라이브러리)
- **Font Awesome** 6.5.1 (아이콘)

## 환경 설정

### CORS 설정

백엔드 서버에서 CORS를 허용해야 합니다:

```java
@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:3000")
                .allowedMethods("GET", "POST", "PUT", "DELETE")
                .allowCredentials(true);
    }
}
```

## 특징

- **100% 동일한 디자인**: 기존 HTML 버전과 완전히 동일한 UI/UX
- **빠른 로딩 속도**: SPA 방식으로 페이지 전환이 빠름
- **모듈화된 구조**: 컴포넌트 기반으로 유지보수가 용이
- **재사용 가능한 API 서비스**: 모든 API 호출을 서비스 레이어에서 관리

## 라이선스

© 2026 참신한 게시대 현수막 아지트. All rights reserved.
