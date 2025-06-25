package com.mapboard.dto;

import com.mapboard.entity.PostStand;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PostStandDto {
    private Long id;
    private String name;
    private String address;
    private Double latitude;
    private Double longitude;
    private String imageUrl;
    private String description;
    private String region;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    public static PostStandDto fromEntity(PostStand postStand) {
        return PostStandDto.builder()
                .id(postStand.getId())
                .name(postStand.getName())
                .address(postStand.getAddress())
                .latitude(postStand.getLatitude())
                .longitude(postStand.getLongitude())
                .imageUrl(postStand.getImageUrl())
                .description(postStand.getDescription())
                .region(postStand.getRegion())
                .createdAt(postStand.getCreatedAt())
                .updatedAt(postStand.getUpdatedAt())
                .build();
    }
    
    public PostStand toEntity() {
        return PostStand.builder()
                .id(id)
                .name(name)
                .address(address)
                .latitude(latitude)
                .longitude(longitude)
                .imageUrl(imageUrl)
                .description(description)
                .region(region)
                .build();
    }
}
