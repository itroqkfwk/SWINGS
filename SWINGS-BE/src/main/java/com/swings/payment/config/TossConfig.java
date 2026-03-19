package com.swings.payment.config;

import com.swings.config.SecretValueResolver;
import jakarta.annotation.PostConstruct;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.reactive.function.client.WebClient;

import java.nio.charset.StandardCharsets;
import java.util.Base64;

@Getter
@Slf4j
@Component
public class TossConfig {

    private final SecretValueResolver secretValueResolver;

    @Value("${toss.secret-key:}")
    private String secretKeyValue;

    @Value("${toss.secret-key-file:}")
    private String secretKeyLocation;

    private String secretKey;

    public TossConfig(SecretValueResolver secretValueResolver) {
        this.secretValueResolver = secretValueResolver;
    }

    @PostConstruct
    public void loadSecretKey() {
        try {
            this.secretKey = secretValueResolver.resolveOptionalSecret(secretKeyValue, secretKeyLocation);

            if (StringUtils.hasText(secretKey)) {
                log.info("Toss secret initialized");
            } else {
                log.warn("Toss secret is not configured. Payment confirmation will be unavailable.");
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to initialize Toss secret", e);
        }
    }

    public boolean isConfigured() {
        return StringUtils.hasText(secretKey);
    }

    @Bean
    public WebClient tossWebClient() {
        WebClient.Builder builder = WebClient.builder()
                .baseUrl("https://api.tosspayments.com/v1");

        if (isConfigured()) {
            String encodedKey = Base64.getEncoder()
                    .encodeToString((secretKey + ":").getBytes(StandardCharsets.UTF_8));
            builder.defaultHeader("Authorization", "Basic " + encodedKey);
        }

        return builder.build();
    }
}
