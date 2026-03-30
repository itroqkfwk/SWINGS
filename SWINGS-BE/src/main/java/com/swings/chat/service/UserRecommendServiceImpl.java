package com.swings.chat.service;

import com.swings.chat.dto.UserSelectDTO;
import com.swings.chat.repository.UserSelectRepository;
import com.swings.user.entity.UserEntity;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class UserRecommendServiceImpl implements UserRecommendService {

    private final UserSelectRepository userSelectRepository;

    @Override
    @Transactional(readOnly = true)
    public UserSelectDTO getRandomUser(String username) {
        UserEntity currentUser = userSelectRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        if (currentUser.getGender() == null) {
            throw new RuntimeException("추천을 위한 사용자 성별 정보가 없습니다.");
        }

        List<String> likedUsernames =
                Optional.ofNullable(userSelectRepository.findLikedUsernames(username)).orElse(List.of());
        List<String> dislikedUsernames =
                Optional.ofNullable(userSelectRepository.findDislikedUsernames(username)).orElse(List.of());
        List<String> chatUsernames =
                Optional.ofNullable(userSelectRepository.findChatUsernames(username)).orElse(List.of());

        Set<String> excludedUsernames = new HashSet<>();
        excludedUsernames.addAll(likedUsernames);
        excludedUsernames.addAll(dislikedUsernames);
        excludedUsernames.addAll(chatUsernames);
        excludedUsernames.add(username);

        Optional<UserEntity> recommendedUser = userSelectRepository.findFilteredRandomUser(
                currentUser.getGender().name(),
                new ArrayList<>(excludedUsernames)
        );

        if (recommendedUser.isEmpty()) {
            recommendedUser = userSelectRepository.findRandomUser(currentUser.getGender().name());
        }

        UserEntity user = recommendedUser
                .orElseThrow(() -> new RuntimeException("추천할 사용자가 없습니다."));

        return UserSelectDTO.builder()
                .userId(user.getUserId())
                .username(user.getUsername())
                .name(user.getName())
                .gender(user.getGender() != null ? user.getGender().name() : null)
                .userImg(user.getUserImg())
                .introduce(user.getIntroduce())
                .activityRegion(user.getActivityRegion() != null ? user.getActivityRegion().name() : null)
                .targetUserImg(user.getUserImg())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public UserSelectDTO getNextRandomUser(String username, String excludedUsername) {
        return getRandomUser(username);
    }
}
