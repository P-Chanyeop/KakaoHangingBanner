package com.mapboard.repository;

import com.mapboard.entity.Stand;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StandRepository extends JpaRepository<Stand, Long> {
    
    List<Stand> findByRegion(String region);
    
    @Query(value = "SELECT * FROM stands " +
            "WHERE (6371 * acos(cos(radians(:lat)) * cos(radians(latitude)) * cos(radians(longitude) - radians(:lng)) + sin(radians(:lat)) * sin(radians(latitude)))) <= :radius", 
            nativeQuery = true)
    List<Stand> findWithinRadius(@Param("lat") double lat, @Param("lng") double lng, @Param("radius") double radius);
}
