package com.mapboard.controller;

import com.mapboard.entity.Stand;
import com.mapboard.service.StandService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;
import java.util.stream.Collectors;

@Controller
public class WebController {

    private static final Logger logger = LoggerFactory.getLogger(WebController.class);
    private final StandService standService;

    @Autowired
    public WebController(StandService standService) {
        this.standService = standService;
        logger.info("WebController 초기화됨");
    }

    @GetMapping("/")
    public String home() {
        logger.info("홈 페이지 요청 받음");
        return "home";
    }

    @GetMapping("/map")
    public String mapSearch(Model model) {
        logger.info("지도 검색 페이지 요청 받음");
        List<Stand> stands = standService.getAllStands();
        model.addAttribute("stands", stands);

        // 지역 목록 추출
        List<String> regions = stands.stream()
                .map(Stand::getRegion)
                .distinct()
                .sorted()
                .collect(Collectors.toList());
        model.addAttribute("regions", regions);

        return "map-search";
    }

    @GetMapping("/stands")
    public String getStandsByFilter(
            @RequestParam(required = false) String region,
            @RequestParam(required = false) Double lat,
            @RequestParam(required = false) Double lng,
            @RequestParam(required = false) Double radius,
            Model model) {
        
        logger.info("필터링된 게시대 페이지 요청 받음. region={}, lat={}, lng={}, radius={}", region, lat, lng, radius);
        
        List<Stand> stands;
        
        // 필터링 로직
        if (region != null && !region.isEmpty()) {
            stands = standService.getStandsByRegion(region);
            model.addAttribute("selectedRegion", region);
        } else if (lat != null && lng != null && radius != null) {
            stands = standService.getStandsWithinRadius(lat, lng, radius);
            model.addAttribute("lat", lat);
            model.addAttribute("lng", lng);
            model.addAttribute("radius", radius);
        } else {
            stands = standService.getAllStands();
        }
        
        model.addAttribute("stands", stands);
        
        // 지역 목록 추출
        List<String> regions = standService.getAllStands().stream()
                .map(Stand::getRegion)
                .distinct()
                .sorted()
                .collect(Collectors.toList());
        model.addAttribute("regions", regions);
        
        return "index";
    }

    @GetMapping("/stands/{id}")
    public String getStandDetail(@PathVariable Long id, Model model) {
        logger.info("게시대 상세 페이지 요청 받음. id={}", id);
        Stand stand = standService.getStandById(id);
        model.addAttribute("stand", stand);
        return "stand-detail";
    }

    @GetMapping("/stands/{id}/edit")
    public String editStandForm(@PathVariable Long id, Model model) {
        logger.info("게시대 수정 페이지 요청 받음. id={}", id);
        Stand stand = standService.getStandById(id);
        model.addAttribute("stand", stand);
        return "stand-form";
    }

    @GetMapping("/stands/new")
    public String newStandForm(Model model) {
        logger.info("새 게시대 등록 페이지 요청 받음");
        model.addAttribute("stand", new Stand());
        return "stand-form";
    }
    
    @GetMapping("/api-test")
    public String apiTest() {
        logger.info("API 테스트 페이지 요청 받음");
        return "api-test";
    }
}
