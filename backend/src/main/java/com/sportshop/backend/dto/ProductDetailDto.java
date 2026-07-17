package com.sportshop.backend.dto;

import lombok.*;
import java.math.BigDecimal;
import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ProductDetailDto {
    private Long id;
    private String name;
    private String slug;
    private String shortDescription;
    private String description;
    private BigDecimal price;
    private BigDecimal discountPrice;
    private String thumbnailUrl;
    private Long viewCount;
    private Long soldCount;
    private Boolean featured;
    private Boolean newArrival;
    private Boolean active;
    private Long categoryId;
    private String categoryName;
    private Long brandId;
    private String brandName;
    private Double averageRating;
    private Integer reviewCount;
    private List<ProductVariantDto> variants;
    private List<ProductAttributeDto> attributes;
}
