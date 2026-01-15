package com.mapboard.controller;

import com.mapboard.entity.PopupMessage;
import com.mapboard.repository.PopupMessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 팝업 메시지 관리 REST API 컨트롤러
 */
@RestController
@RequestMapping("/api/popup-messages")
public class PopupMessageController {

    @Autowired
    private PopupMessageRepository popupMessageRepository;

    /**
     * 모든 팝업 메시지 조회
     * @return 팝업 메시지 리스트
     */
    @GetMapping
    public List<PopupMessage> getAll() {
        return popupMessageRepository.findAll();
    }

    /**
     * 이름으로 팝업 메시지 조회
     * @param name 팝업 메시지 이름
     * @return 팝업 메시지 또는 404
     */
    @GetMapping("/{name}")
    public ResponseEntity<PopupMessage> getByName(@PathVariable String name) {
        return popupMessageRepository.findByName(name)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * 팝업 메시지 생성 또는 수정
     * @param name 팝업 메시지 이름
     * @param message 팝업 메시지 데이터
     * @return 저장된 팝업 메시지
     */
    @PutMapping("/{name}")
    public PopupMessage save(@PathVariable String name, @RequestBody PopupMessage message) {
        PopupMessage existing = popupMessageRepository.findByName(name).orElse(new PopupMessage());
        existing.setName(name);
        existing.setContent(message.getContent());
        return popupMessageRepository.save(existing);
    }
}
