package com.swings.chat.controller;

import com.swings.chat.dto.ChatMessageDTO;
import com.swings.chat.redis.RedisPublisher;
import com.swings.chat.service.ChatMessageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
@Slf4j
@ConditionalOnProperty(name = "app.redis.enabled", havingValue = "true")
public class ChatWebSocketController {

    private final ChatMessageService chatMessageService;
    private final RedisPublisher redisPublisher;

    @MessageMapping("/chat/message")
    public void handleChatMessage(ChatMessageDTO message) {
        ChatMessageDTO saved = chatMessageService.saveAndReturnDTO(
                message.getRoomId(),
                message.getSender(),
                message.getContent()
        );

        redisPublisher.publish(saved);
        log.info("Published personal chat message for room {}", saved.getRoomId());
    }
}
