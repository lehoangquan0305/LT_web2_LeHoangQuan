package com.sportshop.backend.controller;

import com.sportshop.backend.dto.WishlistDto;
import com.sportshop.backend.entity.User;
import com.sportshop.backend.security.CurrentUserProvider;
import com.sportshop.backend.service.WishlistService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/** Danh sách yêu thích của khách hàng đang đăng nhập. */
@RestController
@RequestMapping("/api/wishlist")
@RequiredArgsConstructor
public class WishlistController {

    private final WishlistService wishlistService;
    private final CurrentUserProvider currentUserProvider;

    @GetMapping
    public ResponseEntity<?> getWishlist() {
        try {
            User user = currentUserProvider.getCurrentUser();
            List<WishlistDto> list = wishlistService.getWishlist(user);
            return ResponseEntity.ok(Map.of("success", true, "data", list));
        } catch (Exception e) {
            return ResponseEntity.status(400).body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @PostMapping("/{productId}")
    public ResponseEntity<?> addToWishlist(@PathVariable Long productId) {
        try {
            User user = currentUserProvider.getCurrentUser();
            WishlistDto dto = wishlistService.addToWishlist(user, productId);
            return ResponseEntity.ok(Map.of("success", true, "data", dto, "message", "Đã thêm vào yêu thích"));
        } catch (Exception e) {
            return ResponseEntity.status(400).body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @DeleteMapping("/{productId}")
    public ResponseEntity<?> removeFromWishlist(@PathVariable Long productId) {
        try {
            User user = currentUserProvider.getCurrentUser();
            wishlistService.removeFromWishlist(user, productId);
            return ResponseEntity.ok(Map.of("success", true, "message", "Đã xóa khỏi yêu thích"));
        } catch (Exception e) {
            return ResponseEntity.status(400).body(Map.of("success", false, "message", e.getMessage()));
        }
    }
}
