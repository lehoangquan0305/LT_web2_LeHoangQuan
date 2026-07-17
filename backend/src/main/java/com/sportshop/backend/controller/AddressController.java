package com.sportshop.backend.controller;

import com.sportshop.backend.dto.AddressDto;
import com.sportshop.backend.entity.User;
import com.sportshop.backend.security.CurrentUserProvider;
import com.sportshop.backend.service.AddressService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/** Sổ địa chỉ giao hàng của khách hàng đang đăng nhập. */
@RestController
@RequestMapping("/api/addresses")
@RequiredArgsConstructor
public class AddressController {

    private final AddressService addressService;
    private final CurrentUserProvider currentUserProvider;

    @GetMapping
    public ResponseEntity<?> getAddresses() {
        try {
            User user = currentUserProvider.getCurrentUser();
            List<AddressDto> list = addressService.getAddresses(user);
            return ResponseEntity.ok(Map.of("success", true, "data", list));
        } catch (Exception e) {
            return ResponseEntity.status(400).body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<?> createAddress(@RequestBody AddressDto dto) {
        try {
            User user = currentUserProvider.getCurrentUser();
            AddressDto created = addressService.createAddress(user, dto);
            return ResponseEntity.status(201).body(Map.of("success", true, "data", created, "message", "Đã thêm địa chỉ"));
        } catch (Exception e) {
            return ResponseEntity.status(400).body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateAddress(@PathVariable Long id, @RequestBody AddressDto dto) {
        try {
            User user = currentUserProvider.getCurrentUser();
            AddressDto updated = addressService.updateAddress(user, id, dto);
            return ResponseEntity.ok(Map.of("success", true, "data", updated, "message", "Đã cập nhật địa chỉ"));
        } catch (Exception e) {
            return ResponseEntity.status(400).body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteAddress(@PathVariable Long id) {
        try {
            User user = currentUserProvider.getCurrentUser();
            addressService.deleteAddress(user, id);
            return ResponseEntity.ok(Map.of("success", true, "message", "Đã xóa địa chỉ"));
        } catch (Exception e) {
            return ResponseEntity.status(400).body(Map.of("success", false, "message", e.getMessage()));
        }
    }
}
