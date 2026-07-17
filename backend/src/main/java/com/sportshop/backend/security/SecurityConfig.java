package com.sportshop.backend.security;


import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import org.springframework.web.cors.*;

import java.util.List;


@Configuration
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;


    @Bean
    PasswordEncoder passwordEncoder(){
        return new BCryptPasswordEncoder();
    }



    @Bean
    SecurityFilterChain securityFilterChain(
            HttpSecurity http
    ) throws Exception {


        http
            .csrf(csrf -> csrf.disable())

            .cors(cors -> cors.configurationSource(corsConfigurationSource()))

            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

            .authorizeHttpRequests(auth -> auth

                    // Public: admin login, health-check
                    .requestMatchers(
                            "/api/admin/login",
                            "/api/admin/test"
                    )
                    .permitAll()

                    // Các endpoint quản trị còn lại bắt buộc phải có JWT hợp lệ
                    .requestMatchers("/api/admin/**")
                    .authenticated()

                    // Auth khách hàng: đăng ký / đăng nhập luôn public
                    .requestMatchers(
                            "/api/auth/login",
                            "/api/auth/register"
                    )
                    .permitAll()

                    // Các endpoint auth còn lại (vd: /api/auth/me) cần đăng nhập
                    .requestMatchers("/api/auth/**")
                    .authenticated()

                    // Danh mục sản phẩm công khai (xem không cần đăng nhập)
                    .requestMatchers(HttpMethod.GET,
                            "/api/products/**",
                            "/api/categories/**",
                            "/api/brands/**",
                            "/api/banners/**",
                            "/api/reviews/product/**"
                    )
                    .permitAll()

                    // Kiểm tra mã giảm giá không cần đăng nhập (hiển thị ưu đãi)
                    .requestMatchers(HttpMethod.POST, "/api/coupons/validate")
                    .permitAll()

                    // Giỏ hàng, wishlist, địa chỉ, đơn hàng, đánh giá -> phải đăng nhập
                    .requestMatchers(
                            "/api/cart/**",
                            "/api/wishlist/**",
                            "/api/addresses/**",
                            "/api/orders/**",
                            "/api/reviews/**"
                    )
                    .authenticated()

                    .anyRequest()
                    .permitAll()
            )

            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);


        return http.build();

    }




    @Bean
    CorsConfigurationSource corsConfigurationSource(){

        CorsConfiguration config = new CorsConfiguration();

        config.setAllowedOrigins(
                List.of("http://localhost:3000", "http://localhost:5173")
        );

        config.setAllowedMethods(
                List.of(
                    "GET",
                    "POST",
                    "PUT",
                    "DELETE",
                    "OPTIONS"
                )
        );

        config.setAllowedHeaders(
                List.of("*")
        );


        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();


        source.registerCorsConfiguration(
                "/**",
                config
        );


        return source;
    }

}