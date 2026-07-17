package com.sportshop.backend.dto;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ProductAttributeDto {
    private Long id;
    private String attributeName;
    private String attributeValue;
}
