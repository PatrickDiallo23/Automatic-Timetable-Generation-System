package com.patrick.timetableappbackend.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Schema(description = "Authentication request containing email and password for user login.")
public class AuthenticationRequest {

    @Schema(description = "User's received email", example = "john.doe@faculty_domain.com")
    private String email;
    @Schema(description = "User's password", example = "password123")
    private String password;
}
