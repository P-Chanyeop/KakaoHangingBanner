package com.mapboard.repository;

import com.mapboard.entity.PostStand;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PostStandRepository extends JpaRepository<PostStand, Long> {
    
    List<PostStand> findByRegion(String region);
    
    // 특정 반경 내의 게시대 찾기 (Haversine 공식 사용)
    @Query(value = "SELECT * FROM post_stand p WHERE " +
            "(6371 * acos(cos(radians(:lat)) * cos(radians(p.latitude)) * " +
            "cos(radians(p.longitude) - radians(:lng)) + " +
            "sin(radians(:lat)) * sin(radians(p.latitude)))) <= :radius", 
            nativeQuery = true)
    List<PostStand> findAllWithinRadius(
            @Param("lat") double lat, 
            @Param("lng") double lng, 
            @Param("radius") double radiusKm);
}
