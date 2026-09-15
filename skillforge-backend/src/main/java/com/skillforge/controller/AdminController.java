package com.skillforge.controller;

import com.skillforge.dto.request.AdminCreateUserRequest;
import com.skillforge.dto.request.AdminUpdateUserRequest;
import com.skillforge.dto.response.CourseOverviewResponse;
import com.skillforge.dto.response.UserResponse;
import com.skillforge.entity.LearningGoal;
import com.skillforge.entity.User;
import com.skillforge.repository.ExamRepository;
import com.skillforge.repository.LearningGoalRepository;
import com.skillforge.repository.UserRepository;
import com.skillforge.service.CourseStructureService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;
import java.util.stream.Collectors;

@SuppressWarnings("null")
@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final LearningGoalRepository learningGoalRepository;
    private final ExamRepository examRepository;
    private final CourseStructureService courseStructureService;

    @PostMapping("/users")
    public ResponseEntity<UserResponse> createUser(@Valid @RequestBody AdminCreateUserRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        User user = User.builder()
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .role(request.getRole())
                .isActive(true)
                .isVerified(true)
                .build();

        user = Objects.requireNonNull(userRepository.save(user));
        return ResponseEntity.status(HttpStatus.CREATED).body(UserResponse.fromEntity(user));
    }

    @GetMapping("/users")
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        List<UserResponse> users = userRepository.findAll().stream()
                .map(UserResponse::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(users);
    }

    @GetMapping("/users/{userId}")
    public ResponseEntity<UserResponse> getUserById(@PathVariable UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(UserResponse.fromEntity(user));
    }

    @PutMapping("/users/{userId}")
    public ResponseEntity<UserResponse> updateUser(
            @PathVariable UUID userId,
            @Valid @RequestBody AdminUpdateUserRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (request.getFirstName() != null) {
            user.setFirstName(request.getFirstName());
        }
        if (request.getLastName() != null) {
            user.setLastName(request.getLastName());
        }
        if (request.getRole() != null) {
            user.setRole(request.getRole());
        }
        if (request.getIsActive() != null) {
            user.setIsActive(request.getIsActive());
        }
        if (request.getIsVerified() != null) {
            user.setIsVerified(request.getIsVerified());
        }

        user = Objects.requireNonNull(userRepository.save(user));
        return ResponseEntity.ok(UserResponse.fromEntity(user));
    }

    @PutMapping("/users/{userId}/status")
    public ResponseEntity<UserResponse> updateUserStatus(
            @PathVariable UUID userId,
            @RequestBody Map<String, Boolean> request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (request.containsKey("isActive")) {
            user.setIsActive(request.get("isActive"));
        }
        if (request.containsKey("isVerified")) {
            user.setIsVerified(request.get("isVerified"));
        }

        user = Objects.requireNonNull(userRepository.save(user));
        return ResponseEntity.ok(UserResponse.fromEntity(user));
    }

    @DeleteMapping("/users/{userId}")
    public ResponseEntity<Map<String, String>> deleteUser(@PathVariable UUID userId) {
        if (!userRepository.existsById(userId)) {
            throw new RuntimeException("User not found");
        }
        userRepository.deleteById(userId);
        return ResponseEntity.ok(Map.of("message", "User deleted successfully"));
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        long totalUsers = userRepository.count();
        long learners = userRepository.findAll().stream()
                .filter(u -> u.getRole() == User.Role.LEARNER).count();
        long instructors = userRepository.findAll().stream()
                .filter(u -> u.getRole() == User.Role.INSTRUCTOR).count();

        return ResponseEntity.ok(Map.of(
                "totalUsers", totalUsers,
                "learners", learners,
                "instructors", instructors));
    }

    @GetMapping("/courses/{goalId}/overview")
    public ResponseEntity<CourseOverviewResponse> getCourseOverview(@PathVariable UUID goalId) {
        LearningGoal goal = learningGoalRepository.findById(goalId)
                .orElseThrow(() -> new RuntimeException("Goal not found"));

        return ResponseEntity.ok(CourseOverviewResponse.builder()
                .course(goal)
                .modules(courseStructureService.getCourseStructure(goal))
                .assessments(examRepository.findByCourseGoalId(goalId))
                .build());
    }
}
