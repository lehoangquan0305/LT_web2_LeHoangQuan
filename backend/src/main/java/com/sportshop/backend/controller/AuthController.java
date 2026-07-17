package com.sportshop.backend.controller;

import com.sportshop.backend.dto.CustomerAuthResponse;
import com.sportshop.backend.dto.LoginRequest;
import com.sportshop.backend.dto.RegisterRequest;
import com.sportshop.backend.entity.Cart;
import com.sportshop.backend.entity.Role;
import com.sportshop.backend.entity.User;
import com.sportshop.backend.repository.CartRepository;
import com.sportshop.backend.repository.RoleRepository;
import com.sportshop.backend.repository.UserRepository;
import com.sportshop.backend.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

/**
 * Xác thực dành cho khách hàng (storefront) - đăng ký / đăng nhập.
 * Khác với AdminApiController (chỉ dành cho vai trò ADMIN).
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final CartRepository cartRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {

        if (request.getEmail() == null || request.getEmail().isBlank()) {
            return ResponseEntity.badRequest().body(
                    CustomerAuthResponse.builder().success(false).message("Email không được để trống").build());
        }

        if (request.getPassword() == null || request.getPassword().length() < 6) {
            return ResponseEntity.badRequest().body(
                    CustomerAuthResponse.builder().success(false).message("Mật khẩu phải có ít nhất 6 ký tự").build());
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity.badRequest().body(
                    CustomerAuthResponse.builder().success(false).message("Email đã được sử dụng").build());
        }

        Role role = roleRepository.findByName("USER")
                .orElseGet(() -> roleRepository.save(Role.builder().name("USER").description("Khách hàng").build()));

        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .password(passwordEncoder.encode(request.getPassword()))
                .enabled(true)
                .role(role)
                .build();

        User saved = userRepository.save(user);

        // Tạo giỏ hàng rỗng cho khách hàng mới
        Cart cart = Cart.builder().user(saved).build();
        cartRepository.save(cart);

        String token = jwtService.generateToken(saved.getId(), saved.getEmail(), role.getName());

        return ResponseEntity.status(201).body(
                CustomerAuthResponse.builder()
                        .success(true)
                        .message("Đăng ký thành công")
                        .token(token)
                        .userId(saved.getId())
                        .email(saved.getEmail())
                        .fullName(saved.getFullName())
                        .role(role.getName())
                        .build());
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {

        User user = userRepository.findByEmail(request.getEmail()).orElse(null);

        if (user == null || !passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            return ResponseEntity.status(401).body(
                    CustomerAuthResponse.builder().success(false).message("Email hoặc mật khẩu không đúng").build());
        }

        if (!Boolean.TRUE.equals(user.getEnabled())) {
            return ResponseEntity.status(403).body(
                    CustomerAuthResponse.builder().success(false).message("Tài khoản đã bị khóa").build());
        }

        String roleName = user.getRole() != null ? user.getRole().getName() : "USER";
        String token = jwtService.generateToken(user.getId(), user.getEmail(), roleName);

        return ResponseEntity.ok(
                CustomerAuthResponse.builder()
                        .success(true)
                        .message("Đăng nhập thành công")
                        .token(token)
                        .userId(user.getId())
                        .email(user.getEmail())
                        .fullName(user.getFullName())
                        .role(roleName)
                        .build());
    }

    @GetMapping("/me")
    public ResponseEntity<?> me() {
        try {
            String email = org.springframework.security.core.context.SecurityContextHolder
                    .getContext().getAuthentication().getName();

            User user = userRepository.findByEmail(email).orElse(null);
            if (user == null) {
                return ResponseEntity.status(404).body(
                        CustomerAuthResponse.builder().success(false).message("Không tìm thấy người dùng").build());
            }

            return ResponseEntity.ok(
                    CustomerAuthResponse.builder()
                            .success(true)
                            .userId(user.getId())
                            .email(user.getEmail())
                            .fullName(user.getFullName())
                            .role(user.getRole() != null ? user.getRole().getName() : "USER")
                            .build());
        } catch (Exception e) {
            return ResponseEntity.status(401).body(
                    CustomerAuthResponse.builder().success(false).message("Phiên đăng nhập không hợp lệ").build());
        }
    }
}
