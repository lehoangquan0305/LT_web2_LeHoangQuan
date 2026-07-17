package com.sportshop.backend.security;

import com.sportshop.backend.entity.User;
import com.sportshop.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

/**
 * Lấy thông tin User đang đăng nhập (từ JWT đã được JwtAuthFilter xác thực
 * và lưu email vào SecurityContext) - dùng trong các API cần biết "khách hàng
 * đang đăng nhập là ai" như giỏ hàng, wishlist, đơn hàng, địa chỉ...
 */
@Component
@RequiredArgsConstructor
public class CurrentUserProvider {

    private final UserRepository userRepository;

    public User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng đang đăng nhập"));
    }
}
