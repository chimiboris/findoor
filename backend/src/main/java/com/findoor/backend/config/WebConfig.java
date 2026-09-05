package com.findoor.backend.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/** Sert les photos d'annonces uploadées (stockage local, cf. FileStorageService) sous /media/**. */
@Configuration
@RequiredArgsConstructor
public class WebConfig implements WebMvcConfigurer {

    private final FindoorProperties properties;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String location = "file:" + properties.storage().localDir().replace("\\", "/") + "/";
        registry.addResourceHandler("/media/**").addResourceLocations(location);
    }
}
