package com.patrick.timetableappbackend.controller;

import com.patrick.timetableappbackend.config.JwtService;
import com.patrick.timetableappbackend.dto.AuthenticationRequest;
import com.patrick.timetableappbackend.dto.AuthenticationResponse;
import com.patrick.timetableappbackend.model.User;
import com.patrick.timetableappbackend.repository.UserRepo;
import com.patrick.timetableappbackend.service.UserService;
import java.util.List;
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
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Slf4j
public class UserController {

  private final UserRepo userRepo;
  private final UserService userService;
  private final PasswordEncoder passwordEncoder;
  private final JwtService jwtService; // todo delete in future (good for testing)
  private final UserDetailsService userDetailsService; // todo delete in future

  @GetMapping("/welcome")
  public String goHome() {
    return "this is publicly accessible with authentication";
  }

  // register user with username, mail, password and role (ADMIN or USER)

  // Receive jwt token (Auth Bearer Token)
  // authentication with mail and password
  @PostMapping("/authenticate")
  public ResponseEntity<AuthenticationResponse> authenticate(
      @RequestBody AuthenticationRequest request) {
    return ResponseEntity.ok(userService.authenticate(request));
  }

  @GetMapping("/users/all")
  @PreAuthorize("hasAuthority('ADMIN')")
  public ResponseEntity<?> getAllUsers(
      @RequestHeader(value = "Authorization", required = false) String token) {
    // test the jwtToken
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

  // todo simplify this in future
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
