package com.swings.notification.service;

import com.swings.notification.config.FirebaseDisabledCondition;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Conditional;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@Conditional(FirebaseDisabledCondition.class)
public class NoOpFCMService implements FCMService {

    @Override
    public void sendPush(String token, String title, String body) {
        log.debug("Firebase is disabled. Skipping push delivery for title={}", title);
    }
}
