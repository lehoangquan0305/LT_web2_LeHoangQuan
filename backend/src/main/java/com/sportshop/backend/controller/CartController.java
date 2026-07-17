package com.sportshop.backend.controller;

import com.sportshop.backend.dto.AddToCartRequest;
import com.sportshop.backend.dto.CartDto;
import com.sportshop.backend.entity.User;
import com.sportshop.backend.security.CurrentUserProvider;
import com.sportshop.backend.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/** Giỏ hàng của khách hàng đang đăng nhập. */
@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;
    private final CurrentUserProvider currentUserProvider;

    @GetMapping
    public ResponseEntity<?> getCart() {
        try {
            User user = currentUserProvider.getCurrentUser();
            CartDto cart = cartService.getOrCreateCart(user);
            return ResponseEntity.ok(Map.of("success", true, "data", cart));
        } catch (Exception e) {
            return ResponseEntity.status(400).body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @PostMapping("/items")
    public ResponseEntity<?> addItem(@RequestBody AddToCartRequest request) {
        try {
            User user = currentUserProvider.getCurrentUser();
            CartDto cart = cartService.addItem(user, request.getProductSizeId(), request.getQuantity());
            return ResponseEntity.ok(Map.of("success", true, "data", cart, "message", "Đã thêm vào giỏ hàng"));
        } catch (Exception e) {
            return ResponseEntity.status(400).body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @PutMapping("/items/{itemId}")
    public ResponseEntity<?> updateItem(@PathVariable Long itemId, @RequestBody Map<String, Integer> body) {
        try {
            User user = currentUserProvider.getCurrentUser();
            CartDto cart = cartService.updateItem(user, itemId, body.get("quantity"));
            return ResponseEntity.ok(Map.of("success", true, "data", cart));
        } catch (Exception e) {
            return ResponseEntity.status(400).body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @DeleteMapping("/items/{itemId}")
    public ResponseEntity<?> removeItem(@PathVariable Long itemId) {
        try {
            User user = currentUserProvider.getCurrentUser();
            CartDto cart = cartService.removeItem(user, itemId);
            return ResponseEntity.ok(Map.of("success", true, "data", cart, "message", "Đã xóa khỏi giỏ hàng"));
        } catch (Exception e) {
            return ResponseEntity.status(400).body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @DeleteMapping
    public ResponseEntity<?> clearCart() {
        try {
            User user = currentUserProvider.getCurrentUser();
            CartDto cart = cartService.clearCart(user);
            return ResponseEntity.ok(Map.of("success", true, "data", cart));
        } catch (Exception e) {
            return ResponseEntity.status(400).body(Map.of("success", false, "message", e.getMessage()));
        }
    }
}
