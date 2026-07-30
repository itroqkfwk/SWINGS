package com.swings.matchgroupchat;

import com.swings.chat.dto.ChatMessageDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/matchgroupchat")
@RequiredArgsConstructor
public class MatchGroupChatHistoryController {

    private final MatchGroupChatService matchGroupChatService;

    @GetMapping("/{matchGroupId}")
    public List<ChatMessageDTO> getChatMessages(
            @PathVariable Long matchGroupId,
            Authentication authentication
    ) {
        String username = currentUsername(authentication);
        if (!matchGroupChatService.isAcceptedParticipant(matchGroupId, username)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not a participant in this match group.");
        }
        return matchGroupChatService.getMessages(matchGroupId);
    }

    private String currentUsername(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()
                || "anonymousUser".equals(authentication.getName())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication is required.");
        }
        return authentication.getName();
    }
}
