package com.mapboard.controller;

import com.mapboard.entity.Stand;
import com.mapboard.service.StandService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 게시대 API 컨트롤러
 * 게시대 관련 REST API 엔드포인트를 제공합니다.
 */
@RestController
@RequestMapping("/api/stands")
@CrossOrigin(origins = "http://localhost:8081", allowCredentials = "false")
public class StandApiController {

    private static final Logger logger = LoggerFactory.getLogger(StandApiController.class);
    private final StandService standService;

    @Autowired
    public StandApiController(StandService standService) {
        this.standService = standService;
        logger.info("StandApiController 초기화됨");
    }

    /**
     * 게시대 목록을 조회합니다.
     * 필터 파라미터를 통해 지역별 또는 반경 내 게시대를 조회할 수 있습니다.
     *
     * @param region 필터링할 지역명 (선택)
     * @param lat 중심 위도 (선택, radius와 함께 사용)
     * @param lng 중심 경도 (선택, radius와 함께 사용)
     * @param radius 반경 km (선택, lat, lng와 함께 사용)
     * @return 게시대 목록
     */
    @GetMapping
    public ResponseEntity<List<Stand>> getAllStands(
            @RequestParam(required = false) String region,
            @RequestParam(required = false) Double lat,
            @RequestParam(required = false) Double lng,
            @RequestParam(required = false) Double radius) {

        logger.info("GET /api/stands 요청 받음. region={}, lat={}, lng={}, radius={}", region, lat, lng, radius);

        List<Stand> stands;

        if (region != null && !region.isEmpty()) {
            stands = standService.getStandsByRegion(region);
        } else if (lat != null && lng != null && radius != null) {
            stands = standService.getStandsWithinRadius(lat, lng, radius);
        } else {
            stands = standService.getAllStands();
        }

        logger.info("총 {}개의 게시대 반환", stands.size());
        return ResponseEntity.ok(stands);
    }

    /**
     * 키워드로 게시대를 검색합니다.
     *
     * @param keyword 검색 키워드 (게시대 이름 또는 주소)
     * @return 검색된 게시대 목록
     */
    @GetMapping("/search")
    public ResponseEntity<List<Stand>> searchStands(@RequestParam String keyword) {
        logger.info("GET /api/stands/search 요청 받음. keyword={}", keyword);
        List<Stand> stands = standService.searchStands(keyword);
        logger.info("검색 결과: {}개의 게시대 반환", stands.size());
        return ResponseEntity.ok(stands);
    }

    /**
     * ID로 특정 게시대를 조회합니다.
     *
     * @param id 조회할 게시대 ID
     * @return 조회된 게시대
     */
    @GetMapping("/{id}")
    public ResponseEntity<Stand> getStandById(@PathVariable Long id) {
        logger.info("GET /api/stands/{} 요청 받음", id);
        Stand stand = standService.getStandById(id);
        return ResponseEntity.ok(stand);
    }

    /**
     * 새로운 게시대를 생성합니다.
     *
     * @param stand 생성할 게시대 정보
     * @return 생성된 게시대와 HTTP 201 Created 상태
     */
    @PostMapping
    public ResponseEntity<Stand> createStand(@RequestBody Stand stand) {
        logger.info("POST /api/stands 요청 받음. 데이터: {}", stand);
        Stand createdStand = standService.createStand(stand);
        logger.info("게시대 생성 완료. ID: {}", createdStand.getId());
        return new ResponseEntity<>(createdStand, HttpStatus.CREATED);
    }

    /**
     * 기존 게시대 정보를 업데이트합니다.
     *
     * @param id 업데이트할 게시대 ID
     * @param standDetails 업데이트할 게시대 정보
     * @return 업데이트된 게시대
     */
    @PutMapping("/{id}")
    public ResponseEntity<Stand> updateStand(@PathVariable Long id, @RequestBody Stand standDetails) {
        logger.info("PUT /api/stands/{} 요청 받음. 데이터: {}", id, standDetails);
        Stand updatedStand = standService.updateStand(id, standDetails);
        logger.info("게시대 업데이트 완료. ID: {}", updatedStand.getId());
        return ResponseEntity.ok(updatedStand);
    }

    /**
     * 게시대를 삭제합니다.
     *
     * @param id 삭제할 게시대 ID
     * @return HTTP 204 No Content 상태
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStand(@PathVariable Long id) {
        logger.info("DELETE /api/stands/{} 요청 받음", id);
        standService.deleteStand(id);
        logger.info("게시대 삭제 완료. ID: {}", id);
        return ResponseEntity.noContent().build();
    }
}
