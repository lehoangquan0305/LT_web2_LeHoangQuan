package com.sportshop.backend.service;

import com.sportshop.backend.dto.*;
import com.sportshop.backend.entity.Product;
import com.sportshop.backend.entity.ProductAttribute;
import com.sportshop.backend.entity.ProductVariant;
import com.sportshop.backend.entity.Review;
import com.sportshop.backend.repository.ProductAttributeRepository;
import com.sportshop.backend.repository.ProductRepository;
import com.sportshop.backend.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PublicProductService {

    private final ProductRepository productRepository;
    private final ReviewRepository reviewRepository;
    private final ProductAttributeRepository productAttributeRepository;

    /**
     * Danh sách sản phẩm công khai, hỗ trợ lọc theo danh mục, thương hiệu,
     * từ khóa, khoảng giá và sắp xếp cơ bản. Vì dữ liệu không quá lớn ở quy mô
     * đồ án nên xử lý lọc/sắp xếp trên tầng service cho đơn giản, dễ bảo trì.
     */
    @Transactional(readOnly = true)
    public List<ProductDto> searchProducts(
            Long categoryId, Long brandId, String keyword,
            Double minPrice, Double maxPrice,
            Boolean featured, Boolean newArrival,
            String sort
    ) {
        List<Product> products = productRepository.findAll().stream()
                .filter(p -> Boolean.TRUE.equals(p.getActive()))
                .filter(p -> categoryId == null || (p.getCategory() != null && categoryId.equals(p.getCategory().getId())))
                .filter(p -> brandId == null || (p.getBrand() != null && brandId.equals(p.getBrand().getId())))
                .filter(p -> keyword == null || keyword.isBlank() ||
                        p.getName().toLowerCase().contains(keyword.toLowerCase()))
                .filter(p -> minPrice == null || effectivePrice(p).doubleValue() >= minPrice)
                .filter(p -> maxPrice == null || effectivePrice(p).doubleValue() <= maxPrice)
                .filter(p -> featured == null || featured.equals(p.getFeatured()))
                .filter(p -> newArrival == null || newArrival.equals(p.getNewArrival()))
                .collect(Collectors.toList());

        if (sort != null) {
            switch (sort) {
                case "price_asc" -> products.sort(Comparator.comparing(this::effectivePrice));
                case "price_desc" -> products.sort(Comparator.comparing(this::effectivePrice).reversed());
                case "newest" -> products.sort(Comparator.comparing(Product::getCreatedAt).reversed());
                case "best_selling" -> products.sort(Comparator.comparing(Product::getSoldCount).reversed());
                default -> { /* mặc định giữ nguyên thứ tự */ }
            }
        }

        return products.stream().map(this::toListDto).collect(Collectors.toList());
    }

    @Transactional
    public ProductDetailDto getBySlug(String slug) {
        Product product = productRepository.findAll().stream()
                .filter(p -> slug.equals(p.getSlug()))
                .findFirst()
                .orElse(null);
        if (product == null) return null;

        // Tăng lượt xem
        product.setViewCount((product.getViewCount() == null ? 0 : product.getViewCount()) + 1);
        productRepository.save(product);

        return toDetailDto(product);
    }

    @Transactional(readOnly = true)
    public ProductDetailDto getById(Long id) {
        return productRepository.findById(id).map(this::toDetailDto).orElse(null);
    }

    private java.math.BigDecimal effectivePrice(Product p) {
        return p.getDiscountPrice() != null ? p.getDiscountPrice() : p.getPrice();
    }

    private ProductDto toListDto(Product p) {
        return ProductDto.builder()
                .id(p.getId())
                .name(p.getName())
                .slug(p.getSlug())
                .shortDescription(p.getShortDescription())
                .price(p.getPrice())
                .discountPrice(p.getDiscountPrice())
                .thumbnailUrl(p.getThumbnailUrl())
                .viewCount(p.getViewCount())
                .soldCount(p.getSoldCount())
                .featured(p.getFeatured())
                .newArrival(p.getNewArrival())
                .active(p.getActive())
                .categoryId(p.getCategory() != null ? p.getCategory().getId() : null)
                .categoryName(p.getCategory() != null ? p.getCategory().getName() : null)
                .brandId(p.getBrand() != null ? p.getBrand().getId() : null)
                .brandName(p.getBrand() != null ? p.getBrand().getName() : null)
                .build();
    }

    private ProductDetailDto toDetailDto(Product p) {
        List<Review> reviews = reviewRepository.findAll().stream()
                .filter(r -> r.getProduct() != null && r.getProduct().getId().equals(p.getId()))
                .filter(r -> Boolean.TRUE.equals(r.getApproved()))
                .toList();

        double avgRating = reviews.isEmpty() ? 0.0 :
                reviews.stream().mapToInt(Review::getRating).average().orElse(0.0);

        List<ProductVariantDto> variantDtos = p.getVariants().stream()
                .filter(v -> Boolean.TRUE.equals(v.getActive()))
                .map(this::toVariantDto)
                .collect(Collectors.toList());

        List<ProductAttributeDto> attributeDtos = productAttributeRepository.findByProductId(p.getId())
                .stream().map(this::toAttributeDto).collect(Collectors.toList());

        return ProductDetailDto.builder()
                .id(p.getId())
                .name(p.getName())
                .slug(p.getSlug())
                .shortDescription(p.getShortDescription())
                .description(p.getDescription())
                .price(p.getPrice())
                .discountPrice(p.getDiscountPrice())
                .thumbnailUrl(p.getThumbnailUrl())
                .viewCount(p.getViewCount())
                .soldCount(p.getSoldCount())
                .featured(p.getFeatured())
                .newArrival(p.getNewArrival())
                .active(p.getActive())
                .categoryId(p.getCategory() != null ? p.getCategory().getId() : null)
                .categoryName(p.getCategory() != null ? p.getCategory().getName() : null)
                .brandId(p.getBrand() != null ? p.getBrand().getId() : null)
                .brandName(p.getBrand() != null ? p.getBrand().getName() : null)
                .averageRating(Math.round(avgRating * 10.0) / 10.0)
                .reviewCount(reviews.size())
                .variants(variantDtos)
                .attributes(attributeDtos)
                .build();
    }

    private ProductVariantDto toVariantDto(ProductVariant v) {
        return ProductVariantDto.builder()
                .id(v.getId())
                .sku(v.getSku())
                .price(v.getPrice())
                .discountPrice(v.getDiscountPrice())
                .imageUrl(v.getImageUrl())
                .colorId(v.getColor() != null ? v.getColor().getId() : null)
                .colorName(v.getColor() != null ? v.getColor().getName() : null)
                .colorCode(v.getColor() != null ? v.getColor().getCode() : null)
                .images(v.getImages().stream()
                        .filter(img -> Boolean.TRUE.equals(img.getActive()))
                        .sorted(Comparator.comparing(img -> img.getDisplayOrder() == null ? 0 : img.getDisplayOrder()))
                        .map(img -> ProductImageDto.builder()
                                .id(img.getId())
                                .imageUrl(img.getImageUrl())
                                .displayOrder(img.getDisplayOrder())
                                .build())
                        .collect(Collectors.toList()))
                .sizes(v.getSizes().stream()
                        .filter(s -> Boolean.TRUE.equals(s.getActive()))
                        .map(s -> ProductSizeDto.builder()
                                .id(s.getId())
                                .size(s.getSize())
                                .stock(s.getStock())
                                .build())
                        .collect(Collectors.toList()))
                .build();
    }

    private ProductAttributeDto toAttributeDto(ProductAttribute a) {
        return ProductAttributeDto.builder()
                .id(a.getId())
                .attributeName(a.getAttributeName())
                .attributeValue(a.getAttributeValue())
                .build();
    }
}
