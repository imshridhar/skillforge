package com.skillforge.controller;

import com.skillforge.entity.Notification;
import com.skillforge.entity.User;
import com.skillforge.repository.NotificationRepository;
import com.skillforge.repository.UserRepository;
import com.skillforge.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('LEARNER', 'INSTRUCTOR', 'ADMIN')")
public class NotificationController {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<Notification>> getNotifications(@AuthenticationPrincipal UserPrincipal principal) {
        User user = getCurrentUser(principal);
        return ResponseEntity.ok(notificationRepository.findByUserUserIdOrderByCreatedAtDesc(user.getUserId()));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Object>> getUnreadCount(@AuthenticationPrincipal UserPrincipal principal) {
        User user = getCurrentUser(principal);
        long count = notificationRepository.countByUserUserIdAndIsReadFalse(user.getUserId());
        Map<String, Object> response = new HashMap<>();
        response.put("count", count);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{notificationId}/read")
    public ResponseEntity<Notification> markRead(
            @PathVariable UUID notificationId,
            @AuthenticationPrincipal UserPrincipal principal) {
        User user = getCurrentUser(principal);
        Notification notification = notificationRepository.findByNotificationIdAndUserUserId(notificationId, user.getUserId())
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        notification.setIsRead(true);
        return ResponseEntity.ok(notificationRepository.save(notification));
    }

    @PutMapping("/read-all")
    public ResponseEntity<Map<String, Object>> markAllRead(@AuthenticationPrincipal UserPrincipal principal) {
        User user = getCurrentUser(principal);
        List<Notification> unread = notificationRepository.findByUserUserIdAndIsReadFalse(user.getUserId());
        unread.forEach(notification -> notification.setIsRead(true));
        notificationRepository.saveAll(unread);
        return ResponseEntity.ok(Map.of("message", "All notifications marked as read"));
    }

    private User getCurrentUser(UserPrincipal principal) {
        return userRepository.findByEmail(principal.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
