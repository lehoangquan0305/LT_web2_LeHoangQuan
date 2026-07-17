package com.sportshop.backend.dto;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CustomerAuthResponse {
    private Boolean success;
    private String message;
    private String token;
    private Long userId;
    private String email;
    private String fullName;
    private String role;
}
