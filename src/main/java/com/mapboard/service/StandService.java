package com.mapboard.service;

import com.mapboard.entity.Stand;
import com.mapboard.repository.StandRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class StandService {

    private final StandRepository standRepository;

    @Autowired
    public StandService(StandRepository standRepository) {
        this.standRepository = standRepository;
    }

    @Transactional(readOnly = true)
    public List<Stand> getAllStands() {
        return standRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Stand getStandById(Long id) {
        return standRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("게시대를 찾을 수 없습니다. ID: " + id));
    }

    @Transactional(readOnly = true)
    public List<Stand> getStandsByRegion(String region) {
        return standRepository.findByRegion(region);
    }

    @Transactional(readOnly = true)
    public List<Stand> getStandsWithinRadius(double lat, double lng, double radius) {
        return standRepository.findWithinRadius(lat, lng, radius);
    }

    @Transactional
    public Stand createStand(Stand stand) {
        return standRepository.save(stand);
    }

    @Transactional
    public Stand updateStand(Long id, Stand standDetails) {
        Stand stand = getStandById(id);
        
        stand.setName(standDetails.getName());
        stand.setAddress(standDetails.getAddress());
        stand.setLatitude(standDetails.getLatitude());
        stand.setLongitude(standDetails.getLongitude());
        stand.setDescription(standDetails.getDescription());
        stand.setRegion(standDetails.getRegion());
        stand.setImageUrl(standDetails.getImageUrl());
        
        return standRepository.save(stand);
    }

    @Transactional
    public void deleteStand(Long id) {
        Stand stand = getStandById(id);
        standRepository.delete(stand);
    }
}
