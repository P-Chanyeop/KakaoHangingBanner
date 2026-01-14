package com.mapboard.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${file.upload.dir}")
    private String uploadDir;
    
    @Value("${file.upload.url-prefix}")
    private String urlPrefix;

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("http://localhost:8081", "http://localhost:3000")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(false)
                .maxAge(3600);
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // 업로드된 이미지 파일을 정적 리소스로 서빙 (설정값 사용)
        registry.addResourceHandler(urlPrefix + "/**")
                .addResourceLocations("file:" + uploadDir);

        // React 빌드 파일 캐시 완전 비활성화
        registry.addResourceHandler("/static/**")
                .addResourceLocations("classpath:/static/static/")
                .setCachePeriod(0)
                .resourceChain(false);

        // index.html도 캐시 비활성화
        registry.addResourceHandler("/index.html")
                .addResourceLocations("classpath:/static/")
                .setCachePeriod(0)
                .resourceChain(false);

        // 모든 정적 리소스 캐시 비활성화
        registry.addResourceHandler("/**")
                .addResourceLocations("classpath:/static/")
                .setCachePeriod(0)
                .resourceChain(false);
    }
}
