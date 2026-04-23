package com.example.resourceservice.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class DemoController {

    @GetMapping("/api/public/health")
    public Map<String, String> health() {
        return Map.of("status", "UP");
    }

    @GetMapping("/api/me")
    public Map<String, Object> me(@AuthenticationPrincipal Jwt jwt) {
        return Map.of(
                "subject", jwt.getSubject(),
                "email", jwt.getClaimAsString("email") != null ? jwt.getClaimAsString("email") : "",
                "scope", jwt.getClaimAsString("scope") != null ? jwt.getClaimAsString("scope") : ""
        );
    }

    @GetMapping("/api/data")
    @PreAuthorize("hasAuthority('SCOPE_read')")
    public Map<String, String> data() {
        return Map.of("message", "Here is your data");
    }

    @GetMapping("/api/admin")
    @PreAuthorize("hasAuthority('SCOPE_write')")
    public Map<String, String> admin() {
        return Map.of("message", "Admin operation successful");
    }
}
