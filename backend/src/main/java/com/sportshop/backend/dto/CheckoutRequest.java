package com.sportshop.backend.dto;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class CheckoutRequest {
    private String receiverName;
    private String receiverPhone;
    private String shippingAddress;
    private String note;
    private String couponCode;
    private String paymentMethod; // CASH, BANK_TRANSFER, QR_CODE, VNPAY, MOMO
}
