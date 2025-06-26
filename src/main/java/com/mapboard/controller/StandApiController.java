package com.mapboard.controller;

import com.mapboard.entity.Stand;
import com.mapboard.service.StandService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stands")
public class StandApiController {

    private final StandService standService;

    @Autowired
    public StandApiController(StandService standService) {
        this.standService = standService;
    }

    @GetMapping
    public ResponseEntity<List<Stand>> getAllStands(
            @RequestParam(required = false) String region,
            @RequestParam(required = false) Double lat,
            @RequestParam(required = false) Double lng,
            @RequestParam(required = false) Double radius) {
        
        List<Stand> stands;
        
        if (region != null && !region.isEmpty()) {
            stands = standService.getStandsByRegion(region);
        } else if (lat != null && lng != null && radius != null) {
            stands = standService.getStandsWithinRadius(lat, lng, radius);
        } else {
            stands = standService.getAllStands();
        }
        
        return ResponseEntity.ok(stands);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Stand> getStandById(@PathVariable Long id) {
        Stand stand = standService.getStandById(id);
        return ResponseEntity.ok(stand);
    }

    @PostMapping
    public ResponseEntity<Stand> createStand(@RequestBody Stand stand) {
        Stand createdStand = standService.createStand(stand);
        return new ResponseEntity<>(createdStand, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Stand> updateStand(@PathVariable Long id, @RequestBody Stand standDetails) {
        Stand updatedStand = standService.updateStand(id, standDetails);
        return ResponseEntity.ok(updatedStand);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStand(@PathVariable Long id) {
        standService.deleteStand(id);
        return ResponseEntity.noContent().build();
    }
}
