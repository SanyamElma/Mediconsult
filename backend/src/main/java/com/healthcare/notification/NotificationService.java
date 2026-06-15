package com.healthcare.notification;

import com.healthcare.user.Role;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository repository;

    public void push(Role role, Long targetId, String type, String message) {
        repository.save(Notification.builder()
                .targetRole(role)
                .targetId(targetId)
                .type(type)
                .message(message)
                .read(false)
                .timestamp(Instant.now())
                .build());
    }

    public List<Notification> list(Role role, Long id) {
        return repository.findByTargetRoleAndTargetIdOrderByTimestampDesc(role, id, PageRequest.of(0, 20)).getContent();
    }

    @Transactional
    public void markRead(Role role, Long id) {
        var unread = repository.findByTargetRoleAndTargetIdAndReadFalse(role, id);
        unread.forEach(n -> n.setRead(true));
        repository.saveAll(unread);
    }
}
