package com.mapboard.config;

import com.mapboard.entity.User;
import com.mapboard.service.UserService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

/**
 * 초기 데이터 설정
 * 애플리케이션 시작 시 관리자 계정 자동 생성
 */
@Component
@RequiredArgsConstructor
public class DataInitializer implements ApplicationRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);
    private final UserService userService;

    // 관리자 계정 정보 (application.properties에서 설정)
    @Value("${admin.username}")
    private String adminUsername;

    @Value("${admin.password}")
    private String adminPassword;

    @Override
    public void run(ApplicationArguments args) {
        createAdminAccount();
    }

    /**
     * 관리자 계정 생성
     */
    private void createAdminAccount() {
        // 이미 관리자 계정이 있으면 스킵
        if (userService.existsByUsername(adminUsername)) {
            logger.info("관리자 계정이 이미 존재합니다: {}", adminUsername);
            return;
        }

        try {
            // 관리자 계정 생성 (BCrypt로 암호화되어 저장됨)
            User admin = userService.createUser(adminUsername, adminPassword, User.Role.ADMIN);

            logger.info("╔═══════════════════════════════════════════════════════════╗");
            logger.info("║           관리자 계정이 생성되었습니다!                      ║");
            logger.info("╠═══════════════════════════════════════════════════════════╣");
            logger.info("║  아이디: {}                                         ║", adminUsername);
            logger.info("║  비밀번호: {}                              ║", adminPassword);
            logger.info("╠═══════════════════════════════════════════════════════════╣");
            logger.info("║  ✅ 비밀번호는 BCrypt로 암호화되어 DB에 저장됩니다.        ║");
            logger.info("║  ⚙️  설정 위치: application.properties                    ║");
            logger.info("╚═══════════════════════════════════════════════════════════╝");

        } catch (Exception e) {
            logger.error("관리자 계정 생성 실패", e);
        }
    }
}
