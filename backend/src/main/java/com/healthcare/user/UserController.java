package com.healthcare.user;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Tag(name = "Users", description = "Patient profile management")
public class UserController {

    private final UserService userService;

    @PutMapping("/{id}")
    @Operation(summary = "Update a patient profile")
    public UserDto update(@PathVariable Long id, @RequestBody UserService.UpdateProfileRequest req) {
        return userService.updateProfile(id, req);
    }
}
