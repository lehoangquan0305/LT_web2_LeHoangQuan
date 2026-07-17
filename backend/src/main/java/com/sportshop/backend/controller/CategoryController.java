package com.sportshop.backend.controller;

import com.sportshop.backend.dto.CategoryDto;
import com.sportshop.backend.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/categories")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
public class CategoryController {
    
    private final CategoryService categoryService;
    
    @GetMapping
    public ResponseEntity<?> getAllCategories() {
        try {
            List<CategoryDto> categories = categoryService.getAllCategories();
            return ResponseEntity.ok(Map.of(
                "success", true,
                "data", categories
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<?> getCategoryById(@PathVariable Long id) {
        try {
            CategoryDto category = categoryService.getCategoryById(id);
            if (category == null) {
                return ResponseEntity.status(404).body(Map.of(
                    "success", false,
                    "message", "Category not found"
                ));
            }
            return ResponseEntity.ok(Map.of(
                "success", true,
                "data", category
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }
    
    @PostMapping
    public ResponseEntity<?> createCategory(@RequestBody CategoryDto dto) {
        try {
            CategoryDto created = categoryService.createCategory(dto);
            return ResponseEntity.status(201).body(Map.of(
                "success", true,
                "data", created,
                "message", "Category created successfully"
            ));
        } catch (Exception e) {
            return ResponseEntity.status(400).body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<?> updateCategory(@PathVariable Long id, @RequestBody CategoryDto dto) {
        try {
            CategoryDto updated = categoryService.updateCategory(id, dto);
            if (updated == null) {
                return ResponseEntity.status(404).body(Map.of(
                    "success", false,
                    "message", "Category not found"
                ));
            }
            return ResponseEntity.ok(Map.of(
                "success", true,
                "data", updated,
                "message", "Category updated successfully"
            ));
        } catch (Exception e) {
            return ResponseEntity.status(400).body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCategory(@PathVariable Long id) {
        try {
            boolean deleted = categoryService.deleteCategory(id);
            if (!deleted) {
                return ResponseEntity.status(404).body(Map.of(
                    "success", false,
                    "message", "Category not found"
                ));
            }
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Category deleted successfully"
            ));
        } catch (Exception e) {
            return ResponseEntity.status(400).body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }
}
