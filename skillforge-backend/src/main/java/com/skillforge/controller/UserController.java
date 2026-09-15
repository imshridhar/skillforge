package com.skillforge.controller;

import com.skillforge.dto.request.UpdateProfileRequest;
import com.skillforge.dto.response.UserResponse;
import com.skillforge.entity.User;
import com.skillforge.repository.UserRepository;
import com.skillforge.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('LEARNER', 'INSTRUCTOR', 'ADMIN')")
@SuppressWarnings("null")
public class UserController {

    private final UserRepository userRepository;

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getProfile(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        User user = getCurrentUser(userPrincipal);
        return ResponseEntity.ok(UserResponse.fromEntity(user));
    }

    @PutMapping("/me")
    public ResponseEntity<UserResponse> updateProfile(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestBody UpdateProfileRequest request) {
        User user = getCurrentUser(userPrincipal);

        if (request.getFirstName() != null && !request.getFirstName().isBlank()) {
            user.setFirstName(request.getFirstName().trim());
        }
        if (request.getLastName() != null && !request.getLastName().isBlank()) {
            user.setLastName(request.getLastName().trim());
        }
        if (request.getProfilePictureUrl() != null) {
            user.setProfilePictureUrl(request.getProfilePictureUrl().trim());
        }

        User saved = userRepository.save(user);
        return ResponseEntity.ok(UserResponse.fromEntity(saved));
    }

    private User getCurrentUser(UserPrincipal userPrincipal) {
        return userRepository.findByEmail(userPrincipal.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
