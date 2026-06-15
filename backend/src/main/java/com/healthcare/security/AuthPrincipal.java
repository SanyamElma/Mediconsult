package com.healthcare.security;

import com.healthcare.user.Role;

/** Lightweight authenticated principal carried in the SecurityContext (no DB lookup per request). */
public record AuthPrincipal(Long id, String email, Role role) {
}
