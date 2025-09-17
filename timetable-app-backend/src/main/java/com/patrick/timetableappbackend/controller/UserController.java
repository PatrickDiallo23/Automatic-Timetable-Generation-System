package com.patrick.timetableappbackend.controller;

import com.patrick.timetableappbackend.config.JwtService;
import com.patrick.timetableappbackend.dto.AuthenticationRequest;
import com.patrick.timetableappbackend.dto.AuthenticationResponse;
import com.patrick.timetableappbackend.model.User;
import com.patrick.timetableappbackend.repository.UserRepo;
import com.patrick.timetableappbackend.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
// import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/auth")
@Tag(name = "User Management", description = "Operations related to user management and authentication")
@RequiredArgsConstructor
@Slf4j
public class UserController {

    private final UserRepo userRepo;
    private final UserService userService;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService; // todo delete in future (good for testing)
    private final UserDetailsService userDetailsService; //todo delete in future

    @Operation(summary = "Publicly accessible endpoint",
            description = "This endpoint is publicly accessible with authentication"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully accessed the endpoint", content = @Content(mediaType = "text/plain")),
            @ApiResponse(responseCode = "500", description = "Internal server error", content = @Content),
    })
    @GetMapping("/welcome")
    public String goHome() {
        return "this is publicly accessible with authentication";
    }

    //register user with username, mail, password and role (ADMIN or USER)

    //Receive jwt token (Auth Bearer Token)
    //authentication with mail and password
    @Operation(summary = "Authenticate user",
            description = "This endpoint allows users to authenticate with their email and password"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Authentication successful",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = AuthenticationResponse.class))),
            @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content),
            @ApiResponse(responseCode = "500", description = "Internal server error", content = @Content)
    })
    @PostMapping("/authenticate")
    public ResponseEntity<AuthenticationResponse> authenticate(
            @Parameter(description = "Authentication request containing email and password", required = true)
            @RequestBody AuthenticationRequest request
    ) {
        return ResponseEntity.ok(userService.authenticate(request));
    }

    @Operation(
            summary = "Get all users",
            description = "Returns a list of all users. Requires a valid JWT token with ADMIN authority."
            //security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Successfully retrieved the list of users",
                    content = @Content(mediaType = "application/json", array = @ArraySchema(schema = @Schema(implementation = User.class)))
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Unauthorized – token missing or invalid",
                    content = @Content
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "Internal server error",
                    content = @Content
            )
    })
    @GetMapping("/users/all")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<?> getAllUsers(
            @Parameter(description = "JWT token for authentication")
            @RequestHeader(value = "Authorization", required = false) String token
    ) {
        //test the jwtToken
        log.info(token + " this is the token from getAllUsers method");
        if (token == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Token is required to proceed");
        } else {
            String realToken = token.split(" ")[1].trim();
            log.info("real token:" + realToken);
            String userEmail = jwtService.extractUsername(realToken);
            UserDetails userDetails = this.userDetailsService.loadUserByUsername(userEmail);

            if (jwtService.isTokenValid(realToken, userDetails)) {
                List<User> users = userRepo.findAll();
                return new ResponseEntity<List<User>>(users, HttpStatus.OK);
            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized due to a problem");
            }
        }

    }

    //todo simplify this in future
    @Operation(
            summary = "Get user details",
            description = "Returns the details of the currently logged-in user."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Successfully retrieved user details",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = User.class))
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "User not found",
                    content = @Content
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "Internal server error",
                    content = @Content
            )
    })
    @GetMapping("/users/single")
    @PreAuthorize("hasAuthority('ADMIN') OR hasAuthority('USER')")
    public ResponseEntity<Object> getMyDetails() {
        if (userRepo.findByEmail(getLoggedInUserDetails().getUsername()).isPresent()) {
            return ResponseEntity.ok(userRepo.findByEmail(getLoggedInUserDetails().getUsername()).get());
        } else {
            return ResponseEntity.status(404).body("User not found");
        }

    }

    public UserDetails getLoggedInUserDetails() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof UserDetails) {
            return (UserDetails) authentication.getPrincipal();
        }
        return null;
    }

}
