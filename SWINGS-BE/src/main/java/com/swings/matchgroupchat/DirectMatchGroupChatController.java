package com.swings.matchgroupchat;

import com.swings.chat.dto.ChatMessageDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Controller;

import java.security.Principal;
import java.time.LocalDateTime;

@Controller
@RequiredArgsConstructor
@ConditionalOnProperty(name = "app.redis.enabled", havingValue = "false", matchIfMissing = true)
public class DirectMatchGroupChatController {

    private final MatchGroupChatService matchGroupChatService;
    private final SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/chat.send/{roomId}")
    public void sendMessage(
            @DestinationVariable Long roomId,
            ChatMessageDTO chatMessage,
            Principal principal
    ) {
        if (!matchGroupChatService.isAcceptedParticipant(roomId, principal.getName())) {
            throw new AccessDeniedException("You are not a participant in this match group.");
        }

        chatMessage.setRoomId(roomId);
        chatMessage.setSender(principal.getName());
        chatMessage.setSentAt(LocalDateTime.now());
        matchGroupChatService.save(chatMessage);
        messagingTemplate.convertAndSend("/topic/matchgroup/" + roomId, chatMessage);
    }
}
