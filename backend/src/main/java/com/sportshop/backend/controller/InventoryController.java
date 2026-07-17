package com.sportshop.backend.controller;

import com.sportshop.backend.dto.InventoryHistoryDto;
import com.sportshop.backend.entity.InventoryHistory;
import com.sportshop.backend.entity.ProductSize;
import com.sportshop.backend.repository.InventoryHistoryRepository;
import com.sportshop.backend.repository.ProductSizeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Comparator;
import java.util.List;
import java.util.Map;

/**
 * Xem lịch sử biến động kho (nhập/xuất/trừ do bán hàng/hoàn kho do huỷ đơn)
 * và điều chỉnh tồn kho thủ công cho từng size sản phẩm.
 */
@RestController
@RequestMapping("/api/admin/inventory")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
public class InventoryController {

    private final InventoryHistoryRepository inventoryHistoryRepository;
    private final ProductSizeRepository productSizeRepository;

    @GetMapping
    public ResponseEntity<?> getHistory() {
        try {
            List<InventoryHistoryDto> list = inventoryHistoryRepository.findAll().stream()
                    .sorted(Comparator.comparing(InventoryHistory::getCreatedAt).reversed())
                    .map(this::toDto)
                    .toList();
            return ResponseEntity.ok(Map.of("success", true, "data", list));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    /** Điều chỉnh tồn kho thủ công (nhập thêm hàng, kiểm kho...) cho 1 size cụ thể. */
    @PostMapping("/adjust")
    public ResponseEntity<?> adjustStock(@RequestBody Map<String, Object> body) {
        try {
            Long productSizeId = Long.valueOf(String.valueOf(body.get("productSizeId")));
            int quantity = Integer.parseInt(String.valueOf(body.get("quantity")));
            String note = body.get("note") != null ? String.valueOf(body.get("note")) : "Điều chỉnh kho thủ công";

            ProductSize size = productSizeRepository.findById(productSizeId)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy size sản phẩm"));

            int newStock = (size.getStock() != null ? size.getStock() : 0) + quantity;
            if (newStock < 0) {
                return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Số lượng tồn kho không thể âm"));
            }
            size.setStock(newStock);
            productSizeRepository.save(size);

            InventoryHistory history = inventoryHistoryRepository.save(InventoryHistory.builder()
                    .productSize(size)
                    .quantity(quantity)
                    .type("ADJUST")
                    .note(note)
                    .build());

            return ResponseEntity.ok(Map.of("success", true, "data", toDto(history), "message", "Đã cập nhật tồn kho"));
        } catch (Exception e) {
            return ResponseEntity.status(400).body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    private InventoryHistoryDto toDto(InventoryHistory h) {
        ProductSize size = h.getProductSize();
        return InventoryHistoryDto.builder()
                .id(h.getId())
                .quantity(h.getQuantity())
                .type(h.getType())
                .note(h.getNote())
                .productSizeId(size.getId())
                .size(size.getSize())
                .currentStock(size.getStock())
                .productName(size.getVariant().getProduct().getName())
                .colorName(size.getVariant().getColor() != null ? size.getVariant().getColor().getName() : null)
                .sku(size.getVariant().getSku())
                .createdAt(h.getCreatedAt())
                .build();
    }
}
