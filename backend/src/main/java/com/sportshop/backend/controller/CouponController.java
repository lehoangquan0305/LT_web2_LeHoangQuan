package com.sportshop.backend.controller;

import com.sportshop.backend.dto.CouponDto;
import com.sportshop.backend.entity.Coupon;
import com.sportshop.backend.repository.CouponRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/coupons")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
public class CouponController {

    private final CouponRepository couponRepository;

    @GetMapping
    public ResponseEntity<?> getAll() {
        try {
            List<CouponDto> data = couponRepository.findAll()
                    .stream().map(this::toDto).collect(Collectors.toList());
            return ResponseEntity.ok(Map.of("success", true, "data", data));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Long id) {
        return couponRepository.findById(id)
                .map(c -> ResponseEntity.ok(Map.of("success", true, "data", toDto(c))))
                .orElseGet(() -> ResponseEntity.status(404).body(Map.of("success", false, "message", "Không tìm thấy mã giảm giá")));
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody CouponDto dto) {
        try {
            if (dto.getCode() == null || dto.getCode().isBlank()) {
                return ResponseEntity.status(400).body(Map.of("success", false, "message", "Mã giảm giá không được để trống"));
            }
            if (couponRepository.existsByCode(dto.getCode())) {
                return ResponseEntity.status(400).body(Map.of("success", false, "message", "Mã giảm giá đã tồn tại"));
            }
            Coupon coupon = Coupon.builder()
                    .code(dto.getCode())
                    .description(dto.getDescription())
                    .discountType(dto.getDiscountType() != null ? dto.getDiscountType() : "PERCENT")
                    .discountValue(dto.getDiscountValue())
                    .minimumOrderAmount(dto.getMinimumOrderAmount())
                    .maximumDiscount(dto.getMaximumDiscount())
                    .startDate(dto.getStartDate())
                    .endDate(dto.getEndDate())
                    .usageLimit(dto.getUsageLimit() != null ? dto.getUsageLimit() : 0)
                    .usedCount(0)
                    .active(dto.getActive() != null ? dto.getActive() : true)
                    .build();
            Coupon saved = couponRepository.save(coupon);
            return ResponseEntity.status(201).body(Map.of("success", true, "data", toDto(saved), "message", "Tạo mã giảm giá thành công"));
        } catch (Exception e) {
            return ResponseEntity.status(400).body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody CouponDto dto) {
        try {
            return couponRepository.findById(id).map(c -> {
                c.setCode(dto.getCode());
                c.setDescription(dto.getDescription());
                c.setDiscountType(dto.getDiscountType());
                c.setDiscountValue(dto.getDiscountValue());
                c.setMinimumOrderAmount(dto.getMinimumOrderAmount());
                c.setMaximumDiscount(dto.getMaximumDiscount());
                c.setStartDate(dto.getStartDate());
                c.setEndDate(dto.getEndDate());
                if (dto.getUsageLimit() != null) c.setUsageLimit(dto.getUsageLimit());
                if (dto.getActive() != null) c.setActive(dto.getActive());
                Coupon saved = couponRepository.save(c);
                return ResponseEntity.ok(Map.of("success", true, "data", toDto(saved), "message", "Cập nhật thành công"));
            }).orElseGet(() -> ResponseEntity.status(404).body(Map.of("success", false, "message", "Không tìm thấy mã giảm giá")));
        } catch (Exception e) {
            return ResponseEntity.status(400).body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @PutMapping("/{id}/toggle")
    public ResponseEntity<?> toggleActive(@PathVariable Long id) {
        return couponRepository.findById(id).map(c -> {
            c.setActive(!Boolean.TRUE.equals(c.getActive()));
            Coupon saved = couponRepository.save(c);
            return ResponseEntity.ok(Map.of("success", true, "data", toDto(saved)));
        }).orElseGet(() -> ResponseEntity.status(404).body(Map.of("success", false, "message", "Không tìm thấy mã giảm giá")));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        if (!couponRepository.existsById(id)) {
            return ResponseEntity.status(404).body(Map.of("success", false, "message", "Không tìm thấy mã giảm giá"));
        }
        couponRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("success", true, "message", "Đã xóa mã giảm giá"));
    }

    private CouponDto toDto(Coupon c) {
        return CouponDto.builder()
                .id(c.getId())
                .code(c.getCode())
                .description(c.getDescription())
                .discountType(c.getDiscountType())
                .discountValue(c.getDiscountValue())
                .minimumOrderAmount(c.getMinimumOrderAmount())
                .maximumDiscount(c.getMaximumDiscount())
                .startDate(c.getStartDate())
                .endDate(c.getEndDate())
                .usageLimit(c.getUsageLimit())
                .usedCount(c.getUsedCount())
                .active(c.getActive())
                .createdAt(c.getCreatedAt())
                .build();
    }
}
