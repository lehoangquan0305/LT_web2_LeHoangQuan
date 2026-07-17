package com.sportshop.backend.controller;

import com.sportshop.backend.dto.BrandDto;
import com.sportshop.backend.service.BrandService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/brands")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
public class BrandController {
    
    private final BrandService brandService;
    
    @GetMapping
    public ResponseEntity<?> getAllBrands() {
        try {
            List<BrandDto> brands = brandService.getAllBrands();
            return ResponseEntity.ok(Map.of(
                "success", true,
                "data", brands
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<?> getBrandById(@PathVariable Long id) {
        try {
            BrandDto brand = brandService.getBrandById(id);
            if (brand == null) {
                return ResponseEntity.status(404).body(Map.of(
                    "success", false,
                    "message", "Brand not found"
                ));
            }
            return ResponseEntity.ok(Map.of(
                "success", true,
                "data", brand
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }
    
    @PostMapping
    public ResponseEntity<?> createBrand(@RequestBody BrandDto dto) {
        try {
            BrandDto created = brandService.createBrand(dto);
            return ResponseEntity.status(201).body(Map.of(
                "success", true,
                "data", created,
                "message", "Brand created successfully"
            ));
        } catch (Exception e) {
            return ResponseEntity.status(400).body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<?> updateBrand(@PathVariable Long id, @RequestBody BrandDto dto) {
        try {
            BrandDto updated = brandService.updateBrand(id, dto);
            if (updated == null) {
                return ResponseEntity.status(404).body(Map.of(
                    "success", false,
                    "message", "Brand not found"
                ));
            }
            return ResponseEntity.ok(Map.of(
                "success", true,
                "data", updated,
                "message", "Brand updated successfully"
            ));
        } catch (Exception e) {
            return ResponseEntity.status(400).body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteBrand(@PathVariable Long id) {
        try {
            boolean deleted = brandService.deleteBrand(id);
            if (!deleted) {
                return ResponseEntity.status(404).body(Map.of(
                    "success", false,
                    "message", "Brand not found"
                ));
            }
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Brand deleted successfully"
            ));
        } catch (Exception e) {
            return ResponseEntity.status(400).body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }
}
