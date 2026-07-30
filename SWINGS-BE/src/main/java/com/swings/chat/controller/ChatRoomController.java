package com.swings.chat.controller;

import com.swings.chat.dto.ChatRoomResponseDto;
import com.swings.chat.entity.ChatRoomEntity;
import com.swings.chat.service.ChatRoomService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatRoomController {

    private final ChatRoomService chatRoomService;

    @GetMapping("/rooms")
    public ResponseEntity<List<ChatRoomResponseDto>> getRooms(
            @RequestParam("userId") String userId,
            Authentication authentication
    ) {
        if (!isCurrentUser(authentication, userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        List<ChatRoomResponseDto> chatRooms = chatRoomService.getChatRoomsByUser(authentication.getName());
        return ResponseEntity.ok(chatRooms);
    }

    @PostMapping("/room")
    public ResponseEntity<ChatRoomEntity> createOrGetChatRoom(
            @RequestParam("user1") String user1,
            @RequestParam("user2") String user2,
            @RequestParam(name = "isSuperChat", required = false, defaultValue = "false") boolean isSuperChat,
            Authentication authentication
    ) {
        if (!isCurrentUser(authentication, user1)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        if (user1.equals(user2)) {
            return ResponseEntity.badRequest().build();
        }

        ChatRoomEntity chatRoom = chatRoomService.createOrGetChatRoom(
                authentication.getName(),
                user2,
                isSuperChat
        );
        return ResponseEntity.ok(chatRoom);
    }

    @PostMapping("/leave")
    public ResponseEntity<Void> leaveRoom(
            @RequestParam("roomId") Long roomId,
            @RequestParam("username") String username,
            Authentication authentication
    ) {
        if (!isCurrentUser(authentication, username)
                || !chatRoomService.isParticipant(roomId, authentication.getName())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        chatRoomService.leaveChatRoom(roomId, authentication.getName());
        return ResponseEntity.ok().build();
    }

    private boolean isCurrentUser(Authentication authentication, String username) {
        return authentication != null && username.equals(authentication.getName());
    }
}
