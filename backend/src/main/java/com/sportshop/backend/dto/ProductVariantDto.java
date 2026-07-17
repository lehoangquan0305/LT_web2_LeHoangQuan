package com.sportshop.backend.dto;

import lombok.*;
import java.math.BigDecimal;
import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ProductVariantDto {
    private Long id;
    private String sku;
    private BigDecimal price;
    private BigDecimal discountPrice;
    private String imageUrl;
    private Long colorId;
    private String colorName;
    private String colorCode;
    private List<ProductImageDto> images;
    private List<ProductSizeDto> sizes;
}
