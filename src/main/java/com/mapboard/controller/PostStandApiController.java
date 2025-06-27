package com.mapboard.controller;

import com.mapboard.dto.PostStandDto;
import com.mapboard.service.PostStandService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

// 컨트롤러 비활성화
//@Controller
//@RequestMapping("/api/stands")
public class PostStandApiController {

    private final PostStandService postStandService;

    @Autowired
    public PostStandApiController(PostStandService postStandService) {
        this.postStandService = postStandService;
    }

    //@GetMapping
    public ResponseEntity<List<PostStandDto>> getPostStands(
            @RequestParam(required = false) Double lat,
            @RequestParam(required = false) Double lng,
            @RequestParam(required = false) Double radius,
            @RequestParam(required = false) String region) {
        
        try {
            List<PostStandDto> postStands;
            
            if (lat != null && lng != null && radius != null) {
                postStands = postStandService.getPostStandsWithinRadius(lat, lng, radius);
            } else if (region != null && !region.isEmpty()) {
                postStands = postStandService.getPostStandsByRegion(region);
            } else {
                postStands = postStandService.getAllPostStands();
            }
            
            return ResponseEntity.ok(postStands);
        } catch (Exception e) {
            // 개발 환경에서는 더미 데이터 반환
            return ResponseEntity.ok(generateDummyData());
        }
    }

    //@GetMapping("/{id}")
    public ResponseEntity<PostStandDto> getPostStandById(@PathVariable Long id) {
        try {
            PostStandDto postStand = postStandService.getPostStandById(id);
            return ResponseEntity.ok(postStand);
        } catch (Exception e) {
            // 개발 환경에서는 더미 데이터 반환
            List<PostStandDto> dummyData = generateDummyData();
            for (PostStandDto dto : dummyData) {
                if (dto.getId().equals(id)) {
                    return ResponseEntity.ok(dto);
                }
            }
            return ResponseEntity.notFound().build();
        }
    }

    //@PostMapping
    public ResponseEntity<PostStandDto> createPostStand(@RequestBody PostStandDto postStandDto) {
        try {
            PostStandDto createdPostStand = postStandService.createPostStand(postStandDto);
            return new ResponseEntity<>(createdPostStand, HttpStatus.CREATED);
        } catch (Exception e) {
            // 개발 환경에서는 더미 응답 반환
            postStandDto.setId(999L); // 임의의 ID 설정
            return new ResponseEntity<>(postStandDto, HttpStatus.CREATED);
        }
    }

    //@PutMapping("/{id}")
    public ResponseEntity<PostStandDto> updatePostStand(
            @PathVariable Long id, 
            @RequestBody PostStandDto postStandDto) {
        try {
            postStandDto.setId(id);
            PostStandDto updatedPostStand = postStandService.updatePostStand(id, postStandDto);
            return ResponseEntity.ok(updatedPostStand);
        } catch (Exception e) {
            // 개발 환경에서는 더미 응답 반환
            postStandDto.setId(id);
            return ResponseEntity.ok(postStandDto);
        }
    }

    //@DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePostStand(@PathVariable Long id) {
        try {
            postStandService.deletePostStand(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            // 개발 환경에서도 성공 응답 반환
            return ResponseEntity.noContent().build();
        }
    }
    
    // 개발 환경용 더미 데이터 생성
    private List<PostStandDto> generateDummyData() {
        List<PostStandDto> dummyData = new ArrayList<>();
        String bannerImageUrl = "/images/bannerPin.png";
        
        // 대구 지역 더미 데이터
        PostStandDto stand1 = new PostStandDto();
        stand1.setId(1L);
        stand1.setName("대구 중구 게시대");
        stand1.setAddress("대구 중구 동성로");
        stand1.setLatitude(35.8691);
        stand1.setLongitude(128.5975);
        stand1.setRegion("대구");
        stand1.setImageUrl(bannerImageUrl);
        stand1.setDescription("대구 중구 동성로 인근 게시대입니다.");
        dummyData.add(stand1);
        
        PostStandDto stand2 = new PostStandDto();
        stand2.setId(2L);
        stand2.setName("대구 수성구 게시대");
        stand2.setAddress("대구 수성구 범어동");
        stand2.setLatitude(35.8582);
        stand2.setLongitude(128.6309);
        stand2.setRegion("대구");
        stand2.setImageUrl(bannerImageUrl);
        stand2.setDescription("대구 수성구 범어동 인근 게시대입니다.");
        dummyData.add(stand2);
        
        // 경북 지역 더미 데이터
        PostStandDto stand3 = new PostStandDto();
        stand3.setId(3L);
        stand3.setName("경북 포항시 게시대");
        stand3.setAddress("경북 포항시 남구 연일읍");
        stand3.setLatitude(36.0199);
        stand3.setLongitude(129.3434);
        stand3.setRegion("경북");
        stand3.setImageUrl(bannerImageUrl);
        stand3.setDescription("경북 포항시 남구 연일읍 인근 게시대입니다.");
        dummyData.add(stand3);
        
        PostStandDto stand4 = new PostStandDto();
        stand4.setId(4L);
        stand4.setName("경북 경주시 게시대");
        stand4.setAddress("경북 경주시 황남동");
        stand4.setLatitude(35.8562);
        stand4.setLongitude(129.2246);
        stand4.setRegion("경북");
        stand4.setImageUrl(bannerImageUrl);
        stand4.setDescription("경북 경주시 황남동 인근 게시대입니다.");
        dummyData.add(stand4);
        
        // 경남 지역 더미 데이터
        PostStandDto stand5 = new PostStandDto();
        stand5.setId(5L);
        stand5.setName("경남 창원시 게시대");
        stand5.setAddress("경남 창원시 의창구");
        stand5.setLatitude(35.2540);
        stand5.setLongitude(128.6411);
        stand5.setRegion("경남");
        stand5.setImageUrl(bannerImageUrl);
        stand5.setDescription("경남 창원시 의창구 인근 게시대입니다.");
        dummyData.add(stand5);
        
        PostStandDto stand6 = new PostStandDto();
        stand6.setId(6L);
        stand6.setName("경남 진주시 게시대");
        stand6.setAddress("경남 진주시 평거동");
        stand6.setLatitude(35.1795);
        stand6.setLongitude(128.1076);
        stand6.setRegion("경남");
        stand6.setImageUrl(bannerImageUrl);
        stand6.setDescription("경남 진주시 평거동 인근 게시대입니다.");
        dummyData.add(stand6);
        
        return dummyData;
    }
}
