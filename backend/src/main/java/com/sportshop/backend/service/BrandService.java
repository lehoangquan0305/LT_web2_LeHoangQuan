package com.sportshop.backend.service;

import com.sportshop.backend.dto.BrandDto;
import com.sportshop.backend.entity.Brand;
import com.sportshop.backend.repository.BrandRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BrandService {
    
    private final BrandRepository brandRepository;
    
    public List<BrandDto> getAllBrands() {
        return brandRepository.findAll()
            .stream()
            .map(this::entityToDto)
            .collect(Collectors.toList());
    }
    
    public BrandDto getBrandById(Long id) {
        return brandRepository.findById(id)
            .map(this::entityToDto)
            .orElse(null);
    }
    
    public BrandDto createBrand(BrandDto dto) {
        Brand brand = Brand.builder()
            .name(dto.getName())
            .slug(dto.getSlug())
            .description(dto.getDescription())
            .logoUrl(dto.getLogoUrl())
            .active(dto.getActive() != null ? dto.getActive() : true)
            .build();
        
        Brand saved = brandRepository.save(brand);
        return entityToDto(saved);
    }
    
    public BrandDto updateBrand(Long id, BrandDto dto) {
        return brandRepository.findById(id)
            .map(brand -> {
                if (dto.getName() != null) brand.setName(dto.getName());
                if (dto.getSlug() != null) brand.setSlug(dto.getSlug());
                if (dto.getDescription() != null) brand.setDescription(dto.getDescription());
                if (dto.getLogoUrl() != null) brand.setLogoUrl(dto.getLogoUrl());
                if (dto.getActive() != null) brand.setActive(dto.getActive());
                
                Brand updated = brandRepository.save(brand);
                return entityToDto(updated);
            })
            .orElse(null);
    }
    
    public boolean deleteBrand(Long id) {
        if (brandRepository.existsById(id)) {
            brandRepository.deleteById(id);
            return true;
        }
        return false;
    }
    
    private BrandDto entityToDto(Brand brand) {
        return BrandDto.builder()
            .id(brand.getId())
            .name(brand.getName())
            .slug(brand.getSlug())
            .description(brand.getDescription())
            .logoUrl(brand.getLogoUrl())
            .active(brand.getActive())
            .build();
    }
}
