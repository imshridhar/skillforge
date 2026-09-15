package com.skillforge.dto.response;

import com.skillforge.entity.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
    private UUID userId;
    private String email;
    private String firstName;
    private String lastName;
    private User.Role role;
    private String profilePictureUrl;
    private Boolean isActive;
    private Boolean isVerified;
    private LocalDateTime lastLogin;
    private LocalDateTime createdAt;

    public static UserResponse fromEntity(User user) {
        return UserResponse.builder()
                .userId(user.getUserId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .role(user.getRole())
                .profilePictureUrl(user.getProfilePictureUrl())
                .isActive(user.getIsActive())
                .isVerified(user.getIsVerified())
                .lastLogin(user.getLastLogin())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
