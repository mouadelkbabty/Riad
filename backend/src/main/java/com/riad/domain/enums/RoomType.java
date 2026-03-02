package com.riad.domain.enums;

public enum RoomType {
    STANDARD("Chambre Standard"),
    SUPERIOR("Chambre Supérieure"),
    SUITE("Suite"),
    SUITE_ROYALE("Suite Royale"),
    RIAD_ENTIER("Riad Entier");

    private final String label;

    RoomType(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}
