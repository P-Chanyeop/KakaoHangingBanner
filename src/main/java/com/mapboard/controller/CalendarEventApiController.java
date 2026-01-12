package com.mapboard.controller;

import com.mapboard.entity.CalendarEvent;
import com.mapboard.service.CalendarEventService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

/**
 * 캘린더 이벤트 API 컨트롤러
 * 캘린더 이벤트 관련 REST API 엔드포인트를 제공합니다.
 */
@RestController
@RequestMapping("/api/calendar-events")
@CrossOrigin(origins = "http://localhost:8081", allowCredentials = "false")
public class CalendarEventApiController {

    private static final Logger logger = LoggerFactory.getLogger(CalendarEventApiController.class);
    private final CalendarEventService calendarEventService;

    @Autowired
    public CalendarEventApiController(CalendarEventService calendarEventService) {
        this.calendarEventService = calendarEventService;
        logger.info("CalendarEventApiController 초기화됨");
    }

    /**
     * 모든 캘린더 이벤트를 조회합니다.
     *
     * @return 캘린더 이벤트 목록
     */
    @GetMapping
    public ResponseEntity<List<CalendarEvent>> getAllEvents() {
        logger.info("GET /api/calendar-events 요청 받음");
        List<CalendarEvent> events = calendarEventService.getAllEvents();
        logger.info("총 {}개의 이벤트 반환", events.size());
        return ResponseEntity.ok(events);
    }

    /**
     * 특정 날짜의 이벤트를 조회합니다.
     *
     * @param date 조회할 날짜 (yyyy-MM-dd)
     * @return 해당 날짜의 이벤트 목록
     */
    @GetMapping("/date/{date}")
    public ResponseEntity<List<CalendarEvent>> getEventsByDate(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        logger.info("GET /api/calendar-events/date/{} 요청 받음", date);
        List<CalendarEvent> events = calendarEventService.getEventsByDate(date);
        logger.info("날짜 {}의 이벤트 {}개 반환", date, events.size());
        return ResponseEntity.ok(events);
    }

    /**
     * 날짜 범위 내의 이벤트를 조회합니다.
     *
     * @param startDate 시작 날짜 (yyyy-MM-dd)
     * @param endDate 종료 날짜 (yyyy-MM-dd)
     * @return 날짜 범위 내의 이벤트 목록
     */
    @GetMapping("/range")
    public ResponseEntity<List<CalendarEvent>> getEventsByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        logger.info("GET /api/calendar-events/range 요청 받음. startDate={}, endDate={}", startDate, endDate);
        List<CalendarEvent> events = calendarEventService.getEventsByDateRange(startDate, endDate);
        logger.info("날짜 범위 내 이벤트 {}개 반환", events.size());
        return ResponseEntity.ok(events);
    }

    /**
     * ID로 특정 이벤트를 조회합니다.
     *
     * @param id 조회할 이벤트 ID
     * @return 조회된 이벤트
     */
    @GetMapping("/{id}")
    public ResponseEntity<CalendarEvent> getEventById(@PathVariable Long id) {
        logger.info("GET /api/calendar-events/{} 요청 받음", id);
        CalendarEvent event = calendarEventService.getEventById(id);
        return ResponseEntity.ok(event);
    }

    /**
     * 새로운 캘린더 이벤트를 생성합니다.
     *
     * @param event 생성할 이벤트 정보
     * @return 생성된 이벤트와 HTTP 201 Created 상태
     */
    @PostMapping
    public ResponseEntity<CalendarEvent> createEvent(@RequestBody CalendarEvent event) {
        logger.info("POST /api/calendar-events 요청 받음. 데이터: {}", event);
        CalendarEvent createdEvent = calendarEventService.createEvent(event);
        logger.info("이벤트 생성 완료. ID: {}", createdEvent.getId());
        return new ResponseEntity<>(createdEvent, HttpStatus.CREATED);
    }

    /**
     * 이벤트 정보를 업데이트합니다.
     *
     * @param id 업데이트할 이벤트 ID
     * @param eventDetails 업데이트할 이벤트 정보
     * @return 업데이트된 이벤트
     */
    @PutMapping("/{id}")
    public ResponseEntity<CalendarEvent> updateEvent(
            @PathVariable Long id,
            @RequestBody CalendarEvent eventDetails) {
        logger.info("PUT /api/calendar-events/{} 요청 받음. 데이터: {}", id, eventDetails);
        CalendarEvent updatedEvent = calendarEventService.updateEvent(id, eventDetails);
        logger.info("이벤트 업데이트 완료. ID: {}", updatedEvent.getId());
        return ResponseEntity.ok(updatedEvent);
    }

    /**
     * 이벤트를 삭제합니다.
     *
     * @param id 삭제할 이벤트 ID
     * @return HTTP 204 No Content 상태
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEvent(@PathVariable Long id) {
        logger.info("DELETE /api/calendar-events/{} 요청 받음", id);
        calendarEventService.deleteEvent(id);
        logger.info("이벤트 삭제 완료. ID: {}", id);
        return ResponseEntity.noContent().build();
    }

    /**
     * 이벤트의 완료 상태를 토글합니다.
     *
     * @param id 토글할 이벤트 ID
     * @return 업데이트된 이벤트
     */
    @PatchMapping("/{id}/toggle-complete")
    public ResponseEntity<CalendarEvent> toggleComplete(@PathVariable Long id) {
        logger.info("PATCH /api/calendar-events/{}/toggle-complete 요청 받음", id);
        CalendarEvent updatedEvent = calendarEventService.toggleComplete(id);
        logger.info("이벤트 완료 상태 토글 완료. ID: {}, completed: {}", updatedEvent.getId(), updatedEvent.getCompleted());
        return ResponseEntity.ok(updatedEvent);
    }
}
