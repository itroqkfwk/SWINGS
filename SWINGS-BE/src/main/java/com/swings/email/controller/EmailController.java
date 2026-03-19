package com.swings.email.controller;

import com.swings.email.entity.UserVerifyEntity;
import com.swings.email.repository.UserVerifyRepository;
import com.swings.user.entity.UserEntity;
import com.swings.user.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Optional;

@RestController
@RequestMapping("/email")
@RequiredArgsConstructor
public class EmailController {

    private final UserVerifyRepository tokenRepository;
    private final UserRepository userRepository;

    @Value("${app.frontend-base-url}")
    private String frontendBaseUrl;

    @GetMapping("/verify")
    @Transactional
    public ResponseEntity<String> verifyEmail(@RequestParam("token") String token) {
        Optional<UserVerifyEntity> optionalToken = tokenRepository.findByToken(token);

        if (optionalToken.isEmpty()) {
            return ResponseEntity.badRequest().body(renderHtml("유효하지 않은 인증 링크입니다."));
        }

        UserVerifyEntity verification = optionalToken.get();

        if (verification.isExpired()) {
            return ResponseEntity.badRequest().body(renderHtml("인증 링크가 만료되었습니다.<br>다시 회원가입하거나 관리자에게 문의해주세요."));
        }

        if (verification.isUsed()) {
            return ResponseEntity.badRequest().body(renderHtml("이미 인증이 완료된 링크입니다."));
        }

        UserEntity user = verification.getUser();
        user.setVerified(true);
        userRepository.save(user);

        verification.setUsed(true);
        tokenRepository.save(verification);

        return ResponseEntity.ok(renderHtml("이메일 인증이 완료되었습니다.<br>이제 로그인할 수 있습니다."));
    }

    private String renderHtml(String message) {
        return """
                <html>
                  <head>
                    <meta charset="UTF-8">
                    <title>SWINGS 이메일 인증</title>
                  </head>
                  <body style="font-family: 'Segoe UI', sans-serif; background-color: #f4f4f4; padding: 40px;">
                    <div style="max-width: 480px; margin: auto; background-color: white; padding: 36px; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); text-align: center;">
                      <h2 style="color: #2b2d42; margin-bottom: 10px;">SWINGS</h2>
                      <p style="color: #8d99ae; font-size: 15px; margin-bottom: 30px;">설레는 골프친구를 만나자</p>
                      <div style="font-size: 16px; color: #444; line-height: 1.6; margin-bottom: 30px;">
                        %s
                      </div>
                      <a href="%s"
                         style="display: inline-block; background-color: #2b2d42; color: white; padding: 12px 24px;
                         text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 14px;">
                        로그인하러 가기
                      </a>
                    </div>
                  </body>
                </html>
                """.formatted(message, frontendBaseUrl);
    }
}
