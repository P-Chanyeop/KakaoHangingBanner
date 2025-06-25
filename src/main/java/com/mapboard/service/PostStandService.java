package com.mapboard.service;

import com.mapboard.dto.PostStandDto;
import com.mapboard.entity.PostStand;
import com.mapboard.repository.PostStandRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PostStandService {
    
    private final PostStandRepository postStandRepository;
    
    @Transactional(readOnly = true)
    public List<PostStandDto> getAllPostStands() {
        return postStandRepository.findAll().stream()
                .map(PostStandDto::fromEntity)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public PostStandDto getPostStandById(Long id) {
        PostStand postStand = postStandRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("게시대를 찾을 수 없습니다. ID: " + id));
        return PostStandDto.fromEntity(postStand);
    }
    
    @Transactional(readOnly = true)
    public List<PostStandDto> getPostStandsByRegion(String region) {
        return postStandRepository.findByRegion(region).stream()
                .map(PostStandDto::fromEntity)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public List<PostStandDto> getPostStandsWithinRadius(double lat, double lng, double radiusKm) {
        return postStandRepository.findAllWithinRadius(lat, lng, radiusKm).stream()
                .map(PostStandDto::fromEntity)
                .collect(Collectors.toList());
    }
    
    @Transactional
    public PostStandDto createPostStand(PostStandDto postStandDto) {
        PostStand postStand = postStandDto.toEntity();
        PostStand savedPostStand = postStandRepository.save(postStand);
        return PostStandDto.fromEntity(savedPostStand);
    }
    
    @Transactional
    public PostStandDto updatePostStand(Long id, PostStandDto postStandDto) {
        PostStand existingPostStand = postStandRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("게시대를 찾을 수 없습니다. ID: " + id));
        
        existingPostStand.setName(postStandDto.getName());
        existingPostStand.setAddress(postStandDto.getAddress());
        existingPostStand.setLatitude(postStandDto.getLatitude());
        existingPostStand.setLongitude(postStandDto.getLongitude());
        existingPostStand.setImageUrl(postStandDto.getImageUrl());
        existingPostStand.setDescription(postStandDto.getDescription());
        existingPostStand.setRegion(postStandDto.getRegion());
        
        PostStand updatedPostStand = postStandRepository.save(existingPostStand);
        return PostStandDto.fromEntity(updatedPostStand);
    }
    
    @Transactional
    public void deletePostStand(Long id) {
        postStandRepository.deleteById(id);
    }
}
