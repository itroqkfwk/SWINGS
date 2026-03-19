package com.swings.matchgroup.controller;

import com.swings.matchgroup.dto.MatchGroupDTO;
import com.swings.matchgroup.service.MatchGroupService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/matchgroup")
@RequiredArgsConstructor
@Slf4j
public class MatchGroupController {

    private final MatchGroupService matchGroupService;

    @PostMapping("/create")
    public ResponseEntity<MatchGroupDTO> createMatchGroup(@RequestBody MatchGroupDTO matchGroupDTO) {
        log.info("create match group: {}", matchGroupDTO);
        MatchGroupDTO createdGroup = matchGroupService.createMatchGroup(matchGroupDTO);
        return ResponseEntity.ok(createdGroup);
    }

    @GetMapping("/list")
    public ResponseEntity<List<MatchGroupDTO>> getAllMatchGroups() {
        return ResponseEntity.ok(matchGroupService.getAllMatchGroups());
    }

    @GetMapping("/{groupId}")
    public ResponseEntity<MatchGroupDTO> getMatchGroupById(@PathVariable("groupId") Long groupId) {
        return ResponseEntity.ok(matchGroupService.getMatchGroupById(groupId));
    }

    @GetMapping("/host/{hostId}")
    public ResponseEntity<List<MatchGroupDTO>> getGroupsByHost(@PathVariable("hostId") Long hostId) {
        return ResponseEntity.ok(matchGroupService.getGroupsByHost(hostId));
    }

    @PatchMapping("/{groupId}/status")
    public ResponseEntity<String> updateGroupStatus(
            @PathVariable("groupId") Long groupId,
            @RequestParam("closed") boolean closed
    ) {
        matchGroupService.updateGroupStatus(groupId, closed);
        return ResponseEntity.ok(closed ? "모집 종료" : "모집 재개");
    }

    @DeleteMapping("/{groupId}")
    public ResponseEntity<String> deleteGroup(
            @PathVariable("groupId") Long groupId,
            @RequestParam("userId") Long userId
    ) {
        matchGroupService.deleteGroup(groupId, userId);
        return ResponseEntity.ok("그룹이 삭제되었습니다.");
    }

    @GetMapping("/nearby")
    public ResponseEntity<List<MatchGroupDTO>> getNearbyGroups(
            @RequestParam("latitude") double latitude,
            @RequestParam("longitude") double longitude,
            @RequestParam(name = "radiusInKm", defaultValue = "5.0") double radiusInKm
    ) {
        List<MatchGroupDTO> nearbyGroups = matchGroupService.findNearbyGroups(latitude, longitude, radiusInKm);
        return ResponseEntity.ok(nearbyGroups);
    }
}
