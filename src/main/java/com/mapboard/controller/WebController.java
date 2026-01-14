package com.mapboard.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/**
 * React SPA를 위한 웹 컨트롤러
 * 모든 페이지 경로를 React 앱의 index.html로 포워딩
 */
@Controller
public class WebController {

    private static final Logger logger = LoggerFactory.getLogger(WebController.class);

    /**
     * React SPA를 위한 fallback 라우팅
     * /api, /uploads, /h2-console을 제외한 모든 경로를 React 앱으로 포워딩
     */
    @GetMapping(value = {
            "/",
            "/map",
            "/stands/**",
            "/admin/**"
    })
    public String forward() {
        logger.debug("React SPA로 포워딩");
        return "forward:/index.html";
    }
}
