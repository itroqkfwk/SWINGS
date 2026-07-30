package com.swings.matchgroup.controller;

import com.swings.matchgroup.dto.MatchGroupDTO;
import com.swings.matchgroup.service.MatchGroupService;
import com.swings.user.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/matchgroup")
@RequiredArgsConstructor
@Slf4j
public class MatchGroupController {

    private final MatchGroupService matchGroupService;
    private final UserService userService;

    @PostMapping("/create")
    public ResponseEntity<MatchGroupDTO> createMatchGroup(@RequestBody MatchGroupDTO matchGroupDTO) {
        log.info("create match group: {}", matchGroupDTO);
        return ResponseEntity.ok(matchGroupService.createMatchGroup(matchGroupDTO));
    }

    @GetMapping("/list")
    public ResponseEntity<List<MatchGroupDTO>> getAllMatchGroups() {
        return ResponseEntity.ok(matchGroupService.getAllMatchGroups());
    }

    @GetMapping("/{groupId}")
    public ResponseEntity<MatchGroupDTO> getMatchGroupById(@PathVariable Long groupId) {
        return ResponseEntity.ok(matchGroupService.getMatchGroupById(groupId));
    }

    @GetMapping("/host/{hostId}")
    public ResponseEntity<List<MatchGroupDTO>> getGroupsByHost(
            @PathVariable Long hostId,
            Authentication authentication
    ) {
        if (!hostId.equals(currentUserId(authentication))) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only the host can view hosted groups.");
        }
        return ResponseEntity.ok(matchGroupService.getGroupsByHost(hostId));
    }

    @PatchMapping("/{groupId}/status")
    public ResponseEntity<String> updateGroupStatus(
            @PathVariable Long groupId,
            @RequestParam boolean closed,
            Authentication authentication
    ) {
        matchGroupService.updateGroupStatus(groupId, closed, currentUserId(authentication));
        return ResponseEntity.ok(closed ? "Recruitment closed" : "Recruitment opened");
    }

    @DeleteMapping("/{groupId}")
    public ResponseEntity<String> deleteGroup(
            @PathVariable Long groupId,
            Authentication authentication
    ) {
        matchGroupService.deleteGroup(groupId, currentUserId(authentication));
        return ResponseEntity.ok("Group deleted");
    }

    @GetMapping("/nearby")
    public ResponseEntity<List<MatchGroupDTO>> getNearbyGroups(
            @RequestParam double latitude,
            @RequestParam double longitude,
            @RequestParam(defaultValue = "5.0") double radiusInKm
    ) {
        return ResponseEntity.ok(matchGroupService.findNearbyGroups(latitude, longitude, radiusInKm));
    }

    private Long currentUserId(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()
                || "anonymousUser".equals(authentication.getName())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication is required.");
        }
        return userService.getUserByUsername(authentication.getName()).getUserId();
    }
}
