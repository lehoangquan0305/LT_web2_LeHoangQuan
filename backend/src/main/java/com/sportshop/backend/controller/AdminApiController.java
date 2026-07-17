package com.sportshop.backend.controller;

import com.sportshop.backend.dto.AdminLoginRequest;
import com.sportshop.backend.dto.AdminLoginResponse;
import com.sportshop.backend.entity.Order;
import com.sportshop.backend.entity.User;
import com.sportshop.backend.repository.OrderRepository;
import com.sportshop.backend.repository.ProductRepository;
import com.sportshop.backend.repository.UserRepository;
import com.sportshop.backend.security.JwtService;

import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;


@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
public class AdminApiController {


    private final UserRepository userRepository;

    private final ProductRepository productRepository;

    private final OrderRepository orderRepository;

    private final PasswordEncoder passwordEncoder;

    private final JwtService jwtService;



    // ==========================
    // ADMIN LOGIN
    // ==========================

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody AdminLoginRequest request
    ){


        User user = userRepository
                .findByEmail(request.getEmail())
                .orElse(null);



        // Không tồn tại user

        if(user == null){

            return ResponseEntity
                    .status(401)
                    .body(
                        Map.of(
                            "success", false,
                            "message",
                            "Email không tồn tại"
                        )
                    );

        }



        // Sai password

        if(!passwordEncoder.matches(
                request.getPassword(),
                user.getPassword()
        )){


            return ResponseEntity
                    .status(401)
                    .body(
                        Map.of(
                            "success",
                            false,
                            "message",
                            "Mật khẩu không đúng"
                        )
                    );

        }




        // Check tài khoản bị khóa

        if(!user.getEnabled()){


            return ResponseEntity
                    .status(403)
                    .body(
                        Map.of(
                            "success",
                            false,
                            "message",
                            "Tài khoản đã bị khóa"
                        )
                    );

        }





        // Check quyền ADMIN

        if(
            user.getRole()==null ||
            !"ADMIN".equalsIgnoreCase(
                user.getRole().getName()
            )
        ){


            return ResponseEntity
                    .status(403)
                    .body(
                        Map.of(
                            "success",
                            false,
                            "message",
                            "Không có quyền quản trị"
                        )
                    );

        }




        // Login thành công - phát hành JWT token

        String token = jwtService.generateToken(
                user.getId(),
                user.getEmail(),
                user.getRole().getName()
        );

        Map<String, Object> body = new HashMap<>();
        body.put("success", true);
        body.put("message", "Đăng nhập thành công");
        body.put("token", token);
        body.put("userId", user.getId());
        body.put("email", user.getEmail());
        body.put("fullName", user.getFullName());
        body.put("role", user.getRole().getName());

        return ResponseEntity.ok(body);


    }

@GetMapping("/test")
public String test(){
    return "ADMIN API OK";
}



    // ==========================
    // ADMIN DASHBOARD
    // ==========================


    @GetMapping("/dashboard")
    public ResponseEntity<?> dashboard(){


        Map<String,Object> data =
                new HashMap<>();


        List<Order> allOrders = orderRepository.findAll();

        BigDecimal revenue = allOrders.stream()
                .filter(o -> o.getTotalAmount() != null)
                .filter(o -> !"CANCELLED".equalsIgnoreCase(o.getStatus()))
                .map(Order::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long pendingOrders = allOrders.stream()
                .filter(o -> "PENDING".equalsIgnoreCase(o.getStatus()))
                .count();

        data.put("totalCustomers", userRepository.count());

        data.put("totalProducts", productRepository.count());

        data.put("totalOrders", allOrders.size());

        data.put("pendingOrders", pendingOrders);

        data.put("revenue", revenue);

        // 5 đơn hàng gần nhất để hiển thị nhanh trên dashboard
        List<Map<String, Object>> recentOrders = allOrders.stream()
                .sorted((a, b) -> {
                    if (a.getCreatedAt() == null || b.getCreatedAt() == null) return 0;
                    return b.getCreatedAt().compareTo(a.getCreatedAt());
                })
                .limit(5)
                .map(o -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("id", o.getId());
                    m.put("orderCode", o.getOrderCode());
                    m.put("receiverName", o.getReceiverName());
                    m.put("totalAmount", o.getTotalAmount());
                    m.put("status", o.getStatus());
                    return m;
                })
                .toList();

        data.put("recentOrders", recentOrders);


        return ResponseEntity.ok(data);

    }


}