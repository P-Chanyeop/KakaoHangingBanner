package com.mapboard.repository;

import com.mapboard.entity.HeroImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface HeroImageRepository extends JpaRepository<HeroImage, Long> {
    Optional<HeroImage> findByName(String name);
}
