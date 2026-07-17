package com.sportshop.backend.controller;

import com.sportshop.backend.dto.ColorDto;
import com.sportshop.backend.entity.Color;
import com.sportshop.backend.repository.ColorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Quản lý màu sắc (dữ liệu gốc dùng khi tạo biến thể sản phẩm).
 * Public GET để storefront cũng có thể hiển thị nếu cần, còn lại yêu cầu đăng nhập admin.
 */
@RestController
@RequestMapping("/api/admin/colors")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
public class ColorController {

    private final ColorRepository colorRepository;

    @GetMapping
    public ResponseEntity<?> getAll() {
        try {
            List<ColorDto> colors = colorRepository.findAll().stream().map(this::toDto).toList();
            return ResponseEntity.ok(Map.of("success", true, "data", colors));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody ColorDto dto) {
        try {
            if (dto.getName() == null || dto.getName().isBlank() || dto.getCode() == null || dto.getCode().isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Vui lòng nhập đầy đủ tên và mã màu"));
            }
            Color color = Color.builder()
                    .name(dto.getName())
                    .code(dto.getCode())
                    .active(dto.getActive() != null ? dto.getActive() : true)
                    .build();
            Color saved = colorRepository.save(color);
            return ResponseEntity.status(201).body(Map.of("success", true, "data", toDto(saved), "message", "Đã thêm màu sắc"));
        } catch (Exception e) {
            return ResponseEntity.status(400).body(Map.of("success", false, "message", "Tên hoặc mã màu đã tồn tại"));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody ColorDto dto) {
        try {
            Color color = colorRepository.findById(id).orElse(null);
            if (color == null) {
                return ResponseEntity.status(404).body(Map.of("success", false, "message", "Không tìm thấy màu sắc"));
            }
            if (dto.getName() != null) color.setName(dto.getName());
            if (dto.getCode() != null) color.setCode(dto.getCode());
            if (dto.getActive() != null) color.setActive(dto.getActive());
            Color saved = colorRepository.save(color);
            return ResponseEntity.ok(Map.of("success", true, "data", toDto(saved), "message", "Đã cập nhật màu sắc"));
        } catch (Exception e) {
            return ResponseEntity.status(400).body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        try {
            if (!colorRepository.existsById(id)) {
                return ResponseEntity.status(404).body(Map.of("success", false, "message", "Không tìm thấy màu sắc"));
            }
            colorRepository.deleteById(id);
            return ResponseEntity.ok(Map.of("success", true, "message", "Đã xoá màu sắc"));
        } catch (Exception e) {
            return ResponseEntity.status(400).body(Map.of("success", false, "message", "Không thể xoá vì màu này đang được dùng ở sản phẩm khác"));
        }
    }

    private ColorDto toDto(Color c) {
        return ColorDto.builder().id(c.getId()).name(c.getName()).code(c.getCode()).active(c.getActive()).build();
    }
}
