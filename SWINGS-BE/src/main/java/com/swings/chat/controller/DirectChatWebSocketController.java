package com.swings.chat.controller;

import com.swings.chat.dto.ChatMessageDTO;
import com.swings.chat.service.ChatMessageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.security.Principal;

@Controller
@RequiredArgsConstructor
@Slf4j
@ConditionalOnProperty(name = "app.redis.enabled", havingValue = "false", matchIfMissing = true)
public class DirectChatWebSocketController {

    private final ChatMessageService chatMessageService;
    private final SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/chat/message")
    public void handleChatMessage(ChatMessageDTO message, Principal principal) {
        ChatMessageDTO saved = chatMessageService.saveAndReturnDTO(
                message.getRoomId(),
                principal.getName(),
                message.getContent()
        );

        messagingTemplate.convertAndSend("/topic/chat/" + saved.getRoomId(), saved);
        log.info("Broadcast personal chat message for room {}", saved.getRoomId());
    }
}
