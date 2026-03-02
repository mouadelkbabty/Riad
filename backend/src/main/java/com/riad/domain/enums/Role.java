package com.riad.domain.enums;

import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;

public enum Role {

    GUEST(Set.of(
            Permission.RESERVATION_READ,
            Permission.RESERVATION_CREATE,
            Permission.ROOM_READ
    )),

    ADMIN(Set.of(
            Permission.RESERVATION_READ,
            Permission.RESERVATION_CREATE,
            Permission.RESERVATION_UPDATE,
            Permission.RESERVATION_DELETE,
            Permission.ROOM_READ,
            Permission.ROOM_CREATE,
            Permission.ROOM_UPDATE,
            Permission.ROOM_DELETE,
            Permission.PHOTO_CREATE,
            Permission.PHOTO_DELETE,
            Permission.USER_READ,
            Permission.USER_UPDATE,
            Permission.USER_DELETE
    ));

    private final Set<Permission> permissions;

    Role(Set<Permission> permissions) {
        this.permissions = permissions;
    }

    public Set<Permission> getPermissions() {
        return permissions;
    }

    public List<SimpleGrantedAuthority> getAuthorities() {
        return Stream.concat(
                permissions.stream()
                        .map(p -> new SimpleGrantedAuthority(p.name())),
                Stream.of(new SimpleGrantedAuthority("ROLE_" + this.name()))
        ).collect(Collectors.toList());
    }
}
