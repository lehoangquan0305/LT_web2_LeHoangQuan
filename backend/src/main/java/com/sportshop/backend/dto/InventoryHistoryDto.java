package com.sportshop.backend.dto;

import lombok.*;
import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class InventoryHistoryDto {
    private Long id;
    private Integer quantity;
    private String type;
    private String note;
    private Long productSizeId;
    private String size;
    private Integer currentStock;
    private String productName;
    private String colorName;
    private String sku;
    private LocalDateTime createdAt;
}
