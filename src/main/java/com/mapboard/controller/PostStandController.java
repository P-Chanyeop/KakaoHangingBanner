package com.mapboard.controller;

import com.mapboard.dto.PostStandDto;
import com.mapboard.service.PostStandService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stands")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") // 개발 환경에서만 사용, 실제 환경에서는 특정 도메인으로 제한
public class PostStandController {
    
    private final PostStandService postStandService;
    
    @GetMapping
    public ResponseEntity<List<PostStandDto>> getAllPostStands(
            @RequestParam(required = false) Double lat,
            @RequestParam(required = false) Double lng,
            @RequestParam(required = false) Double radius,
            @RequestParam(required = false) String region) {
        
        if (lat != null && lng != null && radius != null) {
            return ResponseEntity.ok(postStandService.getPostStandsWithinRadius(lat, lng, radius));
        } else if (region != null && !region.isEmpty()) {
            return ResponseEntity.ok(postStandService.getPostStandsByRegion(region));
        } else {
            return ResponseEntity.ok(postStandService.getAllPostStands());
        }
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<PostStandDto> getPostStandById(@PathVariable Long id) {
        return ResponseEntity.ok(postStandService.getPostStandById(id));
    }
    
    @PostMapping
    public ResponseEntity<PostStandDto> createPostStand(@RequestBody PostStandDto postStandDto) {
        return new ResponseEntity<>(postStandService.createPostStand(postStandDto), HttpStatus.CREATED);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<PostStandDto> updatePostStand(
            @PathVariable Long id, 
            @RequestBody PostStandDto postStandDto) {
        return ResponseEntity.ok(postStandService.updatePostStand(id, postStandDto));
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePostStand(@PathVariable Long id) {
        postStandService.deletePostStand(id);
        return ResponseEntity.noContent().build();
    }
}
