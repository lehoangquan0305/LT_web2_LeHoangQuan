package com.sportshop.backend.controller;

import com.sportshop.backend.dto.BannerDto;
import com.sportshop.backend.entity.Banner;
import com.sportshop.backend.repository.BannerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/banners")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
public class BannerController {

    private final BannerRepository bannerRepository;

    @GetMapping
    public ResponseEntity<?> getAll() {
        try {
            List<BannerDto> data = bannerRepository.findAll()
                    .stream()
                    .sorted(Comparator.comparing(Banner::getDisplayOrder, Comparator.nullsLast(Integer::compareTo)))
                    .map(this::toDto).collect(Collectors.toList());
            return ResponseEntity.ok(Map.of("success", true, "data", data));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Long id) {
        return bannerRepository.findById(id)
                .map(b -> ResponseEntity.ok(Map.of("success", true, "data", toDto(b))))
                .orElseGet(() -> ResponseEntity.status(404).body(Map.of("success", false, "message", "Không tìm thấy banner")));
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody BannerDto dto) {
        try {
            if (dto.getTitle() == null || dto.getTitle().isBlank() || dto.getImageUrl() == null || dto.getImageUrl().isBlank()) {
                return ResponseEntity.status(400).body(Map.of("success", false, "message", "Tiêu đề và ảnh không được để trống"));
            }
            Banner banner = Banner.builder()
                    .title(dto.getTitle())
                    .description(dto.getDescription())
                    .imageUrl(dto.getImageUrl())
                    .linkUrl(dto.getLinkUrl())
                    .displayOrder(dto.getDisplayOrder() != null ? dto.getDisplayOrder() : 0)
                    .startDate(dto.getStartDate())
                    .endDate(dto.getEndDate())
                    .active(dto.getActive() != null ? dto.getActive() : true)
                    .build();
            Banner saved = bannerRepository.save(banner);
            return ResponseEntity.status(201).body(Map.of("success", true, "data", toDto(saved), "message", "Tạo banner thành công"));
        } catch (Exception e) {
            return ResponseEntity.status(400).body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody BannerDto dto) {
        try {
            return bannerRepository.findById(id).map(b -> {
                b.setTitle(dto.getTitle());
                b.setDescription(dto.getDescription());
                b.setImageUrl(dto.getImageUrl());
                b.setLinkUrl(dto.getLinkUrl());
                if (dto.getDisplayOrder() != null) b.setDisplayOrder(dto.getDisplayOrder());
                b.setStartDate(dto.getStartDate());
                b.setEndDate(dto.getEndDate());
                if (dto.getActive() != null) b.setActive(dto.getActive());
                Banner saved = bannerRepository.save(b);
                return ResponseEntity.ok(Map.of("success", true, "data", toDto(saved), "message", "Cập nhật thành công"));
            }).orElseGet(() -> ResponseEntity.status(404).body(Map.of("success", false, "message", "Không tìm thấy banner")));
        } catch (Exception e) {
            return ResponseEntity.status(400).body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @PutMapping("/{id}/toggle")
    public ResponseEntity<?> toggleActive(@PathVariable Long id) {
        return bannerRepository.findById(id).map(b -> {
            b.setActive(!Boolean.TRUE.equals(b.getActive()));
            Banner saved = bannerRepository.save(b);
            return ResponseEntity.ok(Map.of("success", true, "data", toDto(saved)));
        }).orElseGet(() -> ResponseEntity.status(404).body(Map.of("success", false, "message", "Không tìm thấy banner")));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        if (!bannerRepository.existsById(id)) {
            return ResponseEntity.status(404).body(Map.of("success", false, "message", "Không tìm thấy banner"));
        }
        bannerRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("success", true, "message", "Đã xóa banner"));
    }

    private BannerDto toDto(Banner b) {
        return BannerDto.builder()
                .id(b.getId())
                .title(b.getTitle())
                .description(b.getDescription())
                .imageUrl(b.getImageUrl())
                .linkUrl(b.getLinkUrl())
                .displayOrder(b.getDisplayOrder())
                .startDate(b.getStartDate())
                .endDate(b.getEndDate())
                .active(b.getActive())
                .createdAt(b.getCreatedAt())
                .build();
    }
}
