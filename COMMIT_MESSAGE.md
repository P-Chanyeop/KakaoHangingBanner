refactor: 프론트엔드를 React에서 Thymeleaf로 변경

## 변경 사항
- React 기반 프론트엔드를 제거하고 Thymeleaf 서버 사이드 렌더링으로 변경
- 다음 Thymeleaf 템플릿 생성:
  - index.html: 메인 지도 및 게시대 목록 페이지
  - stand-detail.html: 게시대 상세 정보 페이지
  - stand-form.html: 게시대 생성/수정 폼
- 정적 리소스 구조 생성:
  - CSS 스타일시트
  - 지도 기능을 위한 JavaScript 파일
- 웹 페이지 렌더링을 위한 WebController 추가
- REST API 엔드포인트 유지 (StandApiController)
- Stand 엔티티, 리포지토리, 서비스 클래스 추가
- 프로젝트 구조 및 README 업데이트

## 이유
- 서버 사이드 렌더링을 통한 초기 로딩 성능 개선
- 프로젝트 구조 단순화
- 백엔드와 프론트엔드 통합으로 개발 및 배포 프로세스 간소화
- SEO 최적화 개선

## 테스트
- 메인 페이지 렌더링 확인
- 게시대 목록 표시 확인
- 지도 기능 작동 확인
- 게시대 상세 정보 표시 확인
- 게시대 생성/수정/삭제 기능 확인
