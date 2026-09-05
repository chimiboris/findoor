package com.findoor.backend.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Sert les photos d'annonces uploadées (stockage local, cf. FileStorageService) sous /media/**, et
 * les photos de démonstration embarquées dans le jar sous /seed-media/** (cf. SeedPhotoPool) —
 * ces dernières survivent aux redémarrages (contrairement au disque local, effacé sur les
 * hébergements gratuits comme Render à chaque redémarrage/réveil du service).
 */
@Configuration
@RequiredArgsConstructor
public class WebConfig implements WebMvcConfigurer {

    private final FindoorProperties properties;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String location = "file:" + properties.storage().localDir().replace("\\", "/") + "/";
        registry.addResourceHandler("/media/**").addResourceLocations(location);
        registry.addResourceHandler("/seed-media/**").addResourceLocations("classpath:/seed-photos/");
    }
}
