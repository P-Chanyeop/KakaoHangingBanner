package com.mapboard.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 캘린더 이벤트 엔티티
 */
@Entity
@Table(name = "calendar_events")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CalendarEvent {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * 이벤트 제목
     */
    @Column(nullable = false)
    private String title;

    /**
     * 이벤트 내용
     */
    @Column(columnDefinition = "TEXT")
    private String content;

    /**
     * 이벤트 날짜
     */
    @Column(nullable = false)
    private LocalDate eventDate;

    /**
     * 이벤트 카테고리/타입
     * (예: 게시대관리, 렌트비, 공지사항, 메모)
     */
    private String category;

    /**
     * 배경색 (hex 코드)
     */
    private String backgroundColor;

    /**
     * 텍스트 색상 (hex 코드)
     */
    private String textColor;

    /**
     * 완료 여부
     */
    @Column(nullable = false)
    private Boolean completed;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (completed == null) {
            completed = false;
        }
        if (backgroundColor == null) {
            backgroundColor = "#3b82f6";
        }
        if (textColor == null) {
            textColor = "#ffffff";
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
