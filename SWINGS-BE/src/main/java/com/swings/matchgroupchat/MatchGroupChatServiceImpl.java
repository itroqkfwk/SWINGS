package com.swings.matchgroupchat;

import com.swings.chat.dto.ChatMessageDTO;
import com.swings.matchgroup.entity.MatchGroupEntity;
import com.swings.matchgroup.entity.MatchParticipantEntity;
import com.swings.matchgroup.repository.MatchGroupRepository;
import com.swings.matchgroup.repository.MatchParticipantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MatchGroupChatServiceImpl implements MatchGroupChatService {

    private final MatchGroupRepository matchGroupRepository;
    private final MatchGroupChatRepository matchGroupChatRepository;
    private final MatchParticipantRepository matchParticipantRepository;

    @Override
    public void save(ChatMessageDTO dto) {
        MatchGroupEntity group = matchGroupRepository.findById(dto.getRoomId())
                .orElseThrow(() -> new IllegalArgumentException("Match group does not exist."));

        if (!isAcceptedParticipant(dto.getRoomId(), dto.getSender())) {
            throw new IllegalArgumentException("The sender is not an accepted group participant.");
        }
        if (dto.getContent() == null || dto.getContent().isBlank()) {
            throw new IllegalArgumentException("Message content is required.");
        }

        MatchGroupChatEntity message = MatchGroupChatEntity.builder()
                .matchGroup(group)
                .sender(dto.getSender())
                .content(dto.getContent())
                .sentAt(dto.getSentAt() != null ? dto.getSentAt() : LocalDateTime.now())
                .isRead(false)
                .build();

        matchGroupChatRepository.save(message);
    }

    @Override
    public List<ChatMessageDTO> getMessages(Long matchGroupId) {
        return matchGroupChatRepository.findByMatchGroup_MatchGroupIdOrderBySentAt(matchGroupId)
                .stream()
                .map(entity -> ChatMessageDTO.builder()
                        .roomId(entity.getMatchGroup().getMatchGroupId())
                        .sender(entity.getSender())
                        .content(entity.getContent())
                        .sentAt(entity.getSentAt())
                        .build()
                )
                .toList();
    }

    @Override
    public boolean isAcceptedParticipant(Long matchGroupId, String username) {
        return username != null && matchParticipantRepository
                .existsByMatchGroup_MatchGroupIdAndUser_UsernameAndParticipantStatus(
                        matchGroupId,
                        username,
                        MatchParticipantEntity.ParticipantStatus.ACCEPTED
                );
    }
}
