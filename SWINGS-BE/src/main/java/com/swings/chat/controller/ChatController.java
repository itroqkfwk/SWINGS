package com.swings.chat.controller;

import com.swings.chat.dto.ChatMessageDTO;
import com.swings.chat.service.ChatMessageService;
import com.swings.chat.service.ChatRoomService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatMessageService chatMessageService;
    private final ChatRoomService chatRoomService;

    @PostMapping("/message")
    public ResponseEntity<ChatMessageDTO> saveMessage(
            @RequestBody ChatMessageDTO message,
            Authentication authentication
    ) {
        String username = currentUsername(authentication);
        requireParticipant(message.getRoomId(), username);
        return ResponseEntity.ok(chatMessageService.saveAndReturnDTO(
                message.getRoomId(),
                username,
                message.getContent()
        ));
    }

    @GetMapping("/messages/{roomId}")
    public ResponseEntity<List<ChatMessageDTO>> getMessages(
            @PathVariable Long roomId,
            Authentication authentication
    ) {
        requireParticipant(roomId, currentUsername(authentication));
        return ResponseEntity.ok(chatMessageService.getMessageDTOsByRoomId(roomId));
    }

    @PostMapping("/messages/read")
    public ResponseEntity<Void> markMessagesAsRead(
            @RequestParam Long roomId,
            Authentication authentication
    ) {
        String username = currentUsername(authentication);
        requireParticipant(roomId, username);
        chatMessageService.markMessagesAsRead(roomId, username);
        return ResponseEntity.ok().build();
    }

    private String currentUsername(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()
                || "anonymousUser".equals(authentication.getName())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication is required.");
        }
        return authentication.getName();
    }

    private void requireParticipant(Long roomId, String username) {
        if (roomId == null || !chatRoomService.isParticipant(roomId, username)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not a participant in this chat room.");
        }
    }
}
