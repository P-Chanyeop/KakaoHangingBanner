package com.mapboard.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "popup_messages")
@Data
public class PopupMessage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name; // "webhard" or "notice"

    @Column(columnDefinition = "TEXT")
    private String content;
}
