package com.sportshop.backend.controller;

import com.sportshop.backend.dto.ProductDetailDto;
import com.sportshop.backend.dto.ProductDto;
import com.sportshop.backend.service.AdminProductService;
import com.sportshop.backend.service.ProductDetailService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/products")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
public class ProductController {
    
    private final ProductDetailService productDetailService;
    private final AdminProductService adminProductService;

    // ===== Sản phẩm đầy đủ: kèm biến thể (màu/giá riêng), size + tồn kho,
    // ảnh theo biến thể, thông số kỹ thuật. Dùng cho form quản trị sản phẩm. =====

    @GetMapping("/{id}/full")
    public ResponseEntity<?> getFullProduct(@PathVariable Long id) {
        try {
            ProductDetailDto product = adminProductService.getFullProduct(id);
            if (product == null) {
                return ResponseEntity.status(404).body(Map.of("success", false, "message", "Không tìm thấy sản phẩm"));
            }
            return ResponseEntity.ok(Map.of("success", true, "data", product));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @PostMapping("/full")
    public ResponseEntity<?> createFullProduct(@RequestBody ProductDetailDto dto) {
        try {
            ProductDetailDto created = adminProductService.createProduct(dto);
            return ResponseEntity.status(201).body(Map.of("success", true, "data", created, "message", "Tạo sản phẩm thành công"));
        } catch (Exception e) {
            return ResponseEntity.status(400).body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @PutMapping("/{id}/full")
    public ResponseEntity<?> updateFullProduct(@PathVariable Long id, @RequestBody ProductDetailDto dto) {
        try {
            ProductDetailDto updated = adminProductService.updateProduct(id, dto);
            return ResponseEntity.ok(Map.of("success", true, "data", updated, "message", "Cập nhật sản phẩm thành công"));
        } catch (Exception e) {
            return ResponseEntity.status(400).body(Map.of("success", false, "message", e.getMessage()));
        }
    }
    
    @GetMapping
    public ResponseEntity<?> getAllProducts() {
        try {
            List<ProductDto> products = productDetailService.getAllProducts();
            return ResponseEntity.ok(Map.of(
                "success", true,
                "data", products
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<?> getProductById(@PathVariable Long id) {
        try {
            ProductDto product = productDetailService.getProductById(id);
            if (product == null) {
                return ResponseEntity.status(404).body(Map.of(
                    "success", false,
                    "message", "Product not found"
                ));
            }
            return ResponseEntity.ok(Map.of(
                "success", true,
                "data", product
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }
    
    @PostMapping
    public ResponseEntity<?> createProduct(@RequestBody ProductDto dto) {
        try {
            ProductDto created = productDetailService.createProduct(dto);
            return ResponseEntity.status(201).body(Map.of(
                "success", true,
                "data", created,
                "message", "Product created successfully"
            ));
        } catch (Exception e) {
            return ResponseEntity.status(400).body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<?> updateProduct(@PathVariable Long id, @RequestBody ProductDto dto) {
        try {
            ProductDto updated = productDetailService.updateProduct(id, dto);
            if (updated == null) {
                return ResponseEntity.status(404).body(Map.of(
                    "success", false,
                    "message", "Product not found"
                ));
            }
            return ResponseEntity.ok(Map.of(
                "success", true,
                "data", updated,
                "message", "Product updated successfully"
            ));
        } catch (Exception e) {
            return ResponseEntity.status(400).body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProduct(@PathVariable Long id) {
        try {
            boolean deleted = productDetailService.deleteProduct(id);
            if (!deleted) {
                return ResponseEntity.status(404).body(Map.of(
                    "success", false,
                    "message", "Product not found"
                ));
            }
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Product deleted successfully"
            ));
        } catch (Exception e) {
            return ResponseEntity.status(400).body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }
}
