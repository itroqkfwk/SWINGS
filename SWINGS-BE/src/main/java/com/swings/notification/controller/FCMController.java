package com.swings.notification.controller;

import com.swings.user.entity.UserEntity;
import com.swings.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/fcm")
@RequiredArgsConstructor
public class FCMController {

    private final UserService userService;

    @PostMapping("/register-token")
    public ResponseEntity<String> registerFcmToken(
            @RequestParam("username") String username,
            @RequestBody String token,
            Authentication authentication
    ) {
        if (authentication == null || !username.equals(authentication.getName())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("다른 사용자의 푸시 토큰을 등록할 수 없습니다.");
        }

        UserEntity currentUser = userService.getUserByUsername(authentication.getName());
        userService.updatePushToken(currentUser.getUsername(), token);

        return ResponseEntity.ok("✅ FCM 토큰 저장 완료");
    }
}
