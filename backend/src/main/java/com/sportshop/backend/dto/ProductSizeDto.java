package com.sportshop.backend.dto;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ProductSizeDto {
    private Long id;
    private String size;
    private Integer stock;
}
