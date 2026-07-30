package com.swings.matchgroup.controller;

import com.swings.matchgroup.dto.MatchGroupDTO;
import com.swings.matchgroup.dto.MatchParticipantDTO;
import com.swings.matchgroup.service.MatchGroupService;
import com.swings.matchgroup.service.MatchParticipantService;
import com.swings.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/matchParticipant")
@RequiredArgsConstructor
public class MatchParticipantController {

    private final MatchParticipantService matchParticipantService;
    private final MatchGroupService matchGroupService;
    private final UserService userService;

    @PostMapping("/join")
    public ResponseEntity<MatchParticipantDTO> joinMatch(
            @RequestBody MatchParticipantDTO dto,
            Authentication authentication
    ) {
        return ResponseEntity.ok(matchParticipantService.joinMatch(dto.getMatchGroupId(), currentUserId(authentication)));
    }

    @PostMapping("/leave")
    public ResponseEntity<String> leaveMatch(
            @RequestBody MatchParticipantDTO dto,
            Authentication authentication
    ) {
        matchParticipantService.leaveMatch(dto.getMatchGroupId(), currentUserId(authentication));
        return ResponseEntity.ok("Join request cancelled");
    }

    @PostMapping("/approve")
    public ResponseEntity<String> approveParticipant(
            @RequestBody MatchParticipantDTO dto,
            Authentication authentication
    ) {
        matchParticipantService.approveParticipant(
                dto.getMatchGroupId(),
                dto.getMatchParticipantId(),
                currentUserId(authentication)
        );
        return ResponseEntity.ok("Participant approved");
    }

    @PostMapping("/reject")
    public ResponseEntity<String> rejectParticipant(
            @RequestBody MatchParticipantDTO dto,
            Authentication authentication
    ) {
        matchParticipantService.rejectParticipant(
                dto.getMatchGroupId(),
                dto.getMatchParticipantId(),
                currentUserId(authentication)
        );
        return ResponseEntity.ok("Participant rejected");
    }

    @DeleteMapping("/remove")
    public ResponseEntity<String> removeParticipant(
            @RequestBody MatchParticipantDTO dto,
            Authentication authentication
    ) {
        matchParticipantService.removeParticipant(
                dto.getMatchGroupId(),
                dto.getUserId(),
                currentUserId(authentication)
        );
        return ResponseEntity.ok("Participant removed");
    }

    @GetMapping("/accepted/{matchGroupId}")
    public ResponseEntity<List<MatchParticipantDTO>> getAcceptedParticipants(@PathVariable Long matchGroupId) {
        return ResponseEntity.ok(matchParticipantService.getAcceptedParticipants(matchGroupId));
    }

    @GetMapping("/pending/{matchGroupId}")
    public ResponseEntity<List<MatchParticipantDTO>> getPendingParticipants(
            @PathVariable Long matchGroupId,
            Authentication authentication
    ) {
        MatchGroupDTO group = matchGroupService.getMatchGroupById(matchGroupId);
        if (!group.getHostId().equals(currentUserId(authentication))) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only the host can view pending participants.");
        }
        return ResponseEntity.ok(matchParticipantService.getPendingParticipants(matchGroupId));
    }

    @PostMapping("/my")
    public ResponseEntity<List<MatchParticipantDTO>> getMyGroups(
            @RequestBody MatchParticipantDTO request,
            Authentication authentication
    ) {
        request.setUserId(currentUserId(authentication));
        return ResponseEntity.ok(matchParticipantService.getMyGroups(request));
    }

    @GetMapping("/accepted/count/{matchGroupId}")
    public ResponseEntity<Integer> getAcceptedCount(@PathVariable Long matchGroupId) {
        return ResponseEntity.ok(matchParticipantService.countAcceptedParticipants(matchGroupId));
    }

    @PostMapping("/leave/accepted")
    public ResponseEntity<String> leaveAcceptedGroup(
            @RequestBody Map<String, Long> body,
            Authentication authentication
    ) {
        matchParticipantService.leaveAcceptedGroup(body.get("matchGroupId"), currentUserId(authentication));
        return ResponseEntity.ok("Left group");
    }

    @GetMapping("/check/{matchGroupId}/{userId}")
    public ResponseEntity<Boolean> canUserJoin(
            @PathVariable Long matchGroupId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(matchParticipantService.canUserJoinGroup(matchGroupId, currentUserId(authentication)));
    }

    private Long currentUserId(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()
                || "anonymousUser".equals(authentication.getName())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication is required.");
        }
        return userService.getUserByUsername(authentication.getName()).getUserId();
    }
}
