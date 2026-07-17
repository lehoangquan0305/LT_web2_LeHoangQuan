package com.sportshop.backend.controller;

import com.sportshop.backend.dto.CheckoutRequest;
import com.sportshop.backend.dto.OrderDetailDto;
import com.sportshop.backend.dto.OrderDto;
import com.sportshop.backend.entity.User;
import com.sportshop.backend.security.CurrentUserProvider;
import com.sportshop.backend.service.CustomerOrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/** Đặt hàng và xem lịch sử đơn hàng của khách hàng đang đăng nhập. */
@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class CustomerOrderController {

    private final CustomerOrderService customerOrderService;
    private final CurrentUserProvider currentUserProvider;

    @PostMapping("/checkout")
    public ResponseEntity<?> checkout(@RequestBody CheckoutRequest request) {
        try {
            User user = currentUserProvider.getCurrentUser();
            OrderDetailDto order = customerOrderService.checkout(user, request);
            return ResponseEntity.status(201).body(Map.of("success", true, "data", order, "message", "Đặt hàng thành công"));
        } catch (Exception e) {
            return ResponseEntity.status(400).body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<?> getMyOrders() {
        try {
            User user = currentUserProvider.getCurrentUser();
            List<OrderDto> orders = customerOrderService.getMyOrders(user);
            return ResponseEntity.ok(Map.of("success", true, "data", orders));
        } catch (Exception e) {
            return ResponseEntity.status(400).body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getMyOrderDetail(@PathVariable Long id) {
        try {
            User user = currentUserProvider.getCurrentUser();
            OrderDetailDto order = customerOrderService.getMyOrderDetail(user, id);
            return ResponseEntity.ok(Map.of("success", true, "data", order));
        } catch (Exception e) {
            return ResponseEntity.status(400).body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<?> cancelOrder(@PathVariable Long id) {
        try {
            User user = currentUserProvider.getCurrentUser();
            OrderDetailDto order = customerOrderService.cancelMyOrder(user, id);
            return ResponseEntity.ok(Map.of("success", true, "data", order, "message", "Đã huỷ đơn hàng"));
        } catch (Exception e) {
            return ResponseEntity.status(400).body(Map.of("success", false, "message", e.getMessage()));
        }
    }
}
