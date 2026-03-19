package com.swings.user.controller;

import com.swings.user.dto.UserDTO;
import com.swings.user.dto.UserPointDTO;
import com.swings.user.service.UserPointService;
import com.swings.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
public class AdminController {

    private final UserService userService;
    private final UserPointService userPointService;

    @GetMapping("/users")
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        System.out.println("🟢 /admin/users 컨트롤러 진입");
        return ResponseEntity.ok(userService.getAllUsersDto());
    }

    @GetMapping("/users/{username}")
    public ResponseEntity<UserDTO> getUser(@PathVariable("username") String username) {
        return ResponseEntity.ok(userService.convertToDto(userService.getUserByUsername(username)));
    }

    @DeleteMapping("/users/{username}/delete")
    public ResponseEntity<String> deleteUser(@PathVariable("username") String username) {
        userService.deleteUserByUsername(username);
        return ResponseEntity.ok("유저 삭제 완료");
    }

    @PatchMapping("/users/{username}/role")
    public ResponseEntity<String> changeRole(@PathVariable("username") String username, @RequestParam("role") String role) {
        userService.updateUserRole(username, role);
        return ResponseEntity.ok("역할 변경 완료");
    }

    @GetMapping("/users/{username}/points")
    public ResponseEntity<List<UserPointDTO>> getUserPoints(@PathVariable("username") String username) {
        return ResponseEntity.ok(userPointService.findPointLogByUsername(username));
    }
}
