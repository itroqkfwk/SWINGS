package com.swings.notification.controller;

import com.swings.notification.dto.NotificationDTO;
import com.swings.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/notification")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    // 전체 알림 내역 조회
    @GetMapping("/list")
    public ResponseEntity<List<NotificationDTO>> getAllNotifications(
            @RequestParam("receiver") String receiver,
            Authentication authentication
    ) {
        if (!isCurrentUser(authentication, receiver)) {
            return ResponseEntity.status(403).build();
        }

        List<NotificationDTO> notifications = notificationService
                .getNotificationsByReceiver(authentication.getName()).stream()
                .map(NotificationDTO::fromEntity)
                .collect(Collectors.toList());

        return ResponseEntity.ok(notifications);
    }

    // 알림 읽음 처리
    @PutMapping("/read/{notificationId}")
    public ResponseEntity<String> markAsRead(
            @PathVariable("notificationId") Long notificationId,
            Authentication authentication
    ) {
        notificationService.markAsRead(notificationId, authentication.getName());
        return ResponseEntity.ok("알림 읽음 처리 완료");
    }

    // 알림 삭제
    @DeleteMapping("/delete/{notificationId}")
    public ResponseEntity<String> deleteNotification(
            @PathVariable("notificationId") Long notificationId,
            Authentication authentication
    ) {
        notificationService.deleteNotification(notificationId, authentication.getName());
        return ResponseEntity.ok("알림 삭제 완료");
    }

    private boolean isCurrentUser(Authentication authentication, String username) {
        return authentication != null && username.equals(authentication.getName());
    }


}
