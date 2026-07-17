package com.sportshop.backend.dto;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ColorDto {
    private Long id;
    private String name;
    private String code;
    private Boolean active;
}
