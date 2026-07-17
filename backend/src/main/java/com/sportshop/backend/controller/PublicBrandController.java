package com.sportshop.backend.controller;

import com.sportshop.backend.dto.BrandDto;
import com.sportshop.backend.entity.Brand;
import com.sportshop.backend.repository.BrandRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/** Thương hiệu công khai - dùng cho menu/lọc sản phẩm trên storefront. */
@RestController
@RequestMapping("/api/brands")
@RequiredArgsConstructor
public class PublicBrandController {

    private final BrandRepository brandRepository;

    @GetMapping
    public ResponseEntity<?> getActiveBrands() {
        try {
            List<BrandDto> brands = brandRepository.findAll().stream()
                    .filter(b -> Boolean.TRUE.equals(b.getActive()))
                    .map(this::toDto)
                    .toList();
            return ResponseEntity.ok(Map.of("success", true, "data", brands));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    private BrandDto toDto(Brand b) {
        return BrandDto.builder()
                .id(b.getId())
                .name(b.getName())
                .slug(b.getSlug())
                .description(b.getDescription())
                .logoUrl(b.getLogoUrl())
                .active(b.getActive())
                .build();
    }
}
