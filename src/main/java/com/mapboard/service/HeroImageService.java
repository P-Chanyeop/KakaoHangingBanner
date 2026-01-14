package com.mapboard.service;

import com.mapboard.entity.HeroImage;
import com.mapboard.repository.HeroImageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Hero 이미지 서비스
 */
@Service
@RequiredArgsConstructor
public class HeroImageService {
    
    private final HeroImageRepository heroImageRepository;
    
    /**
     * 모든 Hero 이미지를 조회합니다.
     *
     * @return Hero 이미지 목록
     */
    public List<HeroImage> getAllHeroImages() {
        return heroImageRepository.findAll();
    }
    
    /**
     * 이름으로 Hero 이미지를 조회합니다.
     *
     * @param name Hero 이미지 이름 (hero1, hero2)
     * @return Hero 이미지 또는 null
     */
    public HeroImage getHeroImageByName(String name) {
        return heroImageRepository.findByName(name).orElse(null);
    }
    
    /**
     * Hero 이미지를 저장하거나 업데이트합니다.
     *
     * @param name Hero 이미지 이름 (hero1, hero2)
     * @param imageUrl 이미지 URL
     * @return 저장된 Hero 이미지
     */
    @Transactional
    public HeroImage saveOrUpdateHeroImage(String name, String imageUrl) {
        HeroImage heroImage = heroImageRepository.findByName(name)
                .orElse(HeroImage.builder().name(name).build());
        heroImage.setImageUrl(imageUrl);
        return heroImageRepository.save(heroImage);
    }
}
