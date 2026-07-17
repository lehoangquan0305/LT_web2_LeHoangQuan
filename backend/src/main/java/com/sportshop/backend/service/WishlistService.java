package com.sportshop.backend.service;

import com.sportshop.backend.dto.WishlistDto;
import com.sportshop.backend.entity.Product;
import com.sportshop.backend.entity.User;
import com.sportshop.backend.entity.Wishlist;
import com.sportshop.backend.repository.ProductRepository;
import com.sportshop.backend.repository.WishlistRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WishlistService {

    private final WishlistRepository wishlistRepository;
    private final ProductRepository productRepository;

    @Transactional(readOnly = true)
    public List<WishlistDto> getWishlist(User user) {
        return wishlistRepository.findByUserId(user.getId())
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public WishlistDto addToWishlist(User user, Long productId) {
        if (wishlistRepository.existsByUserIdAndProductId(user.getId(), productId)) {
            return wishlistRepository.findByUserIdAndProductId(user.getId(), productId)
                    .map(this::toDto).orElse(null);
        }

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm"));

        Wishlist wishlist = Wishlist.builder().user(user).product(product).build();
        return toDto(wishlistRepository.save(wishlist));
    }

    @Transactional
    public void removeFromWishlist(User user, Long productId) {
        wishlistRepository.deleteByUserIdAndProductId(user.getId(), productId);
    }

    private WishlistDto toDto(Wishlist w) {
        Product p = w.getProduct();
        return WishlistDto.builder()
                .id(w.getId())
                .productId(p.getId())
                .productName(p.getName())
                .productSlug(p.getSlug())
                .thumbnailUrl(p.getThumbnailUrl())
                .price(p.getPrice())
                .discountPrice(p.getDiscountPrice())
                .build();
    }
}
