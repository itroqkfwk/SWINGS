package com.swings.chat.controller;

import com.swings.chat.dto.ChatRoomResponseDto;
import com.swings.chat.entity.ChatRoomEntity;
import com.swings.chat.service.ChatRoomService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatRoomController {

    private final ChatRoomService chatRoomService;

    @GetMapping("/rooms")
    public ResponseEntity<List<ChatRoomResponseDto>> getRooms(@RequestParam("userId") String userId) {
        List<ChatRoomResponseDto> chatRooms = chatRoomService.getChatRoomsByUser(userId);
        return ResponseEntity.ok(chatRooms);
    }

    @PostMapping("/room")
    public ResponseEntity<ChatRoomEntity> createOrGetChatRoom(
            @RequestParam("user1") String user1,
            @RequestParam("user2") String user2,
            @RequestParam(name = "isSuperChat", required = false, defaultValue = "false") boolean isSuperChat
    ) {
        ChatRoomEntity chatRoom = chatRoomService.createOrGetChatRoom(user1, user2, isSuperChat);
        return ResponseEntity.ok(chatRoom);
    }

    @PostMapping("/leave")
    public void leaveRoom(@RequestParam("roomId") Long roomId, @RequestParam("username") String username) {
        chatRoomService.leaveChatRoom(roomId, username);
    }
}
