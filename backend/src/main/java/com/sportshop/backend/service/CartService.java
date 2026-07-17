package com.sportshop.backend.service;

import com.sportshop.backend.dto.CartDto;
import com.sportshop.backend.dto.CartItemDto;
import com.sportshop.backend.entity.*;
import com.sportshop.backend.repository.CartItemRepository;
import com.sportshop.backend.repository.CartRepository;
import com.sportshop.backend.repository.ProductSizeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductSizeRepository productSizeRepository;

    @Transactional
    public CartDto getOrCreateCart(User user) {
        Cart cart = cartRepository.findByUserId(user.getId())
                .orElseGet(() -> cartRepository.save(Cart.builder().user(user).build()));
        return toDto(cart);
    }

    @Transactional
    public CartDto addItem(User user, Long productSizeId, Integer quantity) {
        Cart cart = cartRepository.findByUserId(user.getId())
                .orElseGet(() -> cartRepository.save(Cart.builder().user(user).build()));

        ProductSize size = productSizeRepository.findById(productSizeId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy size sản phẩm"));

        if (quantity == null || quantity < 1) quantity = 1;

        if (size.getStock() != null && size.getStock() < quantity) {
            throw new RuntimeException("Sản phẩm không đủ số lượng trong kho (còn " + size.getStock() + ")");
        }

        CartItem item = cartItemRepository.findByCartIdAndProductSizeId(cart.getId(), productSizeId)
                .orElse(null);

        if (item != null) {
            item.setQuantity(item.getQuantity() + quantity);
            cartItemRepository.save(item);
        } else {
            item = CartItem.builder().cart(cart).productSize(size).quantity(quantity).build();
            cartItemRepository.save(item);
            // Đồng bộ RAM: Thêm phần tử mới vào List của Cart đối tượng cha
            if (cart.getCartItems() != null) {
                cart.getCartItems().add(item);
            }
        }

        return toDto(cart);
    }

    @Transactional
    public CartDto updateItem(User user, Long cartItemId, Integer quantity) {
        CartItem item = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm trong giỏ hàng"));

        if (!item.getCart().getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Bạn không có quyền với giỏ hàng này");
        }

        Cart cart = item.getCart();

        if (quantity == null || quantity < 1) {
            // Đồng bộ RAM: Xóa liên kết trong list của Cart cha trước khi xóa DB
            if (cart.getCartItems() != null) {
                cart.getCartItems().remove(item);
            }
            cartItemRepository.delete(item);
        } else {
            ProductSize size = item.getProductSize();
            if (size.getStock() != null && size.getStock() < quantity) {
                throw new RuntimeException("Sản phẩm không đủ số lượng trong kho (còn " + size.getStock() + ")");
            }
            item.setQuantity(quantity);
            cartItemRepository.save(item);
        }

        cartRepository.save(cart);
        return toDto(cart);
    }

    @Transactional
    public CartDto removeItem(User user, Long cartItemId) {
        CartItem item = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm trong giỏ hàng"));

        if (!item.getCart().getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Bạn không có quyền với giỏ hàng này");
        }

        Cart cart = item.getCart();
        
        // Đồng bộ RAM: Loại bỏ phần tử khỏi list của Cart cha trước khi xóa DB
        if (cart.getCartItems() != null) {
            cart.getCartItems().remove(item);
        }
        
        cartItemRepository.delete(item);
        cartRepository.save(cart);

        return toDto(cart);
    }

    @Transactional
    public CartDto clearCart(User user) {
        Cart cart = cartRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy giỏ hàng"));
        cart.getCartItems().clear();
        cartRepository.save(cart);
        return toDto(cart);
    }

    private CartDto toDto(Cart cart) {
        List<CartItemDto> itemDtos = cart.getCartItems().stream()
                .map(this::toItemDto)
                .collect(Collectors.toList());

        BigDecimal subtotal = itemDtos.stream()
                .map(CartItemDto::getLineTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        int totalItems = itemDtos.stream().mapToInt(CartItemDto::getQuantity).sum();

        return CartDto.builder()
                .id(cart.getId())
                .items(itemDtos)
                .subtotal(subtotal)
                .totalItems(totalItems)
                .build();
    }

    private CartItemDto toItemDto(CartItem item) {
        ProductSize size = item.getProductSize();
        ProductVariant variant = size.getVariant();
        Product product = variant.getProduct();

        BigDecimal price = variant.getPrice() != null ? variant.getPrice() : product.getPrice();
        BigDecimal discountPrice = variant.getDiscountPrice() != null ? variant.getDiscountPrice() : product.getDiscountPrice();
        BigDecimal effectivePrice = discountPrice != null ? discountPrice : price;
        BigDecimal lineTotal = effectivePrice.multiply(BigDecimal.valueOf(item.getQuantity()));

        return CartItemDto.builder()
                .id(item.getId())
                .quantity(item.getQuantity())
                .productSizeId(size.getId())
                .size(size.getSize())
                .stock(size.getStock())
                .variantId(variant.getId())
                .sku(variant.getSku())
                .imageUrl(variant.getImageUrl() != null ? variant.getImageUrl() : product.getThumbnailUrl())
                .colorId(variant.getColor() != null ? variant.getColor().getId() : null)
                .colorName(variant.getColor() != null ? variant.getColor().getName() : null)
                .productId(product.getId())
                .productName(product.getName())
                .productSlug(product.getSlug())
                .price(price)
                .discountPrice(discountPrice)
                .lineTotal(lineTotal)
                .build();
    }
}