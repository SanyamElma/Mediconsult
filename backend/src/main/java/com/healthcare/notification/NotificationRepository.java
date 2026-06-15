package com.healthcare.notification;

import com.healthcare.user.Role;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    Page<Notification> findByTargetRoleAndTargetIdOrderByTimestampDesc(Role role, Long targetId, Pageable pageable);

    List<Notification> findByTargetRoleAndTargetIdAndReadFalse(Role role, Long targetId);
}
