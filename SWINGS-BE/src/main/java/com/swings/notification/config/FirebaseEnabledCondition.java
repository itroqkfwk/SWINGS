package com.swings.notification.config;

import org.springframework.context.annotation.Condition;
import org.springframework.context.annotation.ConditionContext;
import org.springframework.core.type.AnnotatedTypeMetadata;
import org.springframework.util.StringUtils;

public class FirebaseEnabledCondition implements Condition {

    @Override
    public boolean matches(ConditionContext context, AnnotatedTypeMetadata metadata) {
        String firebaseKeyJson = context.getEnvironment().getProperty("firebase.key-json");
        String firebaseKeyPath = context.getEnvironment().getProperty("firebase.key-path");

        return StringUtils.hasText(firebaseKeyJson) || StringUtils.hasText(firebaseKeyPath);
    }
}
