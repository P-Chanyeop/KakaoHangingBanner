package com.softcat.kakaohangingbanner;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@ComponentScan(basePackages = {"com.softcat.kakaohangingbanner", "com.mapboard"})
@EntityScan(basePackages = {"com.softcat.kakaohangingbanner", "com.mapboard.entity"})
@EnableJpaRepositories(basePackages = {"com.softcat.kakaohangingbanner", "com.mapboard.repository"})
public class KakaoHangingBannerApplication {

    public static void main(String[] args) {
        SpringApplication.run(KakaoHangingBannerApplication.class, args);
    }

}
