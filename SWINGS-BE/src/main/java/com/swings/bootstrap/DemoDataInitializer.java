package com.swings.bootstrap;

import com.swings.chat.entity.ChatRoomEntity;
import com.swings.chat.entity.UserLikeEntity;
import com.swings.chat.repository.ChatRoomRepository;
import com.swings.chat.repository.UserLikeRepository;
import com.swings.feed.entity.FeedEntity;
import com.swings.feed.repository.FeedRepository;
import com.swings.matchgroup.entity.MatchGroupEntity;
import com.swings.matchgroup.entity.MatchParticipantEntity;
import com.swings.matchgroup.repository.MatchGroupRepository;
import com.swings.matchgroup.repository.MatchParticipantRepository;
import com.swings.user.entity.UserEntity;
import com.swings.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Timestamp;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DemoDataInitializer implements CommandLineRunner {

    private static final String DEMO_PASSWORD = "Passw0rd!";
    private static final String DEMO_FEED_CAPTION =
            "오늘은 스크린에서 아이언 탄도가 잘 나와서 기분 좋은 하루였습니다. 다음 라운드 같이 가실 분 구해요.";

    private final UserRepository userRepository;
    private final FeedRepository feedRepository;
    private final MatchGroupRepository matchGroupRepository;
    private final MatchParticipantRepository matchParticipantRepository;
    private final UserLikeRepository userLikeRepository;
    private final ChatRoomRepository chatRoomRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        UserEntity adminUser = ensureAdminUserDefaults();

        UserEntity demoFieldHost = getOrCreateUser(
                "demo_field_host",
                "민서",
                UserEntity.Gender.female,
                "demo.field.host@swings.local",
                "서울 강서구에서 자주 라운딩하는 골퍼입니다. 편하게 조인해요.",
                UserEntity.ActivityRegion.SEOUL,
                15_000
        );

        UserEntity demoScreenMate = getOrCreateUser(
                "demo_screen_mate",
                "서윤",
                UserEntity.Gender.female,
                "demo.screen.mate@swings.local",
                "퇴근 후 스크린 골프 한 게임 즐기는 걸 좋아해요.",
                UserEntity.ActivityRegion.GYEONGGI,
                8_000
        );

        UserEntity demoWeekendGolfer = getOrCreateUser(
                "demo_weekend_golfer",
                "하린",
                UserEntity.Gender.female,
                "demo.weekend.golfer@swings.local",
                "주말 아침 조인을 선호하고 초중급 라운드를 즐깁니다.",
                UserEntity.ActivityRegion.INCHEON,
                6_000
        );

        UserEntity demoMatchMate = getOrCreateUser(
                "demo_match_mate",
                "지훈",
                UserEntity.Gender.male,
                "demo.match.mate@swings.local",
                "필드도 좋고 스크린도 좋아하는 올라운더입니다.",
                UserEntity.ActivityRegion.SEOUL,
                5_000
        );

        UserEntity demoFeedWriter = getOrCreateUser(
                "demo_feed_writer",
                "유진",
                UserEntity.Gender.female,
                "demo.feed.writer@swings.local",
                "연습장 루틴과 라운드 기록을 공유하는 걸 좋아해요.",
                UserEntity.ActivityRegion.BUSAN,
                4_000
        );

        seedFeed(demoFeedWriter, List.of(demoFieldHost, demoScreenMate));
        seedFieldGroup(demoFieldHost, demoMatchMate);
        seedScreenGroup(demoScreenMate, demoWeekendGolfer);
        seedLikesForAdmin(adminUser, List.of(demoFieldHost, demoScreenMate, demoWeekendGolfer));
        seedMutualLikeAndChat(demoMatchMate, demoScreenMate);

        log.info("Demo data initialization completed.");
    }

    private UserEntity ensureAdminUserDefaults() {
        return userRepository.findByUsername("1")
                .map(user -> {
                    boolean changed = false;

                    if (user.getName() == null || user.getName().isBlank()) {
                        user.setName("관리자");
                        changed = true;
                    }
                    if (user.getGender() == null) {
                        user.setGender(UserEntity.Gender.male);
                        changed = true;
                    }
                    if (user.getBirthDate() == null) {
                        user.setBirthDate(LocalDate.of(1995, 1, 1));
                        changed = true;
                    }
                    if (user.getPhonenumber() == null || user.getPhonenumber().isBlank()) {
                        user.setPhonenumber("010-1111-1111");
                        changed = true;
                    }
                    if (user.getEmail() == null || user.getEmail().isBlank()) {
                        user.setEmail("admin1@swings.local");
                        changed = true;
                    }
                    if (user.getJob() == null || user.getJob().isBlank()) {
                        user.setJob("관리자");
                        changed = true;
                    }
                    if (user.getGolfSkill() == null) {
                        user.setGolfSkill(UserEntity.GolfSkill.intermediate);
                        changed = true;
                    }
                    if (user.getMbti() == null || user.getMbti().isBlank()) {
                        user.setMbti("ENTJ");
                        changed = true;
                    }
                    if (user.getHobbies() == null || user.getHobbies().isBlank()) {
                        user.setHobbies("골프, 운영 관리");
                        changed = true;
                    }
                    if (user.getReligion() == null || user.getReligion().isBlank()) {
                        user.setReligion("none");
                        changed = true;
                    }
                    if (user.getSmoking() == null) {
                        user.setSmoking(UserEntity.YesNo.no);
                        changed = true;
                    }
                    if (user.getDrinking() == null) {
                        user.setDrinking(UserEntity.YesNo.no);
                        changed = true;
                    }
                    if (user.getIntroduce() == null) {
                        user.setIntroduce("SWINGS 관리자 계정입니다.");
                        changed = true;
                    }
                    if (user.getRole() == null) {
                        user.setRole(UserEntity.Role.admin);
                        changed = true;
                    }
                    if (user.getActivityRegion() == null) {
                        user.setActivityRegion(UserEntity.ActivityRegion.SEOUL);
                        changed = true;
                    }
                    if (!user.isVerified()) {
                        user.setVerified(true);
                        changed = true;
                    }

                    return changed ? userRepository.save(user) : user;
                })
                .orElse(null);
    }

    private UserEntity getOrCreateUser(
            String username,
            String name,
            UserEntity.Gender gender,
            String email,
            String introduce,
            UserEntity.ActivityRegion region,
            int pointBalance
    ) {
        return userRepository.findByUsername(username).orElseGet(() -> {
            UserEntity user = UserEntity.builder()
                    .username(username)
                    .password(passwordEncoder.encode(DEMO_PASSWORD))
                    .name(name)
                    .gender(gender)
                    .birthDate(LocalDate.of(1997, 5, 12))
                    .phonenumber(generatePhoneNumber(username))
                    .email(email)
                    .job("회사원")
                    .golfSkill(UserEntity.GolfSkill.intermediate)
                    .mbti("ENFP")
                    .hobbies("골프, 맛집 탐방, 드라이브")
                    .religion("none")
                    .smoking(UserEntity.YesNo.no)
                    .drinking(UserEntity.YesNo.yes)
                    .introduce(introduce)
                    .role(UserEntity.Role.player)
                    .createdAt(Timestamp.valueOf(LocalDateTime.now().minusDays(3)))
                    .activityRegion(region)
                    .pointBalance(pointBalance)
                    .isVerified(true)
                    .build();

            return userRepository.save(user);
        });
    }

    private void seedFeed(UserEntity writer, List<UserEntity> likedUsers) {
        FeedEntity feed = feedRepository.findAll().stream()
                .filter(currentFeed -> writer.getUserId().equals(currentFeed.getUser().getUserId()))
                .filter(currentFeed -> DEMO_FEED_CAPTION.equals(currentFeed.getCaption()))
                .findFirst()
                .orElseGet(() -> feedRepository.save(
                        FeedEntity.builder()
                                .user(writer)
                                .caption(DEMO_FEED_CAPTION)
                                .imageUrl(null)
                                .createdAt(LocalDateTime.now().minusHours(4))
                                .likes(0)
                                .build()
                ));

        feed.getLikedUsers().addAll(likedUsers);
        feed.setLikes(feed.getLikedUsers().size());
        feedRepository.save(feed);
    }

    private void seedFieldGroup(UserEntity host, UserEntity acceptedParticipant) {
        MatchGroupEntity matchGroup = matchGroupRepository.findAll().stream()
                .filter(group -> "주말 오전 한강뷰 필드 라운드".equals(group.getGroupName()))
                .findFirst()
                .orElseGet(() -> matchGroupRepository.save(
                        MatchGroupEntity.builder()
                                .host(host)
                                .groupName("주말 오전 한강뷰 필드 라운드")
                                .location("서울 강서구 메이필드 골프클럽")
                                .latitude(37.5683)
                                .longitude(126.8235)
                                .schedule("2026-03-21 08:30")
                                .playStyle("편안한 분위기, 초중급 환영")
                                .femaleLimit(2)
                                .maleLimit(2)
                                .skillLevel("중급")
                                .ageRange("20대 후반~30대 후반")
                                .description("가볍게 18홀 돌고 브런치까지 함께할 멤버를 찾고 있어요. 매너 플레이 선호합니다.")
                                .maxParticipants(4)
                                .matchType("field")
                                .closed(false)
                                .deleted(false)
                                .build()
                ));

        addAcceptedParticipant(matchGroup, host);
        addAcceptedParticipant(matchGroup, acceptedParticipant);
    }

    private void seedScreenGroup(UserEntity host, UserEntity acceptedParticipant) {
        MatchGroupEntity matchGroup = matchGroupRepository.findAll().stream()
                .filter(group -> "퇴근 후 잠실 스크린 한 판".equals(group.getGroupName()))
                .findFirst()
                .orElseGet(() -> matchGroupRepository.save(
                        MatchGroupEntity.builder()
                                .host(host)
                                .groupName("퇴근 후 잠실 스크린 한 판")
                                .location("서울 송파구 잠실 스크린존")
                                .latitude(37.5133)
                                .longitude(127.1001)
                                .schedule("2026-03-20 19:30")
                                .playStyle("가볍게 18홀, 매너 좋으신 분 환영")
                                .femaleLimit(2)
                                .maleLimit(2)
                                .skillLevel("초중급")
                                .ageRange("20대 후반~30대")
                                .description("퇴근 후 스크린 골프로 가볍게 몸 풀고 대화까지 이어갈 분들을 찾고 있어요.")
                                .maxParticipants(4)
                                .matchType("screen")
                                .closed(false)
                                .deleted(false)
                                .build()
                ));

        addAcceptedParticipant(matchGroup, host);
        addAcceptedParticipant(matchGroup, acceptedParticipant);
    }

    private void addAcceptedParticipant(MatchGroupEntity matchGroup, UserEntity user) {
        boolean exists = matchParticipantRepository.existsByMatchGroup_MatchGroupIdAndUser_UserId(
                matchGroup.getMatchGroupId(),
                user.getUserId()
        );

        if (exists) {
            return;
        }

        matchParticipantRepository.save(
                MatchParticipantEntity.builder()
                        .matchGroup(matchGroup)
                        .user(user)
                        .participantStatus(MatchParticipantEntity.ParticipantStatus.ACCEPTED)
                        .joinAt(LocalDateTime.now().minusDays(1))
                        .build()
        );
    }

    private void seedLikesForAdmin(UserEntity adminUser, List<UserEntity> candidates) {
        if (adminUser == null) {
            return;
        }

        candidates.forEach(candidate -> addLike(adminUser.getUsername(), candidate.getUsername(), false));
    }

    private void seedMutualLikeAndChat(UserEntity firstUser, UserEntity secondUser) {
        addLike(firstUser.getUsername(), secondUser.getUsername(), true);
        addLike(secondUser.getUsername(), firstUser.getUsername(), true);

        boolean roomExists =
                chatRoomRepository.findByUser1AndUser2(firstUser.getUsername(), secondUser.getUsername()).isPresent()
                        || chatRoomRepository.findByUser1AndUser2(secondUser.getUsername(), firstUser.getUsername()).isPresent();

        if (!roomExists) {
            chatRoomRepository.save(new ChatRoomEntity(firstUser.getUsername(), secondUser.getUsername()));
        }
    }

    private void addLike(String fromUsername, String toUsername, boolean matched) {
        if (userLikeRepository.existsByFromUserIdAndToUserId(fromUsername, toUsername)) {
            return;
        }

        userLikeRepository.save(
                UserLikeEntity.builder()
                        .fromUserId(fromUsername)
                        .toUserId(toUsername)
                        .match(matched)
                        .build()
        );
    }

    private String generatePhoneNumber(String username) {
        int suffix = Math.abs(username.hashCode()) % 10_000;
        return String.format("010-55%02d-%04d", suffix % 100, suffix);
    }
}
