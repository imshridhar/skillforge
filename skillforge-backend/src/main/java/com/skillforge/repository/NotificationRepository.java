package com.skillforge.repository;

import com.skillforge.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, UUID> {
    List<Notification> findByUserUserIdOrderByCreatedAtDesc(UUID userId);

    List<Notification> findByUserUserIdAndIsReadFalse(UUID userId);

    long countByUserUserIdAndIsReadFalse(UUID userId);

    Optional<Notification> findByNotificationIdAndUserUserId(UUID notificationId, UUID userId);
}
