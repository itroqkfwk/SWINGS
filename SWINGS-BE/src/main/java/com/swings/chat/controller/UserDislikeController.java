package com.swings.chat.controller;


import com.swings.chat.service.UserDislikeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dislikes")
@RequiredArgsConstructor
public class UserDislikeController {

    private final UserDislikeService userDislikeService;

    @PostMapping("/{fromUsername}/{toUsername}")
    public ResponseEntity<String> dislikeUser(
            @PathVariable("fromUsername") String fromUsername,
            @PathVariable("toUsername") String toUsername,
            Authentication authentication
    ) {
        if (authentication == null || !fromUsername.equals(authentication.getName())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("다른 사용자의 싫어요를 보낼 수 없습니다.");
        }

        if (fromUsername.equals(toUsername)) {
            return ResponseEntity.badRequest().body("자기 자신에게 싫어요를 보낼 수 없습니다.");
        }

        userDislikeService.dislikeUser(authentication.getName(), toUsername);
        return ResponseEntity.ok("싫어요를 눌렀습니다.");
    }
}
