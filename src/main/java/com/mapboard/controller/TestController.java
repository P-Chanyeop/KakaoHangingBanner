package com.mapboard.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/test")
@CrossOrigin(origins = "http://localhost:8081", allowCredentials = "false")
public class TestController {

    private static final Logger logger = LoggerFactory.getLogger(TestController.class);

    public TestController() {
        logger.info("TestController 초기화됨");
    }

    @GetMapping
    public Map<String, String> testGet() {
        logger.info("GET /api/test 요청 받음");
        Map<String, String> response = new HashMap<>();
        response.put("message", "GET 요청이 성공적으로 처리되었습니다.");
        response.put("status", "success");
        return response;
    }

    @PostMapping
    public Map<String, String> testPost(@RequestBody(required = false) Map<String, Object> body) {
        logger.info("POST /api/test 요청 받음. 데이터: {}", body);
        Map<String, String> response = new HashMap<>();
        response.put("message", "POST 요청이 성공적으로 처리되었습니다.");
        response.put("status", "success");
        return response;
    }
}
