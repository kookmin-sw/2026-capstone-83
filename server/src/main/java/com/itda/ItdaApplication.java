package com.itda;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@ConfigurationPropertiesScan(basePackages = "com.itda.config")
@EnableScheduling
public class ItdaApplication {
	public static void main(String[] args) {
		SpringApplication.run(ItdaApplication.class, args);
	}
}