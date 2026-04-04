package com.mapboard.controller;

import com.mapboard.entity.PopupMessage;
import com.mapboard.repository.PopupMessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.util.List;
import java.util.UUID;

/**
 * 팝업 메시지 관리 REST API 컨트롤러
 */
@RestController
@RequestMapping("/api/popup-messages")
public class PopupMessageController {

    @Autowired
    private PopupMessageRepository popupMessageRepository;

    @Value("${file.upload.dir}")
    private String uploadDir;

    @Value("${file.upload.url-prefix}")
    private String urlPrefix;

    @GetMapping
    public List<PopupMessage> getAll() {
        return popupMessageRepository.findAll();
    }

    @GetMapping("/{name}")
    public ResponseEntity<PopupMessage> getByName(@PathVariable String name) {
        return popupMessageRepository.findByName(name)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * 팝업 메시지 저장 (텍스트만)
     */
    @PutMapping("/{name}")
    public PopupMessage save(@PathVariable String name, @RequestBody PopupMessage message) {
        PopupMessage existing = popupMessageRepository.findByName(name).orElse(new PopupMessage());
        existing.setName(name);
        existing.setContent(message.getContent());
        return popupMessageRepository.save(existing);
    }

    /**
     * 팝업 메시지 저장 (텍스트 + 이미지)
     */
    @PostMapping(value = "/{name}/with-image", consumes = "multipart/form-data")
    public ResponseEntity<PopupMessage> saveWithImage(
            @PathVariable String name,
            @RequestParam(value = "content", required = false, defaultValue = "") String content,
            @RequestParam(value = "image", required = false) MultipartFile image) {
        try {
            PopupMessage existing = popupMessageRepository.findByName(name).orElse(new PopupMessage());
            existing.setName(name);
            existing.setContent(content);

            if (image != null && !image.isEmpty()) {
                // 기존 이미지 삭제
                deleteImageFile(existing.getImageUrl());
                existing.setImageUrl(saveImageFile(image));
            }

            return ResponseEntity.ok(popupMessageRepository.save(existing));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 팝업 메시지 이미지 삭제
     */
    @DeleteMapping("/{name}/image")
    public ResponseEntity<PopupMessage> deleteImage(@PathVariable String name) {
        PopupMessage existing = popupMessageRepository.findByName(name).orElse(null);
        if (existing == null) return ResponseEntity.notFound().build();

        deleteImageFile(existing.getImageUrl());
        existing.setImageUrl(null);
        return ResponseEntity.ok(popupMessageRepository.save(existing));
    }

    private String saveImageFile(MultipartFile file) throws Exception {
        File uploadPath = new File(uploadDir);
        if (!uploadPath.exists()) uploadPath.mkdirs();

        String original = file.getOriginalFilename();
        String ext = (original != null && original.contains("."))
                ? original.substring(original.lastIndexOf(".")) : "";
        String filename = System.currentTimeMillis() + "_" + UUID.randomUUID() + ext;

        file.transferTo(new File(uploadDir + filename));
        return urlPrefix + "/" + filename;
    }

    private void deleteImageFile(String imageUrl) {
        if (imageUrl != null && imageUrl.startsWith(urlPrefix + "/")) {
            String filename = imageUrl.substring((urlPrefix + "/").length());
            File file = new File(uploadDir + filename);
            if (file.exists()) file.delete();
        }
    }
}
