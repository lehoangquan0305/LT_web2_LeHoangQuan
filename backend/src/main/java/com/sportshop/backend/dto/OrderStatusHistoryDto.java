package com.sportshop.backend.dto;

import lombok.*;
import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class OrderStatusHistoryDto {
    private Long id;
    private String status;
    private String note;
    private String changedBy;
    private LocalDateTime createdAt;
}
