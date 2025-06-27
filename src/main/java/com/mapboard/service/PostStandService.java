package com.mapboard.service;

import com.mapboard.dto.PostStandDto;
import com.mapboard.entity.PostStand;
import com.mapboard.entity.Stand;
import com.mapboard.repository.StandRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class PostStandService {
    
    private final StandRepository standRepository;
    
    @Autowired
    public PostStandService(StandRepository standRepository) {
        this.standRepository = standRepository;
    }
    
    @Transactional(readOnly = true)
    public List<PostStandDto> getAllPostStands() {
        return standRepository.findAll().stream()
                .map(this::convertToPostStandDto)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public PostStandDto getPostStandById(Long id) {
        Stand stand = standRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("게시대를 찾을 수 없습니다. ID: " + id));
        return convertToPostStandDto(stand);
    }
    
    @Transactional(readOnly = true)
    public List<PostStandDto> getPostStandsByRegion(String region) {
        return standRepository.findByRegion(region).stream()
                .map(this::convertToPostStandDto)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public List<PostStandDto> getPostStandsWithinRadius(double lat, double lng, double radiusKm) {
        return standRepository.findWithinRadius(lat, lng, radiusKm).stream()
                .map(this::convertToPostStandDto)
                .collect(Collectors.toList());
    }
    
    @Transactional
    public PostStandDto createPostStand(PostStandDto postStandDto) {
        Stand stand = convertToStand(postStandDto);
        Stand savedStand = standRepository.save(stand);
        return convertToPostStandDto(savedStand);
    }
    
    @Transactional
    public PostStandDto updatePostStand(Long id, PostStandDto postStandDto) {
        Stand existingStand = standRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("게시대를 찾을 수 없습니다. ID: " + id));
        
        existingStand.setName(postStandDto.getName());
        existingStand.setAddress(postStandDto.getAddress());
        existingStand.setLatitude(postStandDto.getLatitude());
        existingStand.setLongitude(postStandDto.getLongitude());
        existingStand.setImageUrl(postStandDto.getImageUrl());
        existingStand.setDescription(postStandDto.getDescription());
        existingStand.setRegion(postStandDto.getRegion());
        
        Stand updatedStand = standRepository.save(existingStand);
        return convertToPostStandDto(updatedStand);
    }
    
    @Transactional
    public void deletePostStand(Long id) {
        standRepository.deleteById(id);
    }
    
    // Stand -> PostStandDto 변환
    private PostStandDto convertToPostStandDto(Stand stand) {
        return PostStandDto.builder()
                .id(stand.getId())
                .name(stand.getName())
                .address(stand.getAddress())
                .latitude(stand.getLatitude())
                .longitude(stand.getLongitude())
                .imageUrl(stand.getImageUrl())
                .description(stand.getDescription())
                .region(stand.getRegion())
                .createdAt(stand.getCreatedAt())
                .updatedAt(stand.getUpdatedAt())
                .build();
    }
    
    // PostStandDto -> Stand 변환
    private Stand convertToStand(PostStandDto dto) {
        Stand stand = new Stand();
        stand.setId(dto.getId());
        stand.setName(dto.getName());
        stand.setAddress(dto.getAddress());
        stand.setLatitude(dto.getLatitude());
        stand.setLongitude(dto.getLongitude());
        stand.setImageUrl(dto.getImageUrl());
        stand.setDescription(dto.getDescription());
        stand.setRegion(dto.getRegion());
        return stand;
    }
}
