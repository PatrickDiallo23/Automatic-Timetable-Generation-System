package com.patrick.timetableappbackend.config;

import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.time.Duration;
import java.util.Arrays;

@Configuration
@Slf4j
public class WebConfig implements WebMvcConfigurer {

    private static final Long MAX_AGE = 3600L;

    @Bean
    public FilterRegistrationBean<CorsFilter> corsFilterFilterRegistrationBean() {
        log.info("Cors Filtering");
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();
        config.addAllowedOriginPattern("*");
        config.setAllowedHeaders(Arrays.asList(
                HttpHeaders.AUTHORIZATION,
                HttpHeaders.CONTENT_TYPE,
                HttpHeaders.ACCEPT));
        config.setAllowedMethods(Arrays.asList(
                HttpMethod.GET.name(),
                HttpMethod.POST.name(),
                HttpMethod.PUT.name(),
                HttpMethod.DELETE.name()));
        config.setMaxAge(MAX_AGE);
        config.setAllowCredentials(true);
        source.registerCorsConfiguration("/**", config);
        FilterRegistrationBean<CorsFilter> bean = new FilterRegistrationBean<CorsFilter>(new CorsFilter(source));

        // we need to use CorsFilter before SpringSecurityFilter
        bean.setOrder(Ordered.HIGHEST_PRECEDENCE);
        return bean;

    }

    @Bean
    public ModelMapper modelMapper() {
        return new ModelMapper();
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/local/data/**", "/benchmark-reports/**", "/benchmarks/report/**")
                .addResourceLocations("file:" + System.getProperty("user.dir") + "/local/data/", "file:/local/data/",
                        "file:" + System.getProperty("user.dir") + "/benchmark-reports/", "file:/benchmark-reports/",
                        "file:" + System.getProperty("user.dir") + "/benchmarks/report/", "file:/benchmarks/report/")
                .setCacheControl(CacheControl.maxAge(Duration.ofHours(2)));
    }

//    @Bean
//    @LoadBalanced
//    public RestTemplate restTemplate() {
//        return new RestTemplate();
//    }
}
