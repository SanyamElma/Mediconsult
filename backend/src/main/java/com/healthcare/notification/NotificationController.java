package com.healthcare.notification;

import com.healthcare.common.ApiResponse;
import com.healthcare.user.Role;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@Tag(name = "Notifications")
public class NotificationController {

    private final NotificationService service;

    @GetMapping
    @Operation(summary = "List notifications for a role/recipient")
    public List<Notification> list(@RequestParam Role role, @RequestParam(required = false) Long id) {
        return service.list(role, id);
    }

    @PatchMapping("/read")
    @Operation(summary = "Mark notifications as read")
    public ApiResponse markRead(@RequestParam Role role, @RequestParam(required = false) Long id) {
        service.markRead(role, id);
        return ApiResponse.ok("Marked as read");
    }
}
