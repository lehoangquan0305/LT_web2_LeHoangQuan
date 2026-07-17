package com.sportshop.backend.controller;

import com.sportshop.backend.dto.CategoryDto;
import com.sportshop.backend.entity.Category;
import com.sportshop.backend.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/** Danh mục sản phẩm công khai - dùng cho menu/lọc sản phẩm trên storefront. */
@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class PublicCategoryController {

    private final CategoryRepository categoryRepository;

    @GetMapping
    public ResponseEntity<?> getActiveCategories() {
        try {
            List<CategoryDto> categories = categoryRepository.findAll().stream()
                    .filter(c -> Boolean.TRUE.equals(c.getActive()))
                    .map(this::toDto)
                    .toList();
            return ResponseEntity.ok(Map.of("success", true, "data", categories));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    private CategoryDto toDto(Category c) {
        return CategoryDto.builder()
                .id(c.getId())
                .name(c.getName())
                .slug(c.getSlug())
                .description(c.getDescription())
                .imageUrl(c.getImageUrl())
                .active(c.getActive())
                .build();
    }
}
