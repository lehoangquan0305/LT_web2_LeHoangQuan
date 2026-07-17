package com.sportshop.backend.dto;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ProductImageDto {
    private Long id;
    private String imageUrl;
    private Integer displayOrder;
}
