package com.skillforge.service;

import com.skillforge.dto.request.LoginRequest;
import com.skillforge.dto.request.RegisterRequest;
import com.skillforge.dto.response.AuthResponse;
import com.skillforge.dto.response.UserResponse;
import com.skillforge.entity.PasswordResetToken;
import com.skillforge.entity.User;
import com.skillforge.repository.PasswordResetTokenRepository;
import com.skillforge.repository.UserRepository;
import com.skillforge.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;
import java.util.Objects;

@SuppressWarnings("null")
@Service
@RequiredArgsConstructor
public class AuthService {

        private final UserRepository userRepository;
        private final PasswordResetTokenRepository passwordResetTokenRepository;
        private final PasswordEncoder passwordEncoder;
        private final AuthenticationManager authenticationManager;
        private final JwtTokenProvider tokenProvider;

        @Value("${app.reset.token-expiration-minutes:30}")
        private int resetTokenExpirationMinutes;

        @Value("${app.reset.return-token:true}")
        private boolean returnResetToken;

        private final SecureRandom secureRandom = new SecureRandom();

        @Transactional
        public AuthResponse register(RegisterRequest request) {
                // Check if email already exists
                if (userRepository.existsByEmail(request.getEmail())) {
                        throw new RuntimeException("Email is already registered");
                }

                // Create new user
                User user = User.builder()
                                .email(request.getEmail())
                                .passwordHash(passwordEncoder.encode(request.getPassword()))
                                .firstName(request.getFirstName())
                                .lastName(request.getLastName())
                                .role(request.getRole())
                                .isActive(true)
                                .isVerified(false)
                                .build();

                user = Objects.requireNonNull(userRepository.save(user));

                // Generate tokens
                String token = tokenProvider.generateTokenFromEmail(user.getEmail());
                String refreshToken = tokenProvider.generateRefreshToken(user.getEmail());

                return AuthResponse.builder()
                                .user(UserResponse.fromEntity(user))
                                .token(token)
                                .refreshToken(refreshToken)
                                .build();
        }

        public AuthResponse login(LoginRequest request) {
                // Authenticate user
                Authentication authentication = authenticationManager.authenticate(
                                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));

                SecurityContextHolder.getContext().setAuthentication(authentication);

                // Get user and update last login
                User user = userRepository.findByEmail(request.getEmail())
                                .orElseThrow(() -> new RuntimeException("User not found"));

                user.setLastLogin(LocalDateTime.now());
                userRepository.save(user);

                // Generate tokens
                String token = tokenProvider.generateToken(authentication);
                String refreshToken = tokenProvider.generateRefreshToken(request.getEmail());

                return AuthResponse.builder()
                                .user(UserResponse.fromEntity(user))
                                .token(token)
                                .refreshToken(refreshToken)
                                .build();
        }

        public AuthResponse refreshToken(String refreshToken) {
                if (!tokenProvider.validateToken(refreshToken)) {
                        throw new RuntimeException("Invalid refresh token");
                }

                String email = tokenProvider.getEmailFromToken(refreshToken);
                User user = userRepository.findByEmail(email)
                                .orElseThrow(() -> new RuntimeException("User not found"));

                String newToken = tokenProvider.generateTokenFromEmail(email);
                String newRefreshToken = tokenProvider.generateRefreshToken(email);

                return AuthResponse.builder()
                                .user(UserResponse.fromEntity(user))
                                .token(newToken)
                                .refreshToken(newRefreshToken)
                                .build();
        }

        public UserResponse getCurrentUser(String email) {
                User user = userRepository.findByEmail(email)
                                .orElseThrow(() -> new RuntimeException("User not found"));
                return UserResponse.fromEntity(user);
        }

        @Transactional
        public Map<String, Object> requestPasswordReset(String email) {
                String responseMessage = "If an account exists for that email, a reset link has been generated.";
                Map<String, Object> response = new HashMap<>();
                response.put("message", responseMessage);

                if (email == null || email.isBlank()) {
                        return response;
                }

                userRepository.findByEmail(email.trim()).ifPresent(user -> {
                        passwordResetTokenRepository.deleteByExpiresAtBefore(LocalDateTime.now());

                        String rawToken = generateResetToken();
                        String tokenHash = hashToken(rawToken);
                        LocalDateTime expiresAt = LocalDateTime.now().plusMinutes(resetTokenExpirationMinutes);

                        PasswordResetToken resetToken = PasswordResetToken.builder()
                                        .user(user)
                                        .tokenHash(tokenHash)
                                        .expiresAt(expiresAt)
                                        .build();
                        passwordResetTokenRepository.save(resetToken);

                        if (returnResetToken) {
                                response.put("resetToken", rawToken);
                                response.put("expiresAt", expiresAt.toString());
                        }
                });

                return response;
        }

        @Transactional
        public Map<String, Object> resetPassword(String rawToken, String newPassword) {
                if (rawToken == null || rawToken.isBlank()) {
                        throw new RuntimeException("Reset token is required.");
                }
                if (newPassword == null || newPassword.isBlank()) {
                        throw new RuntimeException("New password is required.");
                }

                String tokenHash = hashToken(rawToken.trim());
                PasswordResetToken resetToken = passwordResetTokenRepository
                                .findByTokenHashAndUsedAtIsNull(tokenHash)
                                .orElseThrow(() -> new RuntimeException("Reset token is invalid or expired."));

                if (resetToken.getExpiresAt().isBefore(LocalDateTime.now())) {
                        resetToken.setUsedAt(LocalDateTime.now());
                        passwordResetTokenRepository.save(resetToken);
                        throw new RuntimeException("Reset token is invalid or expired.");
                }

                User user = resetToken.getUser();
                user.setPasswordHash(passwordEncoder.encode(newPassword));
                userRepository.save(user);

                resetToken.setUsedAt(LocalDateTime.now());
                passwordResetTokenRepository.save(resetToken);

                return Map.of("message", "Password reset successful. You can now sign in.");
        }

        private String generateResetToken() {
                byte[] bytes = new byte[32];
                secureRandom.nextBytes(bytes);
                return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
        }

        private String hashToken(String token) {
                try {
                        MessageDigest digest = MessageDigest.getInstance("SHA-256");
                        byte[] hashed = digest.digest(token.getBytes(StandardCharsets.UTF_8));
                        StringBuilder builder = new StringBuilder();
                        for (byte b : hashed) {
                                builder.append(String.format("%02x", b));
                        }
                        return builder.toString();
                } catch (Exception e) {
                        throw new RuntimeException("Unable to hash reset token", e);
                }
        }
}
