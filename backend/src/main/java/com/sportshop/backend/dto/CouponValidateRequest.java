package com.sportshop.backend.dto;

import lombok.*;
import java.math.BigDecimal;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class CouponValidateRequest {
    private String code;
    private BigDecimal orderTotal;
}
