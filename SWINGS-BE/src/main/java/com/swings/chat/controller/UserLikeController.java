package com.swings.chat.controller;

import com.swings.chat.dto.SentLikeDTO;
import com.swings.chat.service.UserLikeService;
import com.swings.user.service.UserPointService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/likes")
@RequiredArgsConstructor
public class UserLikeController {

    private final UserLikeService userLikeService;
    private final UserPointService userPointService; // 💰 포인트 차감 서비스

    //  좋아요 요청 (무료 3회 + 이후 유료)
    @PostMapping("/{fromUserId}/{toUserId}")
    public ResponseEntity<String> sendLike(
            @PathVariable("fromUserId") String fromUserId,
            @PathVariable("toUserId") String toUserId,
            @RequestParam(name = "paid", required = false, defaultValue = "false") boolean paid,
            Authentication authentication
    ) {
        if (!isCurrentUser(authentication, fromUserId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("다른 사용자의 좋아요를 보낼 수 없습니다.");
        }

        if (fromUserId.equals(toUserId)) {
            return ResponseEntity.badRequest().body("자기 자신에게 좋아요를 보낼 수 없습니다.");
        }

        if (userLikeService.hasLiked(fromUserId, toUserId)) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("이미 좋아요를 보낸 사용자입니다.");
        }

        boolean canSendFreeLike = userLikeService.canSendLike(authentication.getName());

        if (!canSendFreeLike && !paid) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("무료 좋아요 횟수 초과");
        }

        if (!canSendFreeLike && paid) {
            try {
                userPointService.usePoint(authentication.getName(), 1, "좋아요 사용");
            } catch (IllegalArgumentException e) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("포인트 부족");
            }
        }

        userLikeService.likeUser(authentication.getName(), toUserId);
        return ResponseEntity.ok("좋아요 성공");
    }


    //  매칭 여부 확인
    @GetMapping("/match/{fromUserId}/{toUserId}")
    public ResponseEntity<Boolean> checkMatch(
            @PathVariable("fromUserId") String fromUserId,
            @PathVariable("toUserId") String toUserId,
            Authentication authentication
    ) {
        if (!isCurrentUser(authentication, fromUserId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        boolean isMatched = userLikeService.isMatched(authentication.getName(), toUserId);
        return ResponseEntity.ok(isMatched);
    }

    //  보낸 좋아요
    @GetMapping("/sent")
    public ResponseEntity<List<SentLikeDTO>> getMySentLikes(Authentication authentication) {
        List<SentLikeDTO> result = userLikeService.getSentLikesWithMutual(authentication.getName());
        return ResponseEntity.ok(result);
    }

    //  받은 + 보낸 좋아요 통합 리스트
    @GetMapping("/all/{userId}")
    public ResponseEntity<Map<String, List<SentLikeDTO>>> getAllLikes(
            @PathVariable("userId") String userId,
            Authentication authentication
    ) {
        if (!isCurrentUser(authentication, userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        return ResponseEntity.ok(userLikeService.getSentAndReceivedLikes(authentication.getName()));
    }
    //  남은 좋아요 수 조회 API
    @GetMapping("/count/{username}")
    public ResponseEntity<Integer> getDailyLikeCount(
            @PathVariable("username") String username,
            Authentication authentication
    ) {
        if (!isCurrentUser(authentication, username)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        LocalDateTime todayStart = LocalDateTime.of(LocalDate.now(), LocalTime.MIDNIGHT);
        int count = userLikeService.countTodayLikes(authentication.getName(), todayStart);
        int remaining = Math.max(0, 3 - count); // 하루 3개가 기본
        return ResponseEntity.ok(remaining);
    }

    private boolean isCurrentUser(Authentication authentication, String username) {
        return authentication != null && username.equals(authentication.getName());
    }

}
