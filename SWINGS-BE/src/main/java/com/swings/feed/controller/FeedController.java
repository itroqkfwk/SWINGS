package com.swings.feed.controller;

import com.swings.feed.dto.CommentDTO;
import com.swings.feed.dto.FeedDTO;
import com.swings.feed.entity.CommentEntity;
import com.swings.feed.entity.FeedEntity;
import com.swings.feed.repository.FeedRepository;
import com.swings.feed.service.CommentService;
import com.swings.feed.service.FeedService;
import com.swings.user.dto.UserDTO;
import com.swings.user.entity.UserEntity;
import com.swings.user.repository.UserRepository;
import lombok.Getter;
import lombok.Setter;
import net.coobird.thumbnailator.Thumbnails;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;
import java.util.stream.Collectors;

//피드 관련 CRUD 및 댓글/좋아요 기능 처리 컨트롤러
@RestController
@RequestMapping("/feeds")
public class FeedController {

    @Value("${file.upload-dir}")
    private String uploadDir;

    @Value("${app.backend-base-url}")
    private String backendBaseUrl;

    private final FeedService feedService;
    private final UserRepository userRepository;
    private final CommentService commentService;

    public FeedController(FeedService feedService, UserRepository userRepository,
                          CommentService commentService, FeedRepository feedRepository) {
        this.feedService = feedService;
        this.userRepository = userRepository;
        this.commentService = commentService;
    }
    
    // 피드 등록
    @PostMapping
    public ResponseEntity<FeedDTO> createFeed(@RequestBody FeedDTO feedDTO) {
        return ResponseEntity.ok(feedService.createFeed(feedDTO));
    }
    
    // 전체 피드 조회
    @GetMapping
    public ResponseEntity<List<FeedDTO>> getFeeds(@RequestParam(name = "userId", required = false) Long userId,
                                                  @RequestParam("page") int page,
                                                  @RequestParam(name = "size", defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());

        List<FeedDTO> feeds = feedService.getAllFeeds(pageable, userId); 
        return ResponseEntity.ok(feeds);
    }
    
    // 필터 및 정렬 조건 기반 피드 조회
    @GetMapping("/filtered")
    public ResponseEntity<List<FeedDTO>> getFilteredFeeds(
            @RequestParam("userId") Long userId,
            @RequestParam("page") int page,
            @RequestParam(name = "size", defaultValue = "10") int size,
            @RequestParam(name = "sort", defaultValue = "latest") String sort,
            @RequestParam(name = "filter", defaultValue = "all") String filter) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        List<FeedDTO> feeds = new ArrayList<>();

        if ("followings".equals(filter)) {
            List<Long> followeeIds = feedService.getFolloweeIds(userId);

            if (!followeeIds.isEmpty()) {
                feeds = feedService.getFeedsByUserListExcludingSelf(followeeIds, pageable, userId);
            } else {
                feeds = feedService.getAllFeeds(pageable, userId).stream()
                        .filter(feed -> !feed.getUserId().equals(userId))
                        .collect(Collectors.toList());

                if ("random".equals(sort)) {
                    Collections.shuffle(feeds);
                }
            }
        } 
        else if ("all".equals(filter)) {
            feeds = feedService.getAllFeeds(pageable, userId).stream()
                    .filter(feed -> !feed.getUserId().equals(userId))
                    .collect(Collectors.toList());

            if ("random".equals(sort)) {
                Collections.shuffle(feeds);
            }
        }

