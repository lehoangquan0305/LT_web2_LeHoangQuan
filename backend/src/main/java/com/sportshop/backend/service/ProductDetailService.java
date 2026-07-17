package com.sportshop.backend.service;

import com.sportshop.backend.dto.ProductDto;
import com.sportshop.backend.entity.Product;
import com.sportshop.backend.entity.Category;
import com.sportshop.backend.entity.Brand;
import com.sportshop.backend.repository.ProductRepository;
import com.sportshop.backend.repository.CategoryRepository;
import com.sportshop.backend.repository.BrandRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductDetailService {
    
    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final BrandRepository brandRepository;
    
    public List<ProductDto> getAllProducts() {
        return productRepository.findAll()
            .stream()
            .map(this::entityToDto)
            .collect(Collectors.toList());
    }
    
    public ProductDto getProductById(Long id) {
        return productRepository.findById(id)
            .map(this::entityToDto)
            .orElse(null);
    }
    
    public ProductDto createProduct(ProductDto dto) {
        Category category = categoryRepository.findById(dto.getCategoryId())
            .orElseThrow(() -> new RuntimeException("Category not found"));
            
        // VÁ LỖI: Tìm Brand từ Database dựa vào brandId truyền từ React lên
        if (dto.getBrandId() == null) {
            throw new RuntimeException("Brand ID is required");
        }
        Brand brand = brandRepository.findById(dto.getBrandId())
            .orElseThrow(() -> new RuntimeException("Brand not found"));
        
        Product product = Product.builder()
            .name(dto.getName())
            .slug(dto.getSlug())
            .shortDescription(dto.getShortDescription())
            .description(dto.getDescription())
            .price(dto.getPrice())
            .discountPrice(dto.getDiscountPrice())
            .thumbnailUrl(dto.getThumbnailUrl())
            .keywords(dto.getKeywords())
            .weight(dto.getWeight() != null ? dto.getWeight() : 0)
            .viewCount(0L)
            .soldCount(0L)
            .featured(dto.getFeatured() != null ? dto.getFeatured() : false)
            .newArrival(dto.getNewArrival() != null ? dto.getNewArrival() : true)
            .active(dto.getActive() != null ? dto.getActive() : true)
            .category(category)
            .brand(brand) // VÁ LỖI: Gán thực thể brand vừa tìm được vào đây trước khi save
            .build();
        
        Product saved = productRepository.save(product);
        return entityToDto(saved);
    }
    
    public ProductDto updateProduct(Long id, ProductDto dto) {
        return productRepository.findById(id)
            .map(product -> {
                if (dto.getName() != null) product.setName(dto.getName());
                if (dto.getSlug() != null) product.setSlug(dto.getSlug());
                if (dto.getShortDescription() != null) product.setShortDescription(dto.getShortDescription());
                if (dto.getDescription() != null) product.setDescription(dto.getDescription());
                if (dto.getPrice() != null) product.setPrice(dto.getPrice());
                if (dto.getDiscountPrice() != null) product.setDiscountPrice(dto.getDiscountPrice());
                if (dto.getThumbnailUrl() != null) product.setThumbnailUrl(dto.getThumbnailUrl());
                if (dto.getKeywords() != null) product.setKeywords(dto.getKeywords());
                if (dto.getWeight() != null) product.setWeight(dto.getWeight());
                if (dto.getFeatured() != null) product.setFeatured(dto.getFeatured());
                if (dto.getNewArrival() != null) product.setNewArrival(dto.getNewArrival());
                if (dto.getActive() != null) product.setActive(dto.getActive());
                
                if (dto.getCategoryId() != null) {
                    Category category = categoryRepository.findById(dto.getCategoryId())
                        .orElseThrow(() -> new RuntimeException("Category not found"));
                    product.setCategory(category);
                }

                // VÁ LỖI: Cập nhật Brand nếu trong DTO gửi lên có thay đổi brandId mới
                if (dto.getBrandId() != null) {
                    Brand brand = brandRepository.findById(dto.getBrandId())
                        .orElseThrow(() -> new RuntimeException("Brand not found"));
                    product.setBrand(brand);
                }
                
                Product updated = productRepository.save(product);
                return entityToDto(updated);
            })
            .orElse(null);
    }
    
    public boolean deleteProduct(Long id) {
        if (productRepository.existsById(id)) {
            productRepository.deleteById(id);
            return true;
        }
        return false;
    }
    
  private ProductDto entityToDto(Product product) {
    return ProductDto.builder()
        .id(product.getId())
        .name(product.getName())
        .slug(product.getSlug())
        .shortDescription(product.getShortDescription())
        .description(product.getDescription())
        .price(product.getPrice())
        .discountPrice(product.getDiscountPrice())
        .thumbnailUrl(product.getThumbnailUrl())
        .keywords(product.getKeywords())
        .weight(product.getWeight())
        .viewCount(product.getViewCount())
        .soldCount(product.getSoldCount())
        .featured(product.getFeatured())
        .newArrival(product.getNewArrival())
        .active(product.getActive())
        // Kiểm tra an toàn cho Category
        .categoryId(product.getCategory() != null ? product.getCategory().getId() : null)
        .categoryName(product.getCategory() != null ? product.getCategory().getName() : "Không có")
        // KIỂM TRA AN TOÀN CHO BRAND (Sửa đoạn này để hết lỗi 500)
        .brandId(product.getBrand() != null ? product.getBrand().getId() : null)
        .brandName(product.getBrand() != null ? product.getBrand().getName() : "Không có")
        .build();
}
}