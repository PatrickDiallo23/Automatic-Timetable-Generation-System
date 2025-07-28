package com.patrick.timetableappbackend.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import io.swagger.v3.oas.models.tags.Tag;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Automatic Timetable Generation System")
                        .version("1.0.0")
                        .description("REST API for managing faculty timetables, courses, and scheduling")
                        .contact(new Contact()
                                .name("Development Team - TBD")
                                .email("dev-team@yourcompany.com")
                                .url("https://yourcompany.com"))
                        .license(new License()
                                .name("Apache-2.0 License")
                                .url("https://opensource.org/license/apache-2-0")))
                .servers(List.of(
                        new Server().url("http://localhost:8200").description("Development Server"),
                        new Server().url("https://api.yourcompany.com").description("Production Server")
                ))
                .tags(List.of(
                        new Tag().name("User Management").description("Operations related to user management and authentication"),
                        new Tag().name("Student Group Management").description("Operations related to student groups management"),
                        new Tag().name("Teacher Management").description("Operations related to teachers management"),
                        new Tag().name("Lesson Management").description("Operations related to lessons management"),
                        new Tag().name("Constraint Management").description("Operations related to constraints management"),
                        new Tag().name("Timetable Management").description("Operations related to timetable management"),
                        new Tag().name("Room Management").description("Operations related to rooms management"),
                        new Tag().name("Timeslot Management").description("Operations related to timeslots management")
                ))
                .addSecurityItem(new SecurityRequirement().addList("Bearer Authentication"))
                .components(new Components()
                        .addSecuritySchemes("Bearer Authentication",
                                new SecurityScheme()
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")
                                        .description("Enter JWT token")));
    }
}