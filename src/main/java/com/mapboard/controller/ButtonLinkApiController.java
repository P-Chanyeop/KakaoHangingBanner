package com.mapboard.controller;

import com.mapboard.entity.ButtonLink;
import com.mapboard.service.ButtonLinkService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 버튼 링크 API 컨트롤러
 * 버튼 링크 관련 REST API 엔드포인트를 제공합니다.
 */
@RestController
@RequestMapping("/api/button-links")
@CrossOrigin(origins = "http://localhost:8081", allowCredentials = "false")
public class ButtonLinkApiController {

    private static final Logger logger = LoggerFactory.getLogger(ButtonLinkApiController.class);
    private final ButtonLinkService buttonLinkService;

    @Autowired
    public ButtonLinkApiController(ButtonLinkService buttonLinkService) {
        this.buttonLinkService = buttonLinkService;
        logger.info("ButtonLinkApiController 초기화됨");
    }

    /**
     * 모든 버튼 링크를 조회합니다.
     *
     * @param activeOnly 활성화된 버튼만 조회할지 여부
     * @return 버튼 링크 목록
     */
    @GetMapping
    public ResponseEntity<List<ButtonLink>> getAllButtonLinks(
            @RequestParam(required = false, defaultValue = "false") boolean activeOnly) {
        logger.info("GET /api/button-links 요청 받음. activeOnly={}", activeOnly);

        List<ButtonLink> buttonLinks = activeOnly
                ? buttonLinkService.getActiveButtonLinks()
                : buttonLinkService.getAllButtonLinks();

        logger.info("총 {}개의 버튼 링크 반환", buttonLinks.size());
        return ResponseEntity.ok(buttonLinks);
    }

    /**
     * 타입별로 버튼 링크를 조회합니다.
     *
     * @param type 버튼 타입 (orange 또는 green)
     * @return 해당 타입의 버튼 링크 목록
     */
    @GetMapping("/type/{type}")
    public ResponseEntity<List<ButtonLink>> getButtonLinksByType(@PathVariable String type) {
        logger.info("GET /api/button-links/type/{} 요청 받음", type);
        List<ButtonLink> buttonLinks = buttonLinkService.getButtonLinksByType(type);
        logger.info("타입 {}의 버튼 링크 {}개 반환", type, buttonLinks.size());
        return ResponseEntity.ok(buttonLinks);
    }

    /**
     * ID로 특정 버튼 링크를 조회합니다.
     *
     * @param id 조회할 버튼 링크 ID
     * @return 조회된 버튼 링크
     */
    @GetMapping("/{id}")
    public ResponseEntity<ButtonLink> getButtonLinkById(@PathVariable Long id) {
        logger.info("GET /api/button-links/{} 요청 받음", id);
        ButtonLink buttonLink = buttonLinkService.getButtonLinkById(id);
        return ResponseEntity.ok(buttonLink);
    }

    /**
     * 새로운 버튼 링크를 생성합니다.
     *
     * @param buttonLink 생성할 버튼 링크 정보
     * @return 생성된 버튼 링크와 HTTP 201 Created 상태
     */
    @PostMapping
    public ResponseEntity<ButtonLink> createButtonLink(@RequestBody ButtonLink buttonLink) {
        logger.info("POST /api/button-links 요청 받음. 데이터: {}", buttonLink);
        ButtonLink createdButtonLink = buttonLinkService.createButtonLink(buttonLink);
        logger.info("버튼 링크 생성 완료. ID: {}", createdButtonLink.getId());
        return new ResponseEntity<>(createdButtonLink, HttpStatus.CREATED);
    }

    /**
     * 버튼 링크 정보를 업데이트합니다.
     *
     * @param id 업데이트할 버튼 링크 ID
     * @param buttonLinkDetails 업데이트할 버튼 링크 정보
     * @return 업데이트된 버튼 링크
     */
    @PutMapping("/{id}")
    public ResponseEntity<ButtonLink> updateButtonLink(
            @PathVariable Long id,
            @RequestBody ButtonLink buttonLinkDetails) {
        logger.info("PUT /api/button-links/{} 요청 받음. 데이터: {}", id, buttonLinkDetails);
        ButtonLink updatedButtonLink = buttonLinkService.updateButtonLink(id, buttonLinkDetails);
        logger.info("버튼 링크 업데이트 완료. ID: {}", updatedButtonLink.getId());
        return ResponseEntity.ok(updatedButtonLink);
    }

    /**
     * 버튼 링크를 삭제합니다.
     *
     * @param id 삭제할 버튼 링크 ID
     * @return HTTP 204 No Content 상태
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteButtonLink(@PathVariable Long id) {
        logger.info("DELETE /api/button-links/{} 요청 받음", id);
        buttonLinkService.deleteButtonLink(id);
        logger.info("버튼 링크 삭제 완료. ID: {}", id);
        return ResponseEntity.noContent().build();
    }
}
