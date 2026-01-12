package com.mapboard.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 메인 페이지 버튼 링크 엔티티
 */
@Entity
@Table(name = "button_links")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ButtonLink {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * 버튼 이름
     */
    @Column(nullable = false)
    private String name;

    /**
     * 버튼 링크 URL
     */
    @Column(nullable = false)
    private String url;

    /**
     * 버튼 타입 (orange: 경북협회, green: 경남협회)
     */
    @Column(nullable = false)
    private String type;

    /**
     * 아이콘 클래스 (Font Awesome)
     */
    @Column(nullable = false)
    private String iconClass;

    /**
     * 정렬 순서
     */
    @Column(nullable = false)
    private Integer orderIndex;

    /**
     * 활성화 여부
     */
    @Column(nullable = false)
    private Boolean active;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (active == null) {
            active = true;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
