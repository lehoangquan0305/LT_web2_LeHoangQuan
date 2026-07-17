package com.sportshop.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "coupons",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = "code")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Coupon extends BaseEntity {


    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    @Column(nullable = false, length = 50)
    private String code;


    @Column(nullable = false, length = 255)
    private String description;


    // PERCENT hoặc FIXED

    @Column(nullable = false, length = 20)
    private String discountType;


    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal discountValue;


    private BigDecimal minimumOrderAmount;


    private BigDecimal maximumDiscount;


    private LocalDateTime startDate;


    private LocalDateTime endDate;


    @Builder.Default
    private Integer usageLimit = 0;


    @Builder.Default
    private Integer usedCount = 0;


    @Builder.Default
    private Boolean active = true;

}