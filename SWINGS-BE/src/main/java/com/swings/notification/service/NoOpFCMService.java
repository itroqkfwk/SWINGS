package com.swings.notification.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@ConditionalOnMissingBean(FCMService.class)
public class NoOpFCMService implements FCMService {

    @Override
    public void sendPush(String token, String title, String body) {
        log.debug("Firebase is disabled. Skipping push delivery for title={}", title);
    }
}
