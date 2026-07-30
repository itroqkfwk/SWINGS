package com.swings.chat.service;

import com.swings.chat.dto.SentLikeDTO;
import com.swings.chat.entity.UserLikeEntity;
import com.swings.chat.repository.UserLikeRepository;
import com.swings.notification.service.FCMService;
import com.swings.user.entity.UserEntity;
import com.swings.user.repository.UserRepository;
import com.swings.user.service.UserPointService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserLikeServiceImpl implements UserLikeService {

    private final UserLikeRepository userLikeRepository;
    private final ChatRoomService chatRoomService;
    private final UserRepository userRepository;
    private final FCMService fcmService;
    private final UserPointService userPointService;

    @Override
    @Transactional
    public void likeUser(String fromUserId, String toUserId) {
        boolean alreadyLiked = userLikeRepository.existsByFromUserIdAndToUserId(fromUserId, toUserId);

        if (!alreadyLiked) {
            userLikeRepository.save(UserLikeEntity.builder()
                    .fromUserId(fromUserId)
                    .toUserId(toUserId)
                    .build());

            // FCM 푸시 알림 전송
            userRepository.findByUsername(toUserId).ifPresent(target -> {
                if (target.getPushToken() != null) {
                    fcmService.sendPush(
                            target.getPushToken(),
                            "❤️ 좋아요 알림",
                            fromUserId + "님이 당신을 좋아합니다."
                    );
                }
            });
        }else{
            return;

        }

        // 채팅방 생성 및 알림 전송
        if (isMatched(fromUserId, toUserId)) {
            chatRoomService.createOrGetChatRoom(fromUserId, toUserId);

            // toUserId → fromUserId
            userRepository.findByUsername(toUserId).ifPresent(target -> {
                if (target.getPushToken() != null) {
                    fcmService.sendPush(
                            target.getPushToken(),
                            "💘 매칭 성사!",
                            fromUserId + "님과 매칭이 성사되었습니다! 채팅을 시작해보세요."
                    );
                }
            });

            // fromUserId → toUserId
            userRepository.findByUsername(fromUserId).ifPresent(source -> {
                if (source.getPushToken() != null) {
                    fcmService.sendPush(
                            source.getPushToken(),
                            "💘 매칭 성사!",
                            toUserId + "님과 매칭이 성사되었습니다! 채팅을 시작해보세요."
                    );
                }
            });
        }
    }

    @Override
    public boolean hasLiked(String fromUserId, String toUserId) {
        return userLikeRepository.existsByFromUserIdAndToUserId(fromUserId, toUserId);
    }

    @Override
    public boolean isMatched(String fromUserId, String toUserId) {
        return userLikeRepository.countMutualLike(fromUserId, toUserId) == 2;
    }

    @Override
    public List<SentLikeDTO> getSentLikesWithMutual(String fromUsername) {
        List<UserLikeEntity> sentLikes = userLikeRepository.findByFromUserId(fromUsername);

        return sentLikes.stream().map(like -> {
            String toUserId = like.getToUserId();

            UserEntity toUser = userRepository.findByUsername(toUserId)
                    .orElseThrow(() -> new IllegalArgumentException("상대방 유저 없음: " + toUserId));

            boolean isMutual = userLikeRepository.existsByFromUserIdAndToUserId(toUserId, fromUsername);

            return SentLikeDTO.builder()
                    .username(toUser.getUsername())
                    .name(toUser.getName())
                    .userImg(toUser.getUserImg())
                    .isMutual(isMutual)
                    .build();
        }).collect(Collectors.toList());
    }

    @Override
    public List<UserLikeEntity> getLikesReceived(String toUserId) {
        return userLikeRepository.findByToUserId(toUserId);
    }

    @Override
    public Map<String, List<SentLikeDTO>> getSentAndReceivedLikes(String userId) {
        List<UserLikeEntity> sentLikes = userLikeRepository.findByFromUserId(userId);
        List<UserLikeEntity> receivedLikes = userLikeRepository.findByToUserId(userId);

        List<SentLikeDTO> sentResult = sentLikes.stream().map(like -> {
            UserEntity toUser = userRepository.findByUsername(like.getToUserId())
                    .orElseThrow(() -> new IllegalArgumentException("유저 없음"));
            boolean isMutual = userLikeRepository.existsByFromUserIdAndToUserId(like.getToUserId(), userId);
            return SentLikeDTO.builder()
                    .username(toUser.getUsername())
                    .name(toUser.getName())
                    .userImg(toUser.getUserImg())
                    .isMutual(isMutual)
                    .build();
        }).collect(Collectors.toList());

        List<SentLikeDTO> receivedResult = receivedLikes.stream().map(like -> {
            UserEntity fromUser = userRepository.findByUsername(like.getFromUserId())
                    .orElseThrow(() -> new IllegalArgumentException("유저 없음"));
            boolean isMutual = userLikeRepository.existsByFromUserIdAndToUserId(userId, fromUser.getUsername());
            return SentLikeDTO.builder()
                    .username(fromUser.getUsername())
                    .name(fromUser.getName())
                    .userImg(fromUser.getUserImg())
                    .isMutual(isMutual)
                    .build();
        }).collect(Collectors.toList());

        Map<String, List<SentLikeDTO>> result = new HashMap<>();
        result.put("sentLikes", sentResult);
        result.put("receivedLikes", receivedResult);
        return result;
    }

    @Override
    public boolean canSendLike(String username) {
        LocalDateTime todayStart = LocalDateTime.of(LocalDate.now(), LocalTime.MIDNIGHT);
        int count = userLikeRepository.countByFromUserIdAndCreatedAtAfter(username, todayStart);
        return count < 3;
    }

    @Override
    public int countTodayLikes(String username, LocalDateTime since) {
        return userLikeRepository.countByFromUserIdAndCreatedAtAfter(username, since);
    }
}
