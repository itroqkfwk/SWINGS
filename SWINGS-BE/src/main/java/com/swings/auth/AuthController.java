package com.swings.auth;

import com.swings.security.JwtTokenProvider;
import com.swings.security.RefreshTokenEntity;
import com.swings.security.RefreshTokenRepository;
import com.swings.user.entity.UserEntity;
import com.swings.user.repository.UserRepository;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final GoogleOAuthService googleOAuthService;
    private final UserRepository userRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final RefreshTokenRepository refreshTokenRepository;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequestDTO request, HttpServletResponse response) {
        try {
            String accessToken = authService.login(request.getUsername(), request.getPassword(), response);
            return ResponseEntity.ok(new TokenResponse(accessToken));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", e.getMessage()));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/refresh")
    public ResponseEntity<TokenResponse> refreshAccessToken(
            @CookieValue(value = "refreshToken", required = false) String refreshToken) {
        if (refreshToken == null || !jwtTokenProvider.validateToken(refreshToken)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String username = jwtTokenProvider.extractUsername(refreshToken);
        UserEntity user = userRepository.findByUsername(username).orElseThrow();

        RefreshTokenEntity tokenEntity = refreshTokenRepository.findByUser(user).orElseThrow();
        if (!tokenEntity.getRefreshToken().equals(refreshToken)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String newAccessToken = jwtTokenProvider.generateToken(username, user.getRole());
        return ResponseEntity.ok(new TokenResponse(newAccessToken));
    }

    @PostMapping("/oauth/google")
    public ResponseEntity<?> googleLogin(@RequestBody Map<String, String> request) {
        String accessToken = request.get("accessToken");

        Map<String, Object> userInfo = googleOAuthService.getUserInfo(accessToken);
        if (userInfo == null || !userInfo.containsKey("email")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid Access Token");
        }

        String email = (String) userInfo.get("email");
        String name = (String) userInfo.get("name");

        Optional<UserEntity> userOpt = userRepository.findByEmail(email);

        if (userOpt.isPresent()) {
            UserEntity user = userOpt.get();
            String token = jwtTokenProvider.generateToken(user.getUsername(), user.getRole());
            return ResponseEntity.ok(new TokenResponse(token));
        }

        Map<String, Object> signupData = new HashMap<>();
        signupData.put("email", email);
        signupData.put("name", name);
        signupData.put("isNew", true);
        return ResponseEntity.ok(signupData);
    }
}
