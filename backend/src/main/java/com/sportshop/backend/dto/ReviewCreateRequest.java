package com.sportshop.backend.dto;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class ReviewCreateRequest {
    private Long productId;
    private Integer rating;
    private String comment;
}
