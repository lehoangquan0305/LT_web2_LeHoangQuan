package com.sportshop.backend.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReviewDto {
    private Long id;
    private Integer rating;
    private String comment;
    private Boolean approved;
    private Boolean verifiedPurchase;
    private String adminReply;
    private Long userId;
    private String userName;
    private Long productId;
    private String productName;
    private LocalDateTime createdAt;
}
