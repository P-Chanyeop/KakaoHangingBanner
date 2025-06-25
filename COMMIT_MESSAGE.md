feat: 지역별 게시대 지도 웹사이트 초기 구현

## 주요 변경사항
- Spring Boot 3.5.3 및 Java 17 기반 백엔드 구현
  - PostStand 엔티티 및 관련 DTO 구현
  - JPA 리포지토리 및 서비스 레이어 구현
  - RESTful API 컨트롤러 구현
  - 위치 기반 검색 기능 (Haversine 공식 활용)

- React 기반 프론트엔드 구현
  - Leaflet 지도 라이브러리 통합
  - 게시대 위치 마커 표시 기능
  - 지역별 필터링 기능
  - 반경 내 게시대 검색 기능
  - 게시대 상세 정보 조회/등록/수정/삭제 기능
  - 반응형 디자인 적용

- 프로젝트 문서화
  - 상세 README.md 작성
  - API 엔드포인트 문서화
  - 설치 및 실행 방법 안내

## 기술 스택
- 백엔드: Spring Boot 3.5.3, Java 17, Spring Data JPA, MySQL
- 프론트엔드: React, Leaflet, Axios

## 다음 작업
- 사용자 인증/인가 시스템 구현
- 이미지 업로드 기능 추가
- 성능 최적화 (마커 클러스터링 등)
- 검색 기능 강화
