package com.sportshop.backend.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderDto {
    private Long id;
    private String orderCode;
    private BigDecimal subtotal;
    private BigDecimal discountAmount;
    private BigDecimal shippingFee;
    private BigDecimal totalAmount;
    private String status;
    private String receiverName;
    private String receiverPhone;
    private String shippingAddress;
    private String note;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Chỉ được điền ở API xem chi tiết đơn hàng (không điền ở danh sách để nhẹ payload)
    private Long customerId;
    private String customerName;
    private String customerEmail;
    private List<OrderItemDto> items;
    private String paymentMethod;
    private String paymentStatus;
    private String transactionCode;
    private List<OrderStatusHistoryDto> statusHistory;
}
