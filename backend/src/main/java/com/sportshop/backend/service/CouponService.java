package com.sportshop.backend.service;

import com.sportshop.backend.entity.Coupon;
import com.sportshop.backend.repository.CouponRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class CouponService {

    private final CouponRepository couponRepository;

    public static class CouponResult {
        public final boolean valid;
        public final String message;
        public final BigDecimal discountAmount;
        public final Coupon coupon;

        public CouponResult(boolean valid, String message, BigDecimal discountAmount, Coupon coupon) {
            this.valid = valid;
            this.message = message;
            this.discountAmount = discountAmount;
            this.coupon = coupon;
        }
    }

    /**
     * Kiểm tra mã giảm giá có áp dụng được với đơn hàng trị giá orderTotal hay không,
     * và tính số tiền được giảm nếu hợp lệ.
     */
    public CouponResult validate(String code, BigDecimal orderTotal) {
        if (code == null || code.isBlank()) {
            return new CouponResult(false, "Vui lòng nhập mã giảm giá", BigDecimal.ZERO, null);
        }

        Coupon coupon = couponRepository.findByCode(code.trim().toUpperCase()).orElse(null);

        if (coupon == null) {
            return new CouponResult(false, "Mã giảm giá không tồn tại", BigDecimal.ZERO, null);
        }

        if (!Boolean.TRUE.equals(coupon.getActive())) {
            return new CouponResult(false, "Mã giảm giá không còn hoạt động", BigDecimal.ZERO, null);
        }

        LocalDateTime now = LocalDateTime.now();
        if (coupon.getStartDate() != null && now.isBefore(coupon.getStartDate())) {
            return new CouponResult(false, "Mã giảm giá chưa đến ngày áp dụng", BigDecimal.ZERO, null);
        }
        if (coupon.getEndDate() != null && now.isAfter(coupon.getEndDate())) {
            return new CouponResult(false, "Mã giảm giá đã hết hạn", BigDecimal.ZERO, null);
        }

        if (coupon.getUsageLimit() != null && coupon.getUsageLimit() > 0
                && coupon.getUsedCount() != null && coupon.getUsedCount() >= coupon.getUsageLimit()) {
            return new CouponResult(false, "Mã giảm giá đã hết lượt sử dụng", BigDecimal.ZERO, null);
        }

        if (coupon.getMinimumOrderAmount() != null && orderTotal.compareTo(coupon.getMinimumOrderAmount()) < 0) {
            return new CouponResult(false,
                    "Đơn hàng tối thiểu " + coupon.getMinimumOrderAmount().toBigInteger() + "đ để dùng mã này",
                    BigDecimal.ZERO, null);
        }

        BigDecimal discount;
        if ("PERCENT".equalsIgnoreCase(coupon.getDiscountType())) {
            discount = orderTotal.multiply(coupon.getDiscountValue()).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
            if (coupon.getMaximumDiscount() != null && discount.compareTo(coupon.getMaximumDiscount()) > 0) {
                discount = coupon.getMaximumDiscount();
            }
        } else {
            discount = coupon.getDiscountValue();
        }

        if (discount.compareTo(orderTotal) > 0) {
            discount = orderTotal;
        }

        return new CouponResult(true, "Áp dụng mã giảm giá thành công", discount, coupon);
    }

    public void incrementUsage(Coupon coupon) {
        coupon.setUsedCount((coupon.getUsedCount() == null ? 0 : coupon.getUsedCount()) + 1);
        couponRepository.save(coupon);
    }
}
