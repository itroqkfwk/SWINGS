package com.swings.chat.config;

import com.swings.chat.service.ChatRoomService;
import com.swings.matchgroupchat.MatchGroupChatService;
import com.swings.security.CustomUserDetails;
import com.swings.security.CustomUserDetailsService;
import com.swings.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

import java.util.Arrays;

@Configuration
@EnableWebSocketMessageBroker
@RequiredArgsConstructor
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private final JwtTokenProvider jwtTokenProvider;
    private final CustomUserDetailsService userDetailsService;
    private final ChatRoomService chatRoomService;
    private final MatchGroupChatService matchGroupChatService;

    @Value("${app.cors.allowed-origin-patterns:http://localhost:5173}")
    private String allowedOriginPatterns;

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/topic");
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns(Arrays.stream(allowedOriginPatterns.split(","))
                        .map(String::trim)
                        .filter(pattern -> !pattern.isEmpty())
                        .toArray(String[]::new))
                .withSockJS();
    }

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(new ChannelInterceptor() {
            @Override
            public Message<?> preSend(Message<?> message, MessageChannel channel) {
                StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
                if (accessor == null || accessor.getCommand() == null) {
                    return message;
                }

                if (StompCommand.CONNECT.equals(accessor.getCommand())) {
                    authenticate(accessor);
                } else if (StompCommand.SEND.equals(accessor.getCommand())
                        || StompCommand.SUBSCRIBE.equals(accessor.getCommand())) {
                    if (accessor.getUser() == null) {
                        throw new AccessDeniedException("Authentication is required for WebSocket messaging.");
                    }

                    if (StompCommand.SUBSCRIBE.equals(accessor.getCommand())) {
                        authorizeSubscription(accessor);
                    }
                }

                return message;
            }
        });
    }

    private void authenticate(StompHeaderAccessor accessor) {
        String authorization = accessor.getFirstNativeHeader("Authorization");
        if (authorization == null || !authorization.startsWith("Bearer ")) {
            throw new AccessDeniedException("A bearer token is required for WebSocket messaging.");
        }

        String token = authorization.substring(7);
        if (!jwtTokenProvider.validateToken(token)) {
            throw new AccessDeniedException("Invalid WebSocket token.");
        }

        UserDetails userDetails = userDetailsService.loadUserByUsername(jwtTokenProvider.extractUsername(token));
        if (userDetails instanceof CustomUserDetails customUserDetails
                && !customUserDetails.isVerified()) {
            throw new AccessDeniedException("Email verification is required for WebSocket messaging.");
        }

        accessor.setUser(new UsernamePasswordAuthenticationToken(
                userDetails,
                null,
                userDetails.getAuthorities()
        ));
    }

    private void authorizeSubscription(StompHeaderAccessor accessor) {
        String destination = accessor.getDestination();
        String username = accessor.getUser().getName();

        if (destination == null) {
            throw new AccessDeniedException("A subscription destination is required.");
        }

        if (destination.startsWith("/topic/chat/")) {
            Long roomId = parseDestinationId(destination, "/topic/chat/");
            if (!chatRoomService.isParticipant(roomId, username)) {
                throw new AccessDeniedException("You are not a participant in this chat room.");
            }
            return;
        }

        if (destination.startsWith("/topic/matchgroup/")) {
            Long groupId = parseDestinationId(destination, "/topic/matchgroup/");
            if (!matchGroupChatService.isAcceptedParticipant(groupId, username)) {
                throw new AccessDeniedException("You are not a participant in this match group.");
            }
            return;
        }

        if (destination.startsWith("/topic/notification/")) {
            String receiver = destination.substring("/topic/notification/".length());
            if (receiver.isBlank() || receiver.contains("/") || !receiver.equals(username)) {
                throw new AccessDeniedException("You can only subscribe to your own notifications.");
            }
        }
    }

    private Long parseDestinationId(String destination, String prefix) {
        try {
            return Long.valueOf(destination.substring(prefix.length()));
        } catch (NumberFormatException exception) {
            throw new AccessDeniedException("Invalid subscription destination.");
        }
    }
}
