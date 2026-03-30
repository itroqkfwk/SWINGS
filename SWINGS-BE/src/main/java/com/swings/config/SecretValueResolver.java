package com.swings.config;

import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

@Component
public class SecretValueResolver {

    private final ResourceLoader resourceLoader;

    public SecretValueResolver(ResourceLoader resourceLoader) {
        this.resourceLoader = resourceLoader;
    }

    public String resolveOptionalSecret(String directValue, String location) {
        if (StringUtils.hasText(directValue)) {
            return directValue.trim();
        }

        if (!StringUtils.hasText(location)) {
            return null;
        }

        Resource resource = resourceLoader.getResource(location.trim());
        if (!resource.exists()) {
            throw new IllegalStateException("Secret resource not found: " + location);
        }

        try {
            return new String(resource.getInputStream().readAllBytes(), StandardCharsets.UTF_8).trim();
        } catch (IOException e) {
            throw new IllegalStateException("Failed to read secret resource: " + location, e);
        }
    }

    public String resolveRequiredSecret(String secretName, String directValue, String location) {
        String resolvedValue = resolveOptionalSecret(directValue, location);
        if (!StringUtils.hasText(resolvedValue)) {
            throw new IllegalStateException(secretName + " is not configured. Provide a value or a file location.");
        }
        return resolvedValue;
    }
}
