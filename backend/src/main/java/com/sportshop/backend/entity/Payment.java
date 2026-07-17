package com.sportshop.backend.entity;

import com.sportshop.backend.entity.enums.PaymentMethod;
import com.sportshop.backend.entity.enums.PaymentStatus;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Payment extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    // Số tiền thanh toán

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;


    // Phương thức thanh toán

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private PaymentMethod paymentMethod;


    // Trạng thái thanh toán

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private PaymentStatus paymentStatus;


    // Mã giao dịch từ ngân hàng/cổng thanh toán

    @Column(length = 255)
    private String transactionCode;


    // Nội dung chuyển khoản

    @Column(length = 500)
    private String paymentDescription;


    // Thời gian thanh toán thành công

    private LocalDateTime paidAt;


    // Link QR nếu dùng QR

    @Column(length = 1000)
    private String qrCodeUrl;


    // Đơn hàng

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

}