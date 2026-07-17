package com.sportshop.backend.controller;

import com.sportshop.backend.dto.ReviewDto;
import com.sportshop.backend.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/reviews")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @GetMapping
    public ResponseEntity<?> getAllReviews() {
        try {
            List<ReviewDto> reviews = reviewService.getAllReviews();
            return ResponseEntity.ok(Map.of("success", true, "data", reviews));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getReviewById(@PathVariable Long id) {
        try {
            ReviewDto review = reviewService.getReviewById(id);
            if (review == null) {
                return ResponseEntity.status(404).body(Map.of("success", false, "message", "Không tìm thấy đánh giá"));
            }
            return ResponseEntity.ok(Map.of("success", true, "data", review));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<?> approveReview(@PathVariable Long id) {
        try {
            ReviewDto updated = reviewService.setApproved(id, true);
            if (updated == null) {
                return ResponseEntity.status(404).body(Map.of("success", false, "message", "Không tìm thấy đánh giá"));
            }
            return ResponseEntity.ok(Map.of("success", true, "data", updated, "message", "Đã duyệt đánh giá"));
        } catch (Exception e) {
            return ResponseEntity.status(400).body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<?> rejectReview(@PathVariable Long id) {
        try {
            ReviewDto updated = reviewService.setApproved(id, false);
            if (updated == null) {
                return ResponseEntity.status(404).body(Map.of("success", false, "message", "Không tìm thấy đánh giá"));
            }
            return ResponseEntity.ok(Map.of("success", true, "data", updated, "message", "Đã từ chối đánh giá"));
        } catch (Exception e) {
            return ResponseEntity.status(400).body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @PutMapping("/{id}/reply")
    public ResponseEntity<?> replyReview(@PathVariable Long id, @RequestBody Map<String, String> body) {
        try {
            ReviewDto updated = reviewService.replyToReview(id, body.get("adminReply"));
            if (updated == null) {
                return ResponseEntity.status(404).body(Map.of("success", false, "message", "Không tìm thấy đánh giá"));
            }
            return ResponseEntity.ok(Map.of("success", true, "data", updated, "message", "Đã phản hồi đánh giá"));
        } catch (Exception e) {
            return ResponseEntity.status(400).body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteReview(@PathVariable Long id) {
        try {
            boolean deleted = reviewService.deleteReview(id);
            if (!deleted) {
                return ResponseEntity.status(404).body(Map.of("success", false, "message", "Không tìm thấy đánh giá"));
            }
            return ResponseEntity.ok(Map.of("success", true, "message", "Xoá đánh giá thành công"));
        } catch (Exception e) {
            return ResponseEntity.status(400).body(Map.of("success", false, "message", e.getMessage()));
        }
    }
}
