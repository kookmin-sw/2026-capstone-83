package com.itda;

import jakarta.annotation.PostConstruct;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;
import org.springframework.scheduling.annotation.EnableScheduling;

import java.util.TimeZone;

@SpringBootApplication
@ConfigurationPropertiesScan(basePackages = "com.itda.config")
@EnableScheduling
public class ItdaApplication {

    public static void main(String[] args) {
        // JVM 기본 타임존을 KST 로 고정.
        // EC2 의 JVM 옵션(-Duser.timezone) 누락 또는 OS 타임존 미설정에 대비한 코드 레벨 안전장치.
        // LocalDateTime 의 +9시간 오프셋 이중 변환 문제를 방지한다.
        TimeZone.setDefault(TimeZone.getTimeZone("Asia/Seoul"));
        SpringApplication.run(ItdaApplication.class, args);
    }

    /**
     * 스프링 컨텍스트 초기화 시점에 타임존을 한 번 더 강제 설정한다.
     * 일부 외부 라이브러리가 애플리케이션 시작 중 TimeZone.setDefault() 를 덮어쓰는 경우에 대한 이중 안전망.
     */
    @PostConstruct
    public void init() {
        TimeZone.setDefault(TimeZone.getTimeZone("Asia/Seoul"));
    }
}