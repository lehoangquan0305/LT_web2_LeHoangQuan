package com.sportshop.backend.dto;

import lombok.*;
import java.math.BigDecimal;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CartItemDto {
    private Long id;
    private Integer quantity;
    private Long productSizeId;
    private String size;
    private Integer stock;
    private Long variantId;
    private String sku;
    private String imageUrl;
    private Long colorId;
    private String colorName;
    private Long productId;
    private String productName;
    private String productSlug;
    private BigDecimal price;
    private BigDecimal discountPrice;
    private BigDecimal lineTotal;
}
