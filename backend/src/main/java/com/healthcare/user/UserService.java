package com.healthcare.user;

import com.healthcare.exception.ResourceNotFoundException;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    @Transactional
    public UserDto updateProfile(Long id, UpdateProfileRequest req) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", id));
        if (req.getName() != null) user.setName(req.getName());
        if (req.getPhone() != null) user.setPhone(req.getPhone());
        if (req.getProfilePicture() != null) user.setProfilePicture(req.getProfilePicture());
        return UserDto.from(userRepository.save(user));
    }

    @Data
    public static class UpdateProfileRequest {
        private String name;
        private String phone;
        private String profilePicture;
    }
}
