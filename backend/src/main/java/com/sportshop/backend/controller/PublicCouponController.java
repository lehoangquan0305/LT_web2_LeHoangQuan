package com.sportshop.backend.controller;

import com.sportshop.backend.dto.CouponValidateRequest;
import com.sportshop.backend.service.CouponService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/** Kiểm tra mã giảm giá công khai (dùng ở giỏ hàng/trang thanh toán). */
@RestController
@RequestMapping("/api/coupons")
@RequiredArgsConstructor
public class PublicCouponController {

    private final CouponService couponService;

    @PostMapping("/validate")
    public ResponseEntity<?> validate(@RequestBody CouponValidateRequest request) {
        CouponService.CouponResult result = couponService.validate(request.getCode(), request.getOrderTotal());

        if (!result.valid) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", result.message));
        }

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", result.message,
                "discountAmount", result.discountAmount
        ));
    }
}
