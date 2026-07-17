package com.sportshop.backend.controller;

import com.sportshop.backend.dto.ReviewCreateRequest;
import com.sportshop.backend.dto.ReviewDto;
import com.sportshop.backend.entity.User;
import com.sportshop.backend.security.CurrentUserProvider;
import com.sportshop.backend.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * API đánh giá sản phẩm công khai:
 * - Xem đánh giá đã duyệt của 1 sản phẩm: không cần đăng nhập
 * - Gửi đánh giá mới: cần đăng nhập
 */
@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class PublicReviewController {

    private final ReviewService reviewService;
    private final CurrentUserProvider currentUserProvider;

    @GetMapping("/product/{productId}")
    public ResponseEntity<?> getReviewsForProduct(@PathVariable Long productId) {
        try {
            List<ReviewDto> reviews = reviewService.getApprovedReviewsForProduct(productId);
            return ResponseEntity.ok(Map.of("success", true, "data", reviews));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<?> submitReview(@RequestBody ReviewCreateRequest request) {
        try {
            User user = currentUserProvider.getCurrentUser();
            ReviewDto review = reviewService.submitReview(user, request.getProductId(), request.getRating(), request.getComment());
            return ResponseEntity.status(201).body(Map.of(
                    "success", true, "data", review,
                    "message", "Cảm ơn bạn đã đánh giá! Đánh giá sẽ hiển thị sau khi được duyệt."
            ));
        } catch (Exception e) {
            return ResponseEntity.status(400).body(Map.of("success", false, "message", e.getMessage()));
        }
    }
}
