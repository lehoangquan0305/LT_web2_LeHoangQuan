package com.sportshop.backend.dto;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class AddToCartRequest {
    private Long productSizeId;
    private Integer quantity;
}
