package com.mapboard.repository;

import com.mapboard.entity.PopupMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

/**
 * 팝업 메시지 데이터 액세스 레포지토리
 */
public interface PopupMessageRepository extends JpaRepository<PopupMessage, Long> {
    /**
     * 이름으로 팝업 메시지 조회
     * @param name 팝업 메시지 이름 (webhard, notice)
     * @return 팝업 메시지 Optional 객체
     */
    Optional<PopupMessage> findByName(String name);
}
