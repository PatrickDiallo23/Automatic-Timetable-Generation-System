package com.patrick.timetableappbackend.service;

import com.patrick.timetableappbackend.config.JwtService;
import com.patrick.timetableappbackend.dto.AuthenticationRequest;
import com.patrick.timetableappbackend.dto.AuthenticationResponse;
import com.patrick.timetableappbackend.model.Role;
import com.patrick.timetableappbackend.model.User;
import com.patrick.timetableappbackend.repository.UserRepo;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {


    private final JwtService jwtService;
    private final UserRepo userRepo;
    private final AuthenticationManager authenticationManager;


    public AuthenticationResponse authenticate(AuthenticationRequest request) {
        log.info("Authenticating the user...");
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );
        User user = userRepo.findByEmail(request.getEmail())
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        Role role = user.getRole();
        Map<String, Object> extraClaims = new HashMap<>();
        extraClaims.put("role", role);
        String jwtToken = jwtService.generateToken(extraClaims, user);
        return AuthenticationResponse.builder()
                .accessToken(jwtToken)
                .build();
    }
}
