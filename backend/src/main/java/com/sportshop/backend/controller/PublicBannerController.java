package com.sportshop.backend.controller;

import com.sportshop.backend.entity.Banner;
import com.sportshop.backend.repository.BannerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Comparator;
import java.util.List;
import java.util.Map;

/** Banner công khai - hiển thị trên trang chủ storefront. */
@RestController
@RequestMapping("/api/banners")
@RequiredArgsConstructor
public class PublicBannerController {

    private final BannerRepository bannerRepository;

    @GetMapping
    public ResponseEntity<?> getActiveBanners() {
        try {
            List<Banner> banners = bannerRepository.findAll().stream()
                    .filter(b -> Boolean.TRUE.equals(b.getActive()))
                    .sorted(Comparator.comparing(b -> b.getDisplayOrder() == null ? 0 : b.getDisplayOrder()))
                    .toList();
            return ResponseEntity.ok(Map.of("success", true, "data", banners));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("success", false, "message", e.getMessage()));
        }
    }
}
