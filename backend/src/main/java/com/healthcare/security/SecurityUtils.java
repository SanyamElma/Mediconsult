package com.healthcare.security;

import com.healthcare.exception.BadRequestException;
import org.springframework.security.core.context.SecurityContextHolder;

/** Convenience accessors for the authenticated principal. */
public final class SecurityUtils {

    private SecurityUtils() {}

    public static AuthPrincipal current() {
        Object p = SecurityContextHolder.getContext().getAuthentication() == null
                ? null
                : SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (p instanceof AuthPrincipal ap) return ap;
        throw new BadRequestException("No authenticated principal");
    }

    public static Long currentId() {
        return current().id();
    }
}
