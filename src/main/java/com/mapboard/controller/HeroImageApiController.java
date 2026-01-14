package com.mapboard.controller;

import com.mapboard.entity.HeroImage;
import com.mapboard.service.HeroImageService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.util.List;
import java.util.UUID;

/**
 * Hero 이미지 API 컨트롤러
 */
@RestController
@RequestMapping("/api/hero-images")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class HeroImageApiController {

    private static final Logger logger = LoggerFactory.getLogger(HeroImageApiController.class);
    
    private final HeroImageService heroImageService;
    
    @Value("${file.upload.dir}")
    private String uploadDir;
    
    @Value("${file.upload.url-prefix}")
    private String urlPrefix;

    /**
     * 모든 Hero 이미지를 조회합니다.
     *
     * @return Hero 이미지 목록
     */
    @GetMapping
    public ResponseEntity<List<HeroImage>> getAllHeroImages() {
        logger.info("GET /api/hero-images 요청 받음");
        List<HeroImage> heroImages = heroImageService.getAllHeroImages();
        return ResponseEntity.ok(heroImages);
    }

    /**
     * 이름으로 Hero 이미지를 조회합니다.
     *
     * @param name Hero 이미지 이름 (hero1, hero2)
     * @return Hero 이미지
     */
    @GetMapping("/{name}")
    public ResponseEntity<HeroImage> getHeroImageByName(@PathVariable String name) {
        logger.info("GET /api/hero-images/{} 요청 받음", name);
        HeroImage heroImage = heroImageService.getHeroImageByName(name);
        if (heroImage == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(heroImage);
    }

    /**
     * Hero 이미지를 업로드하고 저장합니다.
     *
     * @param name Hero 이미지 이름 (hero1, hero2)
     * @param image 업로드할 이미지 파일
     * @return 저장된 Hero 이미지
     */
    @PostMapping(value = "/{name}", consumes = "multipart/form-data")
    public ResponseEntity<HeroImage> uploadHeroImage(
            @PathVariable String name,
            @RequestParam("image") MultipartFile image) {
        
        logger.info("POST /api/hero-images/{} 요청 받음", name);
        
        try {
            // 이미지 파일 저장
            String imageUrl = saveImageFile(image);
            
            // 기존 이미지 삭제
            HeroImage existingImage = heroImageService.getHeroImageByName(name);
            if (existingImage != null && existingImage.getImageUrl() != null) {
                deleteImageFile(existingImage.getImageUrl());
            }
            
            // Hero 이미지 저장
            HeroImage heroImage = heroImageService.saveOrUpdateHeroImage(name, imageUrl);
            logger.info("Hero 이미지 저장 완료: {}", name);
            
            return ResponseEntity.ok(heroImage);
            
        } catch (Exception e) {
            logger.error("Hero 이미지 업로드 실패", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * 이미지 파일을 저장하고 URL을 반환합니다.
     *
     * @param file 업로드된 이미지 파일
     * @return 저장된 파일의 URL
     * @throws Exception 파일 저장 실패 시
     */
    private String saveImageFile(MultipartFile file) throws Exception {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("파일이 비어있습니다.");
        }
        
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("이미지 파일만 업로드 가능합니다.");
        }
        
        if (file.getSize() > 5 * 1024 * 1024) {
            throw new IllegalArgumentException("파일 크기는 5MB 이하여야 합니다.");
        }
        
        File uploadPath = new File(uploadDir);
        if (!uploadPath.exists()) {
            uploadPath.mkdirs();
        }
        
        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        
        String filename = System.currentTimeMillis() + "_" + UUID.randomUUID().toString() + extension;
        String filePath = uploadDir + filename;
        
        File dest = new File(filePath);
        file.transferTo(dest);
        
        return urlPrefix + "/" + filename;
    }

    /**
     * 이미지 파일을 삭제합니다.
     *
     * @param imageUrl 삭제할 이미지 URL
     */
    private void deleteImageFile(String imageUrl) {
        if (imageUrl != null && imageUrl.startsWith(urlPrefix + "/")) {
            String filename = imageUrl.substring((urlPrefix + "/").length());
            File file = new File(uploadDir + filename);
            if (file.exists()) {
                file.delete();
                logger.info("기존 이미지 파일 삭제: {}", filename);
            }
        }
    }
}
