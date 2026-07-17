package com.sportshop.backend.repository;

import com.sportshop.backend.entity.ProductSize;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProductSizeRepository extends JpaRepository<ProductSize, Long> {
    List<ProductSize> findByVariantId(Long variantId);
}
