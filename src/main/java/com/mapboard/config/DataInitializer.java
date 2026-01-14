package com.mapboard.config;

import com.mapboard.entity.User;
import com.mapboard.service.UserService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

import java.security.SecureRandom;

/**
 * 초기 데이터 설정
 * 애플리케이션 시작 시 관리자 계정 자동 생성
 */
@Component
@RequiredArgsConstructor
public class DataInitializer implements ApplicationRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);
    private final UserService userService;

    @Override
    public void run(ApplicationArguments args) {
        createAdminAccount();
    }

    /**
     * 관리자 계정 생성
     */
    private void createAdminAccount() {
        String adminUsername = "admin";

        // 이미 관리자 계정이 있으면 스킵
        if (userService.existsByUsername(adminUsername)) {
            logger.info("관리자 계정이 이미 존재합니다: {}", adminUsername);
            return;
        }

        // 랜덤 비밀번호 생성 (12자리)
        String randomPassword = generateRandomPassword(12);

        try {
            // 관리자 계정 생성
            User admin = userService.createUser(adminUsername, randomPassword, User.Role.ADMIN);

            logger.info("╔═══════════════════════════════════════════════════════════╗");
            logger.info("║           관리자 계정이 생성되었습니다!                      ║");
            logger.info("╠═══════════════════════════════════════════════════════════╣");
            logger.info("║  아이디: {}                                         ║", adminUsername);
            logger.info("║  비밀번호: {}                              ║", randomPassword);
            logger.info("╠═══════════════════════════════════════════════════════════╣");
            logger.info("║  ⚠️  이 비밀번호를 안전한 곳에 보관하세요!                 ║");
            logger.info("║  ⚠️  서버 재시작 시 비밀번호는 변경되지 않습니다.          ║");
            logger.info("╚═══════════════════════════════════════════════════════════╝");

        } catch (Exception e) {
            logger.error("관리자 계정 생성 실패", e);
        }
    }

    /**
     * 랜덤 비밀번호 생성
     * 영문 대소문자, 숫자, 특수문자 포함
     */
    private String generateRandomPassword(int length) {
        String upperCase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        String lowerCase = "abcdefghijklmnopqrstuvwxyz";
        String digits = "0123456789";
        String specialChars = "!@#$%^&*";

        String allChars = upperCase + lowerCase + digits + specialChars;

        SecureRandom random = new SecureRandom();
        StringBuilder password = new StringBuilder();

        // 각 카테고리에서 최소 1개씩 포함
        password.append(upperCase.charAt(random.nextInt(upperCase.length())));
        password.append(lowerCase.charAt(random.nextInt(lowerCase.length())));
        password.append(digits.charAt(random.nextInt(digits.length())));
        password.append(specialChars.charAt(random.nextInt(specialChars.length())));

        // 나머지 랜덤 문자 추가
        for (int i = 4; i < length; i++) {
            password.append(allChars.charAt(random.nextInt(allChars.length())));
        }

        // 문자열 섞기
        char[] passwordArray = password.toString().toCharArray();
        for (int i = passwordArray.length - 1; i > 0; i--) {
            int j = random.nextInt(i + 1);
            char temp = passwordArray[i];
            passwordArray[i] = passwordArray[j];
            passwordArray[j] = temp;
        }

        return new String(passwordArray);
    }
}
