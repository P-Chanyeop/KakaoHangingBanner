package com.mapboard.service;

import com.mapboard.entity.CalendarEvent;
import com.mapboard.repository.CalendarEventRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

/**
 * 캘린더 이벤트 관리 서비스
 * 캘린더 이벤트의 생성, 조회, 수정, 삭제 기능을 제공합니다.
 */
@Service
public class CalendarEventService {

    private final CalendarEventRepository calendarEventRepository;

    @Autowired
    public CalendarEventService(CalendarEventRepository calendarEventRepository) {
        this.calendarEventRepository = calendarEventRepository;
    }

    /**
     * 모든 캘린더 이벤트를 조회합니다.
     *
     * @return 모든 캘린더 이벤트 목록
     */
    @Transactional(readOnly = true)
    public List<CalendarEvent> getAllEvents() {
        return calendarEventRepository.findAll();
    }

    /**
     * ID로 캘린더 이벤트를 조회합니다.
     *
     * @param id 조회할 이벤트 ID
     * @return 조회된 캘린더 이벤트
     * @throws EntityNotFoundException 이벤트를 찾을 수 없는 경우
     */
    @Transactional(readOnly = true)
    public CalendarEvent getEventById(Long id) {
        return calendarEventRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("캘린더 이벤트를 찾을 수 없습니다. ID: " + id));
    }

    /**
     * 특정 날짜의 이벤트를 조회합니다.
     *
     * @param date 조회할 날짜
     * @return 해당 날짜의 이벤트 목록
     */
    @Transactional(readOnly = true)
    public List<CalendarEvent> getEventsByDate(LocalDate date) {
        return calendarEventRepository.findByEventDateOrderByCreatedAtAsc(date);
    }

    /**
     * 날짜 범위 내의 이벤트를 조회합니다.
     *
     * @param startDate 시작 날짜
     * @param endDate 종료 날짜
     * @return 날짜 범위 내의 이벤트 목록
     */
    @Transactional(readOnly = true)
    public List<CalendarEvent> getEventsByDateRange(LocalDate startDate, LocalDate endDate) {
        return calendarEventRepository.findByEventDateBetweenOrderByEventDateAscCreatedAtAsc(startDate, endDate);
    }

    /**
     * 카테고리별로 이벤트를 조회합니다.
     *
     * @param category 카테고리
     * @return 해당 카테고리의 이벤트 목록
     */
    @Transactional(readOnly = true)
    public List<CalendarEvent> getEventsByCategory(String category) {
        return calendarEventRepository.findByCategoryOrderByEventDateAsc(category);
    }

    /**
     * 새로운 캘린더 이벤트를 생성합니다.
     *
     * @param event 생성할 이벤트 정보
     * @return 생성된 캘린더 이벤트
     */
    @Transactional
    public CalendarEvent createEvent(CalendarEvent event) {
        return calendarEventRepository.save(event);
    }

    /**
     * 캘린더 이벤트 정보를 업데이트합니다.
     *
     * @param id 업데이트할 이벤트 ID
     * @param eventDetails 업데이트할 이벤트 정보
     * @return 업데이트된 캘린더 이벤트
     * @throws EntityNotFoundException 이벤트를 찾을 수 없는 경우
     */
    @Transactional
    public CalendarEvent updateEvent(Long id, CalendarEvent eventDetails) {
        CalendarEvent event = getEventById(id);

        event.setTitle(eventDetails.getTitle());
        event.setContent(eventDetails.getContent());
        event.setEventDate(eventDetails.getEventDate());
        event.setCategory(eventDetails.getCategory());
        event.setBackgroundColor(eventDetails.getBackgroundColor());
        event.setTextColor(eventDetails.getTextColor());
        event.setCompleted(eventDetails.getCompleted());

        return calendarEventRepository.save(event);
    }

    /**
     * 캘린더 이벤트를 삭제합니다.
     *
     * @param id 삭제할 이벤트 ID
     * @throws EntityNotFoundException 이벤트를 찾을 수 없는 경우
     */
    @Transactional
    public void deleteEvent(Long id) {
        CalendarEvent event = getEventById(id);
        calendarEventRepository.delete(event);
    }

    /**
     * 이벤트의 완료 상태를 토글합니다.
     *
     * @param id 토글할 이벤트 ID
     * @return 업데이트된 캘린더 이벤트
     * @throws EntityNotFoundException 이벤트를 찾을 수 없는 경우
     */
    @Transactional
    public CalendarEvent toggleComplete(Long id) {
        CalendarEvent event = getEventById(id);
        event.setCompleted(!event.getCompleted());
        return calendarEventRepository.save(event);
    }
}
