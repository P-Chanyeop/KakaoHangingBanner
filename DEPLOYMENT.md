# 배포 가이드

이 문서는 Spring Boot + React 애플리케이션을 단일 JAR 파일로 배포하는 방법을 설명합니다.

## 1. 사전 준비

### 필수 요구사항
- Java 17 이상
- Gradle 8.14 이상 (또는 프로젝트 내 gradlew 사용)
- Node.js 20.11.0 이상 (빌드 시 자동 다운로드됨)

### 데이터베이스 설정

배포 전에 `src/main/resources/application.properties` 파일에서 데이터베이스 설정을 확인하세요.

#### 프로덕션 환경 (AWS RDS MySQL)
```properties
spring.datasource.url=jdbc:mysql://[RDS_ENDPOINT]:3306/mapboard?useSSL=true&serverTimezone=Asia/Seoul&allowPublicKeyRetrieval=true
spring.datasource.username=dbmasteruser
spring.datasource.password=[YOUR_PASSWORD]
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL8Dialect
```

#### 개발 환경 (H2 In-Memory)
```properties
spring.datasource.url=jdbc:h2:mem:testdb;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE
spring.datasource.driverClassName=org.h2.Driver
spring.datasource.username=sa
spring.datasource.password=
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.H2Dialect
```

## 2. 빌드 프로세스

### 전체 빌드 (React + Spring Boot)

```bash
# 1. 이전 빌드 정리
./gradlew clean

# 2. React 빌드 및 JAR 생성
./gradlew bootJar
```

이 명령어는 다음 작업을 자동으로 수행합니다:
1. React 의존성 설치 (`npm install`)
2. React 앱 빌드 (`npm run build`)
3. React 빌드 결과물을 `src/main/resources/static/`로 복사
4. Spring Boot JAR 파일 생성 (빌드 결과물 포함)

### 개별 작업

```bash
# React만 빌드
./gradlew buildReact

# React 빌드 결과물 복사
./gradlew copyReactBuild

# Spring Boot JAR만 생성 (React 빌드 포함)
./gradlew bootJar
```

## 3. JAR 파일 실행

빌드가 완료되면 `build/libs/` 디렉토리에 JAR 파일이 생성됩니다.

### 기본 실행
```bash
java -jar build/libs/kakao-hanging-banner-0.0.1-SNAPSHOT.jar
```

### 환경 변수 사용
```bash
# 포트 변경
java -jar build/libs/*.jar --server.port=8080

# 프로파일 지정
java -jar build/libs/*.jar --spring.profiles.active=prod

# 데이터베이스 설정 오버라이드
java -jar build/libs/*.jar \
  --spring.datasource.url=jdbc:mysql://your-db:3306/mapboard \
  --spring.datasource.username=admin \
  --spring.datasource.password=your-password
```

### 백그라운드 실행 (Linux/Mac)
```bash
nohup java -jar build/libs/*.jar > application.log 2>&1 &
```

### systemd 서비스로 실행 (Linux)

`/etc/systemd/system/kakao-banner.service` 파일 생성:

```ini
[Unit]
Description=Kakao Hanging Banner Application
After=syslog.target network.target

[Service]
User=app-user
WorkingDirectory=/opt/kakao-banner
ExecStart=/usr/bin/java -jar /opt/kakao-banner/kakao-hanging-banner-0.0.1-SNAPSHOT.jar
SuccessExitStatus=143
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

서비스 시작:
```bash
sudo systemctl daemon-reload
sudo systemctl enable kakao-banner
sudo systemctl start kakao-banner
sudo systemctl status kakao-banner
```

## 4. 배포 확인

### 애플리케이션 접속
브라우저에서 `http://localhost:8081` 또는 `http://[서버IP]:8081` 접속

### 헬스 체크
```bash
# Spring Boot Actuator (활성화된 경우)
curl http://localhost:8081/actuator/health

# API 테스트
curl http://localhost:8081/api/stands
```

### 로그 확인
```bash
# systemd 서비스 로그
sudo journalctl -u kakao-banner -f

# 직접 실행 시
tail -f application.log
```

## 5. 트러블슈팅

### React 빌드 실패
```bash
# Node 모듈 재설치
cd react-app
rm -rf node_modules package-lock.json
npm install
cd ..

# 다시 빌드
./gradlew clean bootJar
```

### 메모리 부족 에러
```bash
# Gradle 빌드 시 메모리 증가
./gradlew bootJar -Dorg.gradle.jvmargs="-Xmx2g"

# JAR 실행 시 메모리 설정
java -Xmx1g -Xms512m -jar build/libs/*.jar
```

### 데이터베이스 연결 실패
- `application.properties`의 데이터베이스 설정 확인
- 방화벽 포트 열림 확인 (MySQL: 3306)
- 데이터베이스 서버 접근 권한 확인

### 정적 리소스 404 에러
- React 빌드가 제대로 되었는지 확인:
  ```bash
  ls -la src/main/resources/static/
  ```
- 없다면 수동으로 빌드:
  ```bash
  ./gradlew copyReactBuild
  ./gradlew bootJar
  ```

## 6. 프로덕션 배포 체크리스트

- [ ] `application.properties`에서 프로덕션 데이터베이스 설정 확인
- [ ] 데이터베이스 비밀번호 환경 변수로 관리
- [ ] 로깅 레벨 적절히 설정 (DEBUG → INFO/WARN)
- [ ] CORS 설정 프로덕션 도메인으로 변경
- [ ] 파일 업로드 경로 설정 확인 (`file.upload.dir`)
- [ ] SSL/TLS 설정 (리버스 프록시 사용 권장)
- [ ] 방화벽 규칙 설정
- [ ] 백업 및 모니터링 설정

## 7. 개발 vs 프로덕션 환경

### 개발 환경
```bash
# React 개발 서버 (http://localhost:3000)
cd react-app
npm start

# Spring Boot 서버 (http://localhost:8081)
./gradlew bootRun
```

### 프로덕션 환경
```bash
# 단일 JAR 파일로 실행
java -jar build/libs/*.jar
# React + Spring Boot 모두 http://localhost:8081에서 서빙
```

## 8. 참고 자료

- [Spring Boot Documentation](https://docs.spring.io/spring-boot/docs/current/reference/html/)
- [Create React App - Deployment](https://create-react-app.dev/docs/deployment/)
- [Gradle Node Plugin](https://github.com/node-gradle/gradle-node-plugin)
