package com.mapboard.service;

import com.mapboard.entity.ButtonLink;
import com.mapboard.repository.ButtonLinkRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * 버튼 링크 관리 서비스
 * 메인 페이지의 버튼 링크를 관리합니다.
 */
@Service
public class ButtonLinkService {

    private final ButtonLinkRepository buttonLinkRepository;

    @Autowired
    public ButtonLinkService(ButtonLinkRepository buttonLinkRepository) {
        this.buttonLinkRepository = buttonLinkRepository;
    }

    /**
     * 모든 버튼 링크를 조회합니다.
     *
     * @return 모든 버튼 링크 목록
     */
    @Transactional(readOnly = true)
    public List<ButtonLink> getAllButtonLinks() {
        return buttonLinkRepository.findAllByOrderByTypeAscOrderIndexAsc();
    }

    /**
     * 활성화된 버튼 링크만 조회합니다.
     *
     * @return 활성화된 버튼 링크 목록
     */
    @Transactional(readOnly = true)
    public List<ButtonLink> getActiveButtonLinks() {
        return buttonLinkRepository.findByActiveTrueOrderByTypeAscOrderIndexAsc();
    }

    /**
     * 타입별로 활성화된 버튼 링크를 조회합니다.
     *
     * @param type 버튼 타입 (orange 또는 green)
     * @return 해당 타입의 활성화된 버튼 링크 목록
     */
    @Transactional(readOnly = true)
    public List<ButtonLink> getButtonLinksByType(String type) {
        return buttonLinkRepository.findByTypeAndActiveTrueOrderByOrderIndexAsc(type);
    }

    /**
     * ID로 버튼 링크를 조회합니다.
     *
     * @param id 버튼 링크 ID
     * @return 조회된 버튼 링크
     * @throws EntityNotFoundException 버튼 링크를 찾을 수 없는 경우
     */
    @Transactional(readOnly = true)
    public ButtonLink getButtonLinkById(Long id) {
        return buttonLinkRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("버튼 링크를 찾을 수 없습니다. ID: " + id));
    }

    /**
     * 새로운 버튼 링크를 생성합니다.
     *
     * @param buttonLink 생성할 버튼 링크 정보
     * @return 생성된 버튼 링크
     */
    @Transactional
    public ButtonLink createButtonLink(ButtonLink buttonLink) {
        return buttonLinkRepository.save(buttonLink);
    }

    /**
     * 버튼 링크 정보를 업데이트합니다.
     *
     * @param id 업데이트할 버튼 링크 ID
     * @param buttonLinkDetails 업데이트할 버튼 링크 정보
     * @return 업데이트된 버튼 링크
     * @throws EntityNotFoundException 버튼 링크를 찾을 수 없는 경우
     */
    @Transactional
    public ButtonLink updateButtonLink(Long id, ButtonLink buttonLinkDetails) {
        ButtonLink buttonLink = getButtonLinkById(id);

        buttonLink.setName(buttonLinkDetails.getName());
        buttonLink.setUrl(buttonLinkDetails.getUrl());
        buttonLink.setType(buttonLinkDetails.getType());
        buttonLink.setIconClass(buttonLinkDetails.getIconClass());
        buttonLink.setOrderIndex(buttonLinkDetails.getOrderIndex());
        buttonLink.setActive(buttonLinkDetails.getActive());

        return buttonLinkRepository.save(buttonLink);
    }

    /**
     * 버튼 링크를 삭제합니다.
     *
     * @param id 삭제할 버튼 링크 ID
     * @throws EntityNotFoundException 버튼 링크를 찾을 수 없는 경우
     */
    @Transactional
    public void deleteButtonLink(Long id) {
        ButtonLink buttonLink = getButtonLinkById(id);
        buttonLinkRepository.delete(buttonLink);
    }
}
