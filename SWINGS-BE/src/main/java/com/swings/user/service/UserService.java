package com.swings.user.service;

import com.swings.user.dto.UserDTO;
import com.swings.user.entity.UserEntity;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface UserService {
    boolean isUsernameExists(String username);

    UserEntity registerUser(UserDTO dto);

    UserEntity getUserByUsername(String username);

    UserEntity getCurrentUser();

    UserDTO getCurrentUserDto();

    UserDTO convertToDto(UserEntity user);

    UserEntity updateUser(String username, UserDTO dto);

    void deleteCurrentUserWithPassword(String password);

    void updateProfileImage(MultipartFile image);

    void resetProfileImage();

    List<UserEntity> getAllUsers();

    List<UserDTO> getAllUsersDto();

    void deleteUserByUsername(String username);

    void updateUserRole(String username, String newRole);

    void resetPassword(String username, String email);

    void updatePushToken(String username, String token);
}
