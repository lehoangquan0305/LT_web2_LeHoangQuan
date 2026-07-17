package com.sportshop.backend.service;

import com.sportshop.backend.dto.*;
import com.sportshop.backend.entity.*;
import com.sportshop.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Quản lý sản phẩm đầy đủ cho trang admin: sản phẩm + biến thể (màu sắc,
 * giá riêng) + size/tồn kho theo từng biến thể + ảnh theo từng biến thể +
 * thông số kỹ thuật (attributes). Mỗi lần lưu sẽ thay thế toàn bộ danh sách
 * biến thể/size/ảnh/thông số bằng dữ liệu mới nhất từ form - đơn giản và
 * đủ an toàn với quy mô đồ án (cascade + orphanRemoval đã được cấu hình
 * sẵn trên entity nên xoá bản ghi cũ diễn ra tự động khi save).
 */
@Service
@RequiredArgsConstructor
public class AdminProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final BrandRepository brandRepository;
    private final ColorRepository colorRepository;
    private final ProductAttributeRepository productAttributeRepository;

    @Transactional(readOnly = true)
    public ProductDetailDto getFullProduct(Long id) {
        return productRepository.findById(id).map(this::toDetailDto).orElse(null);
    }

    @Transactional
    public ProductDetailDto createProduct(ProductDetailDto dto) {
        Product product = new Product();
        applyBaseFields(product, dto);
        product.setViewCount(0L);
        product.setSoldCount(0L);

        Product saved = productRepository.save(product);
        syncVariants(saved, dto.getVariants());
        syncAttributes(saved, dto.getAttributes());

        return toDetailDto(productRepository.findById(saved.getId()).orElseThrow());
    }

    @Transactional
    public ProductDetailDto updateProduct(Long id, ProductDetailDto dto) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm"));

        applyBaseFields(product, dto);
        Product saved = productRepository.save(product);

        syncVariants(saved, dto.getVariants());
        syncAttributes(saved, dto.getAttributes());

        return toDetailDto(productRepository.findById(saved.getId()).orElseThrow());
    }

    private void applyBaseFields(Product product, ProductDetailDto dto) {
        if (dto.getName() == null || dto.getName().isBlank()) {
            throw new RuntimeException("Tên sản phẩm không được để trống");
        }
        if (dto.getCategoryId() == null) {
            throw new RuntimeException("Vui lòng chọn danh mục");
        }
        if (dto.getBrandId() == null) {
            throw new RuntimeException("Vui lòng chọn thương hiệu");
        }

        Category category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy danh mục"));
        Brand brand = brandRepository.findById(dto.getBrandId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thương hiệu"));

        product.setName(dto.getName());
        product.setSlug(dto.getSlug());
        product.setShortDescription(dto.getShortDescription());
        product.setDescription(dto.getDescription());
        product.setPrice(dto.getPrice());
        product.setDiscountPrice(dto.getDiscountPrice());
        product.setThumbnailUrl(dto.getThumbnailUrl());
        product.setFeatured(dto.getFeatured() != null ? dto.getFeatured() : false);
        product.setNewArrival(dto.getNewArrival() != null ? dto.getNewArrival() : true);
        product.setActive(dto.getActive() != null ? dto.getActive() : true);
        product.setCategory(category);
        product.setBrand(brand);
    }

    private void syncVariants(Product product, List<ProductVariantDto> variantDtos) {
        // Xoá hết biến thể cũ (cascade sẽ tự xoá size/ảnh con nhờ orphanRemoval)
        product.getVariants().clear();
        productRepository.save(product);

        if (variantDtos == null) return;

        for (ProductVariantDto vDto : variantDtos) {
            Color color = null;
            if (vDto.getColorId() != null) {
                color = colorRepository.findById(vDto.getColorId())
                        .orElseThrow(() -> new RuntimeException("Không tìm thấy màu sắc đã chọn"));
            }

            ProductVariant variant = ProductVariant.builder()
                    .product(product)
                    .color(color)
                    .sku(vDto.getSku())
                    .price(vDto.getPrice() != null ? vDto.getPrice() : product.getPrice())
                    .discountPrice(vDto.getDiscountPrice())
                    .imageUrl(vDto.getImageUrl())
                    .active(true)
                    .build();

            if (vDto.getSizes() != null) {
                for (ProductSizeDto sDto : vDto.getSizes()) {
                    variant.getSizes().add(ProductSize.builder()
                            .variant(variant)
                            .size(sDto.getSize())
                            .stock(sDto.getStock() != null ? sDto.getStock() : 0)
                            .active(true)
                            .build());
                }
            }

            if (vDto.getImages() != null) {
                int order = 0;
                for (ProductImageDto iDto : vDto.getImages()) {
                    variant.getImages().add(ProductImage.builder()
                            .variant(variant)
                            .imageUrl(iDto.getImageUrl())
                            .displayOrder(iDto.getDisplayOrder() != null ? iDto.getDisplayOrder() : order++)
                            .active(true)
                            .build());
                }
            }

            product.getVariants().add(variant);
        }

        productRepository.save(product);
    }

    private void syncAttributes(Product product, List<ProductAttributeDto> attributeDtos) {
        List<ProductAttribute> existing = productAttributeRepository.findByProductId(product.getId());
        productAttributeRepository.deleteAll(existing);

        if (attributeDtos == null) return;

        for (ProductAttributeDto aDto : attributeDtos) {
            if (aDto.getAttributeName() == null || aDto.getAttributeName().isBlank()) continue;
            productAttributeRepository.save(ProductAttribute.builder()
                    .product(product)
                    .attributeName(aDto.getAttributeName())
                    .attributeValue(aDto.getAttributeValue())
                    .build());
        }
    }

    private ProductDetailDto toDetailDto(Product p) {
        List<ProductAttributeDto> attributeDtos = productAttributeRepository.findByProductId(p.getId())
                .stream()
                .map(a -> ProductAttributeDto.builder()
                        .id(a.getId())
                        .attributeName(a.getAttributeName())
                        .attributeValue(a.getAttributeValue())
                        .build())
                .collect(Collectors.toList());

        List<ProductVariantDto> variantDtos = p.getVariants().stream()
                .map(this::toVariantDto)
                .collect(Collectors.toList());

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
                        .sorted(Comparator.comparing(img -> img.getDisplayOrder() == null ? 0 : img.getDisplayOrder()))
                        .map(img -> ProductImageDto.builder()
                                .id(img.getId())
                                .imageUrl(img.getImageUrl())
                                .displayOrder(img.getDisplayOrder())
                                .build())
                        .collect(Collectors.toList()))
                .sizes(v.getSizes().stream()
                        .map(s -> ProductSizeDto.builder()
                                .id(s.getId())
                                .size(s.getSize())
                                .stock(s.getStock())
                                .build())
                        .collect(Collectors.toList()))
                .build();
    }
}
