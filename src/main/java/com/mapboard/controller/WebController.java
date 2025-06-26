package com.mapboard.controller;

import com.mapboard.entity.Stand;
import com.mapboard.service.StandService;
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

    private final StandService standService;

    @Autowired
    public WebController(StandService standService) {
        this.standService = standService;
    }

    @GetMapping("/")
    public String home(Model model) {
        List<Stand> stands = standService.getAllStands();
        model.addAttribute("stands", stands);
        
        // 지역 목록 추출
        List<String> regions = stands.stream()
                .map(Stand::getRegion)
                .distinct()
                .sorted()
                .collect(Collectors.toList());
        model.addAttribute("regions", regions);
        
        return "index";
    }

    @GetMapping("/stands")
    public String getStandsByFilter(
            @RequestParam(required = false) String region,
            @RequestParam(required = false) Double lat,
            @RequestParam(required = false) Double lng,
            @RequestParam(required = false) Double radius,
            Model model) {
        
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
        Stand stand = standService.getStandById(id);
        model.addAttribute("stand", stand);
        return "stand-detail";
    }

    @GetMapping("/stands/{id}/edit")
    public String editStandForm(@PathVariable Long id, Model model) {
        Stand stand = standService.getStandById(id);
        model.addAttribute("stand", stand);
        return "stand-form";
    }

    @GetMapping("/stands/new")
    public String newStandForm(Model model) {
        model.addAttribute("stand", new Stand());
        return "stand-form";
    }
}
