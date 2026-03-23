package com.swings.user.controller;

import com.swings.user.dto.PasswordResetRequestDTO;
import com.swings.user.dto.UserDTO;
import com.swings.user.dto.UserPointDTO;
import com.swings.user.entity.UserEntity;
import com.swings.user.repository.UserPointRepository;
import com.swings.user.repository.UserRepository;
import com.swings.user.service.UserPointService;
import com.swings.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    @Value("${file.upload-dir}")
    private String uploadDir;

    private final UserService userService;
    private final UserPointService userPointService;
    private final UserRepository userRepository;
    private final UserPointRepository userPointRepository;

    @PostMapping("/signup")
    public ResponseEntity<String> registerUser(@RequestBody UserDTO dto) {
        try {
            UserEntity newUser = userService.registerUser(dto);
            return ResponseEntity.ok("회원가입 성공! ID: " + newUser.getUserId());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
        }
    }

    @GetMapping("/check-username")
    public ResponseEntity<Map<String, Boolean>> checkUsername(@RequestParam("username") String username) {
        Map<String, Boolean> response = new HashMap<>();
        response.put("exists", userService.isUsernameExists(username));
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{username}")
    public ResponseEntity<UserEntity> getUserByUsername(@PathVariable("username") String username) {
        return ResponseEntity.ok(userService.getUserByUsername(username));
    }

    @GetMapping("/me")
    public ResponseEntity<UserDTO> getCurrentUser() {
        return ResponseEntity.ok(userService.getCurrentUserDto());
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleIllegalArgument(IllegalArgumentException e) {
        HttpStatus status = "인증 정보가 유효하지 않습니다.".equals(e.getMessage())
                ? HttpStatus.UNAUTHORIZED
                : HttpStatus.BAD_REQUEST;

        Map<String, String> response = new HashMap<>();
        response.put("message", e.getMessage());

        return ResponseEntity.status(status).body(response);
    }

    @PatchMapping("/{username}")
    public ResponseEntity<String> updateUser(@PathVariable("username") String username, @RequestBody UserDTO dto) {
        UserEntity updatedUser = userService.updateUser(username, dto);
        return ResponseEntity.ok("회원 정보 수정 완료! ID:" + updatedUser.getUserId());
    }

    @PatchMapping("/me/profile-image")
    public ResponseEntity<String> updateProfileImage(@RequestParam("image") MultipartFile image) {
        try {
            userService.updateProfileImage(image);
            return ResponseEntity.ok("프로필 이미지가 변경되었습니다.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("이미지 업데이트 실패: " + e.getMessage());
        }
    }

    @GetMapping("/me/profile-image/{filename}")
    public ResponseEntity<Resource> getProfileImage(@PathVariable("filename") String filename) {
        try {
            Path path = Paths.get(uploadDir).toAbsolutePath().normalize().resolve(filename);
            Resource resource = new UrlResource(path.toUri());

            if (!resource.exists() || !resource.isReadable()) {
                return ResponseEntity.notFound().build();
            }

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_TYPE, MediaType.IMAGE_JPEG_VALUE)
                    .body(resource);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/delete/me")
    public ResponseEntity<String> deleteWithPassword(@RequestBody UserDTO dto) {
        userService.deleteCurrentUserWithPassword(dto.getPassword());
        return ResponseEntity.ok("회원 탈퇴가 완료되었습니다.");
    }

    @GetMapping("/me/point")
    public ResponseEntity<Integer> getMyPointBalance() {
        int balance = userService.getCurrentUser().getPointBalance();
        return ResponseEntity.ok(balance);
    }

    @GetMapping("/me/pointslog")
    public ResponseEntity<List<UserPointDTO>> getMyPointHistory() {
        String username = userService.getCurrentUser().getUsername();
        return ResponseEntity.ok(userPointService.findPointLogByUsername(username));
    }

    @PostMapping("/me/points/charge")
    public ResponseEntity<String> chargePoints(
            @RequestParam("amount") int amount,
            @RequestParam(name = "description", defaultValue = "포인트 충전") String description
    ) {
        String username = userService.getCurrentUser().getUsername();
        userPointService.chargePoint(username, amount, description);
        return ResponseEntity.ok("포인트 충전 완료");
    }

    @PostMapping("/me/points/use")
    public ResponseEntity<String> usePoints(
            @RequestParam("amount") int amount,
            @RequestParam(name = "description", defaultValue = "포인트 사용") String description
    ) {
        String username = userService.getCurrentUser().getUsername();
        userPointService.usePoint(username, amount, description);
        return ResponseEntity.ok("포인트 사용 완료");
    }

    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@RequestBody PasswordResetRequestDTO request) {
        try {
            userService.resetPassword(request.getUsername(), request.getEmail());
            return ResponseEntity.ok("임시 비밀번호가 이메일로 전송되었습니다.");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
