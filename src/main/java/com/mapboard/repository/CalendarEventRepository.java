package com.mapboard.repository;

import com.mapboard.entity.CalendarEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

/**
 * 캘린더 이벤트 리포지토리
 */
@Repository
public interface CalendarEventRepository extends JpaRepository<CalendarEvent, Long> {

    /**
     * 특정 날짜의 이벤트를 조회합니다.
     *
     * @param eventDate 조회할 날짜
     * @return 해당 날짜의 이벤트 목록
     */
    List<CalendarEvent> findByEventDateOrderByCreatedAtAsc(LocalDate eventDate);

    /**
     * 날짜 범위 내의 이벤트를 조회합니다.
     *
     * @param startDate 시작 날짜
     * @param endDate 종료 날짜
     * @return 날짜 범위 내의 이벤트 목록
     */
    List<CalendarEvent> findByEventDateBetweenOrderByEventDateAscCreatedAtAsc(LocalDate startDate, LocalDate endDate);

    /**
     * 카테고리별로 이벤트를 조회합니다.
     *
     * @param category 카테고리
     * @return 해당 카테고리의 이벤트 목록
     */
    List<CalendarEvent> findByCategoryOrderByEventDateAsc(String category);
}
