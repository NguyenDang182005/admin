package com.example.demo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import com.example.demo.config.FileStorageProperties;
import com.example.demo.config.JwtProperties;

@SpringBootApplication
@EnableConfigurationProperties({FileStorageProperties.class, JwtProperties.class})
public class AdminApplication {

	public static void main(String[] args) {
		SpringApplication.run(AdminApplication.class, args);
	}

}