        return ResponseEntity.ok(feeds);
    }

    // 메인 피드 조회 (팔로우 유저 -> 모든 유저 랜덤 -> 내 피드 순)
    @GetMapping("/main")
    public ResponseEntity<List<FeedDTO>> getMainFeed(@RequestParam("userId") Long userId) {
        Pageable pageable = PageRequest.of(0, 30, Sort.by("createdAt").descending());

        List<FeedDTO> result = new ArrayList<>();

        // 1. 팔로우한 유저 피드 최신순
        List<Long> followeeIds = feedService.getFolloweeIds(userId);
        if (!followeeIds.isEmpty()) {
            List<FeedDTO> followFeeds = feedService.getFeedsByUserListExcludingSelf(followeeIds, pageable, userId);
            result.addAll(followFeeds);
        }

        // 2. 전체 랜덤 피드 (팔로우, 본인 제외)
        List<FeedDTO> latestFeeds = feedService.getAllFeeds(pageable, userId).stream()
                .filter(feed -> !feed.getUserId().equals(userId) && !followeeIds.contains(feed.getUserId()))
                .collect(Collectors.toList());

        result.addAll(latestFeeds);

        // 3. 본인 피드
        List<FeedDTO> myFeeds = feedService.getFeedsByUserId(userId);
        result.addAll(myFeeds);

        return ResponseEntity.ok(result);
    }
    
    // 특정 유저 피드 조회
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<FeedDTO>> getFeedsByUserId(@PathVariable("userId") Long userId) {
        return ResponseEntity.ok(feedService.getFeedsByUserId(userId));
    }
    
    // 피드 한개 조회
    @GetMapping("/{feedId}")
    public ResponseEntity<FeedDTO> getFeedById(@PathVariable("feedId") Long feedId) {
        return feedService.getFeedById(feedId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // 피드 수정 (이미지 포함 multipart)
    @PutMapping(value = "/{feedId}", consumes = {"multipart/form-data"})
    public ResponseEntity<FeedDTO> updateFeed(
            @PathVariable("feedId") Long feedId,
            @RequestPart("caption") String caption,
            @RequestPart(value = "file", required = false) MultipartFile file
    ) {
        FeedDTO existingFeed = feedService.getFeedById(feedId)
                .orElseThrow(() -> new RuntimeException("Feed not found"));
        String imageUrl = (file != null && !file.isEmpty()) ? saveFile(file) : existingFeed.getImageUrl();

        FeedDTO updated = FeedDTO.builder()
                .feedId(feedId)
                .caption(caption)
                .imageUrl(imageUrl)
                .userId(existingFeed.getUserId()) // 그대로 유지
                .build();

        return ResponseEntity.ok(feedService.updateFeed(feedId, updated));
    }
    
    // 피드 삭제
    @DeleteMapping("/{feedId}")
    public ResponseEntity<Void> deleteFeed(@PathVariable("feedId") Long feedId) {
        feedService.deleteFeed(feedId);
        return ResponseEntity.noContent().build();
    }
    
    // 피드 업로드(신규 작성)
    @PostMapping("/upload")
    public ResponseEntity<FeedDTO> uploadFeed(@RequestParam("userId") Long userId,
                                              @RequestParam("content") String content,
                                              @RequestPart(value = "file", required = false) MultipartFile file) {
        String imageUrl = (file != null && !file.isEmpty()) ? saveFile(file) : null;
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        FeedDTO feedDTO = FeedDTO.builder()
                .userId(user.getUserId())
                .caption(content)
                .imageUrl(imageUrl)
                .build();

        return ResponseEntity.ok(feedService.createFeed(feedDTO));
    }
    
    
    // 내부 파일 저장 메서드
    private String saveFile(MultipartFile file) {
        String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
        try {
            Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
            File dest = uploadPath.resolve(fileName).toFile();
            Thumbnails.of(file.getInputStream()).size(800, 600).toFile(dest);
            return backendBaseUrl + "/uploads/" + fileName;
        } catch (IOException e) {
            throw new RuntimeException("File upload failed: " + e.getMessage());
        }
    }
    
    // 좋아요 등록
    @PutMapping("/{feedId}/like")
    public ResponseEntity<FeedDTO> likeFeed(@PathVariable("feedId") Long feedId, @RequestParam("userId") Long userId) {
        return ResponseEntity.ok(feedService.likeFeed(feedId, userId));
    }
    
    // 좋아요 취소
    @PutMapping("/{feedId}/unlike")
    public ResponseEntity<FeedDTO> unlikeFeed(@PathVariable("feedId") Long feedId, @RequestParam("userId") Long userId) {
        if (feedId == null || userId == null) return ResponseEntity.badRequest().build();
        FeedDTO updatedFeed = feedService.unlikeFeed(feedId, userId);
        return ResponseEntity.ok(updatedFeed);
    }
    
    // 댓글 등록
    @PostMapping("/{feedId}/comments")
    public ResponseEntity<CommentDTO> addComment(@PathVariable("feedId") Long feedId,
                                                 @RequestParam("userId") Long userId,
                                                 @RequestParam("content") String content) {
        CommentEntity comment = commentService.addComment(feedId, userId, content);
        return ResponseEntity.ok(convertToDTO(comment));
    }
    
    // 댓글 삭제
    @DeleteMapping("/{feedId}/comments/{commentId}")
    public ResponseEntity<Void> deleteComment(@PathVariable("feedId") Long feedId, @PathVariable("commentId") Long commentId) {
        commentService.deleteComment(commentId);
        return ResponseEntity.noContent().build();
    }
    
    // 댓글 수정
    @PatchMapping("/{feedId}/comments/{commentId}")
    public ResponseEntity<CommentDTO> updateComment(
            @PathVariable("feedId") Long feedId,
            @PathVariable("commentId") Long commentId,
            @RequestParam("content") String content) {

        CommentEntity updated = commentService.updateComment(commentId, content);
        return ResponseEntity.ok(convertToDTO(updated));
    }
    
    // 댓글 조회
    @GetMapping("/{feedId}/comments")
    public ResponseEntity<List<CommentDTO>> getCommentsByFeedId(@PathVariable("feedId") Long feedId) {
        List<CommentEntity> comments = commentService.getCommentsByFeedId(feedId);
        List<CommentDTO> commentDTOs = comments.stream().map(this::convertToDTO).collect(Collectors.toList());
        return ResponseEntity.ok(commentDTOs);
    }
    
    // 좋아요한 사용자 목록
    @GetMapping("/{feedId}/liked-users")
    public ResponseEntity<List<UserDTO>> getLikedUsers(@PathVariable("feedId") Long feedId) {
        return ResponseEntity.ok(feedService.getLikedUsers(feedId));
    }
    
    // 댓글 Entity -> DTO 변환
    private CommentDTO convertToDTO(CommentEntity comment) {
        return CommentDTO.builder()
                .commentId(comment.getCommentId())
                .userId(comment.getUser() != null ? comment.getUser().getUserId() : null)
                .username(comment.getUser() != null ? comment.getUser().getUsername() : "Unknown User")
                .content(comment.getContent())
                .createdAt(comment.getCreatedAt())
                .userProfilePic(
                        comment.getUser() != null ? comment.getUser().getUserImg() : null
                )
                .build();
    }
    
    
}
