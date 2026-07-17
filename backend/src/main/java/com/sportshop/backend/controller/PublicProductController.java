package com.sportshop.backend.controller;

import com.sportshop.backend.dto.ProductDetailDto;
import com.sportshop.backend.dto.ProductDto;
import com.sportshop.backend.service.PublicProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * API công khai cho khách hàng duyệt sản phẩm - không cần đăng nhập.
 */
@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class PublicProductController {

    private final PublicProductService publicProductService;

    @GetMapping
    public ResponseEntity<?> searchProducts(
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Long brandId,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(required = false) Boolean featured,
            @RequestParam(required = false) Boolean newArrival,
            @RequestParam(required = false) String sort
    ) {
        try {
            List<ProductDto> products = publicProductService.searchProducts(
                    categoryId, brandId, keyword, minPrice, maxPrice, featured, newArrival, sort);
            return ResponseEntity.ok(Map.of("success", true, "data", products));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @GetMapping("/slug/{slug}")
    public ResponseEntity<?> getBySlug(@PathVariable String slug) {
        try {
            ProductDetailDto product = publicProductService.getBySlug(slug);
            if (product == null) {
                return ResponseEntity.status(404).body(Map.of("success", false, "message", "Không tìm thấy sản phẩm"));
            }
            return ResponseEntity.ok(Map.of("success", true, "data", product));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Long id) {
        try {
            ProductDetailDto product = publicProductService.getById(id);
            if (product == null) {
                return ResponseEntity.status(404).body(Map.of("success", false, "message", "Không tìm thấy sản phẩm"));
            }
            return ResponseEntity.ok(Map.of("success", true, "data", product));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("success", false, "message", e.getMessage()));
        }
    }
}
