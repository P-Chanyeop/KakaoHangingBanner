package com.mapboard.repository;

import com.mapboard.entity.ButtonLink;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * 버튼 링크 리포지토리
 */
@Repository
public interface ButtonLinkRepository extends JpaRepository<ButtonLink, Long> {

    /**
     * 타입별로 버튼 링크를 조회합니다 (정렬 순서대로).
     *
     * @param type 버튼 타입
     * @return 정렬된 버튼 링크 목록
     */
    List<ButtonLink> findByTypeAndActiveTrueOrderByOrderIndexAsc(String type);

    /**
     * 활성화된 모든 버튼 링크를 조회합니다 (정렬 순서대로).
     *
     * @return 정렬된 버튼 링크 목록
     */
    List<ButtonLink> findByActiveTrueOrderByTypeAscOrderIndexAsc();

    /**
     * 모든 버튼 링크를 조회합니다 (정렬 순서대로).
     *
     * @return 정렬된 버튼 링크 목록
     */
    List<ButtonLink> findAllByOrderByTypeAscOrderIndexAsc();
}
