package com.swings.chat.controller;

import com.swings.chat.dto.UserSelectDTO;
import com.swings.chat.service.UserRecommendService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserRecommendController {
    private final UserRecommendService userRecommendService;

    // 무작위 추천 유저 조회 API
    @GetMapping("/{username}/recommend")
    public ResponseEntity<UserSelectDTO> getRandomUser(
            @PathVariable("username") String username,
            Authentication authentication
    ) {
        if (!isCurrentUser(authentication, username)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        UserSelectDTO recommendedUser = userRecommendService.getRandomUser(authentication.getName());
        return ResponseEntity.ok(recommendedUser);
    }

    // 싫어요 후 새로운 유저 추천 API
    @GetMapping("/{username}/next")
    public ResponseEntity<UserSelectDTO> getNextUser(
            @PathVariable("username") String username,
            @RequestParam("excludedUsername") String excludedUsername,
            Authentication authentication
    ) {
        if (!isCurrentUser(authentication, username)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        UserSelectDTO recommendedUser = userRecommendService.getNextRandomUser(
                authentication.getName(),
                excludedUsername
        );
        return ResponseEntity.ok(recommendedUser);
    }

    private boolean isCurrentUser(Authentication authentication, String username) {
        return authentication != null && username.equals(authentication.getName());
    }

}
