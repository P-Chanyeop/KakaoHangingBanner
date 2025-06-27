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

    @GetMapping("/{id}")
    public ResponseEntity<Stand> getStandById(@PathVariable Long id) {
        logger.info("GET /api/stands/{} 요청 받음", id);
        Stand stand = standService.getStandById(id);
        return ResponseEntity.ok(stand);
    }

    @PostMapping
    public ResponseEntity<Stand> createStand(@RequestBody Stand stand) {
        logger.info("POST /api/stands 요청 받음. 데이터: {}", stand);
        Stand createdStand = standService.createStand(stand);
        logger.info("게시대 생성 완료. ID: {}", createdStand.getId());
        return new ResponseEntity<>(createdStand, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Stand> updateStand(@PathVariable Long id, @RequestBody Stand standDetails) {
        logger.info("PUT /api/stands/{} 요청 받음. 데이터: {}", id, standDetails);
        Stand updatedStand = standService.updateStand(id, standDetails);
        logger.info("게시대 업데이트 완료. ID: {}", updatedStand.getId());
        return ResponseEntity.ok(updatedStand);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStand(@PathVariable Long id) {
        logger.info("DELETE /api/stands/{} 요청 받음", id);
        standService.deleteStand(id);
        logger.info("게시대 삭제 완료. ID: {}", id);
        return ResponseEntity.noContent().build();
    }
}
