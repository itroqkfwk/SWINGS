package com.swings;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ResourceLoader;
import org.springframework.util.StringUtils;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;

@Slf4j
@Configuration
public class FirebaseConfig {

    @Value("${firebase.key-path:}")
    private String firebaseKeyPath;

    @Value("${firebase.key-json:}")
    private String firebaseKeyJson;

    private final ResourceLoader resourceLoader;

    public FirebaseConfig(ResourceLoader resourceLoader) {
        this.resourceLoader = resourceLoader;
    }

    @PostConstruct
    public void initialize() {
        if (!FirebaseApp.getApps().isEmpty()) {
            return;
        }

        if (!StringUtils.hasText(firebaseKeyJson) && !StringUtils.hasText(firebaseKeyPath)) {
            log.warn("Firebase credentials are not configured. Push notifications will be disabled.");
            return;
        }

        try (InputStream serviceAccount = openCredentialStream()) {
            FirebaseOptions options = new FirebaseOptions.Builder()
                    .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                    .build();

            FirebaseApp.initializeApp(options);
            log.info("Firebase initialized");
        } catch (Exception e) {
            log.error("Failed to initialize Firebase: {}", e.getMessage());
        }
    }

    private InputStream openCredentialStream() throws Exception {
        if (StringUtils.hasText(firebaseKeyJson)) {
            return new ByteArrayInputStream(firebaseKeyJson.getBytes(StandardCharsets.UTF_8));
        }

        return resourceLoader.getResource(firebaseKeyPath.trim()).getInputStream();
    }
}
