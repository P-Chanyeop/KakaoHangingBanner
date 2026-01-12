package com.mapboard.service;

import com.mapboard.entity.Stand;
import com.mapboard.repository.StandRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 게시대 관리 서비스
 * 게시대의 생성, 조회, 수정, 삭제 및 검색 기능을 제공합니다.
 */
@Service
public class StandService {

    private final StandRepository standRepository;

    @Autowired
    public StandService(StandRepository standRepository) {
        this.standRepository = standRepository;
    }

    /**
     * 모든 게시대 목록을 조회합니다.
     *
     * @return 모든 게시대 목록
     */
    @Transactional(readOnly = true)
    public List<Stand> getAllStands() {
        return standRepository.findAll();
    }

    /**
     * ID로 게시대를 조회합니다.
     *
     * @param id 조회할 게시대 ID
     * @return 조회된 게시대
     * @throws EntityNotFoundException 게시대를 찾을 수 없는 경우
     */
    @Transactional(readOnly = true)
    public Stand getStandById(Long id) {
        return standRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("게시대를 찾을 수 없습니다. ID: " + id));
    }

    /**
     * 지역별로 게시대를 조회합니다.
     *
     * @param region 조회할 지역명
     * @return 해당 지역의 게시대 목록
     */
    @Transactional(readOnly = true)
    public List<Stand> getStandsByRegion(String region) {
        return standRepository.findByRegion(region);
    }

    /**
     * 특정 좌표를 중심으로 반경 내의 게시대를 조회합니다.
     *
     * @param lat 중심 위도
     * @param lng 중심 경도
     * @param radius 반경 (km)
     * @return 반경 내의 게시대 목록
     */
    @Transactional(readOnly = true)
    public List<Stand> getStandsWithinRadius(double lat, double lng, double radius) {
        return standRepository.findWithinRadius(lat, lng, radius);
    }

    /**
     * 키워드로 게시대를 검색합니다 (이름 또는 주소).
     *
     * @param keyword 검색 키워드
     * @return 검색된 게시대 목록
     */
    @Transactional(readOnly = true)
    public List<Stand> searchStands(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return getAllStands();
        }

        String searchTerm = keyword.toLowerCase().trim();
        return standRepository.findAll().stream()
                .filter(stand ->
                    (stand.getName() != null && stand.getName().toLowerCase().contains(searchTerm)) ||
                    (stand.getAddress() != null && stand.getAddress().toLowerCase().contains(searchTerm))
                )
                .collect(Collectors.toList());
    }

    /**
     * 새로운 게시대를 생성합니다.
     *
     * @param stand 생성할 게시대 정보
     * @return 생성된 게시대
     */
    @Transactional
    public Stand createStand(Stand stand) {
        return standRepository.save(stand);
    }

    /**
     * 기존 게시대 정보를 업데이트합니다.
     *
     * @param id 업데이트할 게시대 ID
     * @param standDetails 업데이트할 게시대 정보
     * @return 업데이트된 게시대
     * @throws EntityNotFoundException 게시대를 찾을 수 없는 경우
     */
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

    /**
     * 게시대를 삭제합니다.
     *
     * @param id 삭제할 게시대 ID
     * @throws EntityNotFoundException 게시대를 찾을 수 없는 경우
     */
    @Transactional
    public void deleteStand(Long id) {
        Stand stand = getStandById(id);
        standRepository.delete(stand);
    }
}
