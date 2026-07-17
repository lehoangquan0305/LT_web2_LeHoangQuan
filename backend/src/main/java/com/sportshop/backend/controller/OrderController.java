package com.sportshop.backend.controller;

import com.sportshop.backend.dto.OrderDto;
import com.sportshop.backend.dto.OrderItemDto;
import com.sportshop.backend.dto.OrderStatusHistoryDto;
import com.sportshop.backend.entity.Order;
import com.sportshop.backend.entity.OrderStatusHistory;
import com.sportshop.backend.entity.Payment;
import com.sportshop.backend.entity.enums.OrderStatus;
import com.sportshop.backend.repository.OrderItemRepository;
import com.sportshop.backend.repository.OrderRepository;
import com.sportshop.backend.repository.OrderStatusHistoryRepository;
import com.sportshop.backend.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/orders")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
public class OrderController {
    
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final OrderStatusHistoryRepository orderStatusHistoryRepository;
    private final PaymentRepository paymentRepository;
    
    @GetMapping
    public ResponseEntity<?> getAllOrders() {
        try {
            List<OrderDto> orders = orderRepository.findAll()
                .stream()
                .map(this::entityToDto)
                .collect(Collectors.toList());
            return ResponseEntity.ok(Map.of(
                "success", true,
                "data", orders
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<?> getOrderById(@PathVariable Long id) {
        try {
            return orderRepository.findById(id)
                .map(order -> ResponseEntity.ok(Map.of(
                    "success", true,
                    "data", entityToDetailDto(order)
                )))
                .orElseGet(() -> ResponseEntity.status(404).body(Map.of(
                    "success", false,
                    "message", "Order not found"
                )));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }
    
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateOrderStatus(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        try {
            return orderRepository.findById(id)
                .map(order -> {
                    String newStatus = payload.get("status");
                    order.setStatus(newStatus);
                    order.setUpdatedAt(LocalDateTime.now());
                    Order updated = orderRepository.save(order);

                    OrderStatus statusEnum;
                    try {
                        statusEnum = OrderStatus.valueOf(newStatus);
                    } catch (Exception e) {
                        statusEnum = OrderStatus.PENDING;
                    }

                    orderStatusHistoryRepository.save(OrderStatusHistory.builder()
                            .order(updated)
                            .status(statusEnum)
                            .note(payload.getOrDefault("note", "Cập nhật trạng thái bởi quản trị viên"))
                            .changedBy("ADMIN")
                            .build());

                    return ResponseEntity.ok(Map.of(
                        "success", true,
                        "data", entityToDetailDto(updated),
                        "message", "Order status updated successfully"
                    ));
                })
                .orElseGet(() -> ResponseEntity.status(404).body(Map.of(
                    "success", false,
                    "message", "Order not found"
                )));
        } catch (Exception e) {
            return ResponseEntity.status(400).body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteOrder(@PathVariable Long id) {
        try {
            if (orderRepository.existsById(id)) {
                orderRepository.deleteById(id);
                return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Order deleted successfully"
                ));
            }
            return ResponseEntity.status(404).body(Map.of(
                "success", false,
                "message", "Order not found"
            ));
        } catch (Exception e) {
            return ResponseEntity.status(400).body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }
    
    private OrderDto entityToDto(Order order) {
        return OrderDto.builder()
            .id(order.getId())
            .orderCode(order.getOrderCode())
            .subtotal(order.getSubtotal())
            .discountAmount(order.getDiscountAmount())
            .shippingFee(order.getShippingFee())
            .totalAmount(order.getTotalAmount())
            .status(order.getStatus())
            .receiverName(order.getReceiverName())
            .receiverPhone(order.getReceiverPhone())
            .shippingAddress(order.getShippingAddress())
            .note(order.getNote())
            .createdAt(order.getCreatedAt())
            .updatedAt(order.getUpdatedAt())
            .customerId(order.getUser() != null ? order.getUser().getId() : null)
            .customerName(order.getUser() != null ? order.getUser().getFullName() : null)
            .customerEmail(order.getUser() != null ? order.getUser().getEmail() : null)
            .build();
    }

    private OrderDto entityToDetailDto(Order order) {
        List<OrderItemDto> items = orderItemRepository.findByOrderId(order.getId()).stream()
                .map(i -> OrderItemDto.builder()
                        .id(i.getId())
                        .productName(i.getProductName())
                        .sku(i.getSku())
                        .color(i.getColor())
                        .size(i.getSize())
                        .thumbnailUrl(i.getThumbnailUrl())
                        .unitPrice(i.getUnitPrice())
                        .quantity(i.getQuantity())
                        .totalPrice(i.getTotalPrice())
                        .build())
                .collect(Collectors.toList());

        Payment payment = paymentRepository.findByOrderId(order.getId()).orElse(null);

        List<OrderStatusHistoryDto> history = orderStatusHistoryRepository.findByOrderIdOrderByCreatedAtDesc(order.getId())
                .stream()
                .map(h -> OrderStatusHistoryDto.builder()
                        .id(h.getId())
                        .status(h.getStatus() != null ? h.getStatus().name() : null)
                        .note(h.getNote())
                        .changedBy(h.getChangedBy())
                        .createdAt(h.getCreatedAt())
                        .build())
                .collect(Collectors.toList());

        return OrderDto.builder()
                .id(order.getId())
                .orderCode(order.getOrderCode())
                .subtotal(order.getSubtotal())
                .discountAmount(order.getDiscountAmount())
                .shippingFee(order.getShippingFee())
                .totalAmount(order.getTotalAmount())
                .status(order.getStatus())
                .receiverName(order.getReceiverName())
                .receiverPhone(order.getReceiverPhone())
                .shippingAddress(order.getShippingAddress())
                .note(order.getNote())
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .customerId(order.getUser() != null ? order.getUser().getId() : null)
                .customerName(order.getUser() != null ? order.getUser().getFullName() : null)
                .customerEmail(order.getUser() != null ? order.getUser().getEmail() : null)
                .items(items)
                .paymentMethod(payment != null ? payment.getPaymentMethod().name() : null)
                .paymentStatus(payment != null ? payment.getPaymentStatus().name() : null)
                .transactionCode(payment != null ? payment.getTransactionCode() : null)
                .statusHistory(history)
                .build();
    }
}
