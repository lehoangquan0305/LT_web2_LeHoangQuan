package com.sportshop.backend.controller;

import com.sportshop.backend.dto.CustomerDto;
import com.sportshop.backend.service.CustomerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/customers")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
public class CustomerController {

    private final CustomerService customerService;

    @GetMapping
    public ResponseEntity<?> getAllCustomers() {
        try {
            List<CustomerDto> customers = customerService.getAllCustomers();
            return ResponseEntity.ok(Map.of("success", true, "data", customers));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getCustomerById(@PathVariable Long id) {
        try {
            CustomerDto customer = customerService.getCustomerById(id);
            if (customer == null) {
                return ResponseEntity.status(404).body(Map.of("success", false, "message", "Không tìm thấy khách hàng"));
            }
            return ResponseEntity.ok(Map.of("success", true, "data", customer));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<?> createCustomer(@RequestBody Map<String, Object> body) {
        try {
            CustomerDto dto = CustomerDto.builder()
                    .fullName((String) body.get("fullName"))
                    .email((String) body.get("email"))
                    .phone((String) body.get("phone"))
                    .avatarUrl((String) body.get("avatarUrl"))
                    .enabled(body.get("enabled") != null ? (Boolean) body.get("enabled") : true)
                    .build();

            String password = (String) body.get("password");

            CustomerDto created = customerService.createCustomer(dto, password);
            return ResponseEntity.status(201).body(Map.of(
                    "success", true, "data", created, "message", "Tạo khách hàng thành công"
            ));
        } catch (Exception e) {
            return ResponseEntity.status(400).body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateCustomer(@PathVariable Long id, @RequestBody CustomerDto dto) {
        try {
            CustomerDto updated = customerService.updateCustomer(id, dto);
            if (updated == null) {
                return ResponseEntity.status(404).body(Map.of("success", false, "message", "Không tìm thấy khách hàng"));
            }
            return ResponseEntity.ok(Map.of("success", true, "data", updated, "message", "Cập nhật thành công"));
        } catch (Exception e) {
            return ResponseEntity.status(400).body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @PutMapping("/{id}/toggle")
    public ResponseEntity<?> toggleEnabled(@PathVariable Long id) {
        try {
            CustomerDto updated = customerService.toggleEnabled(id);
            if (updated == null) {
                return ResponseEntity.status(404).body(Map.of("success", false, "message", "Không tìm thấy khách hàng"));
            }
            return ResponseEntity.ok(Map.of("success", true, "data", updated, "message", "Cập nhật trạng thái thành công"));
        } catch (Exception e) {
            return ResponseEntity.status(400).body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCustomer(@PathVariable Long id) {
        try {
            boolean deleted = customerService.deleteCustomer(id);
            if (!deleted) {
                return ResponseEntity.status(404).body(Map.of("success", false, "message", "Không tìm thấy khách hàng"));
            }
            return ResponseEntity.ok(Map.of("success", true, "message", "Xoá khách hàng thành công"));
        } catch (Exception e) {
            return ResponseEntity.status(400).body(Map.of("success", false, "message", e.getMessage()));
        }
    }
}
