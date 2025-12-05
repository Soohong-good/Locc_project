package com.example.locc.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Static resources
        registry.addResourceHandler("/static/**")
                .addResourceLocations("classpath:/static/");

        // Images
        registry.addResourceHandler("/images/**")
                .addResourceLocations("classpath:/static/images/");

        // CSS
        registry.addResourceHandler("/css/**")
                .addResourceLocations("classpath:/static/css/");

        // JavaScript
        registry.addResourceHandler("/js/**")
                .addResourceLocations("classpath:/static/js/");

        // Uploads (for user uploaded files like sermon audio/video)
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("classpath:/uploads/");
    }

    // Removed duplicate view controller mapping
    // MainController now handles "/" mapping
}