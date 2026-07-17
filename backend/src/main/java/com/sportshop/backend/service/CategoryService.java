package com.sportshop.backend.service;

import com.sportshop.backend.dto.CategoryDto;
import com.sportshop.backend.entity.Category;
import com.sportshop.backend.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryService {
    
    private final CategoryRepository categoryRepository;
    
    public List<CategoryDto> getAllCategories() {
        return categoryRepository.findAll()
            .stream()
            .map(this::entityToDto)
            .collect(Collectors.toList());
    }
    
    public CategoryDto getCategoryById(Long id) {
        return categoryRepository.findById(id)
            .map(this::entityToDto)
            .orElse(null);
    }
    
    public CategoryDto createCategory(CategoryDto dto) {
        Category category = Category.builder()
            .name(dto.getName())
            .slug(dto.getSlug())
            .description(dto.getDescription())
            .imageUrl(dto.getImageUrl())
            .active(dto.getActive() != null ? dto.getActive() : true)
            .build();
        
        Category saved = categoryRepository.save(category);
        return entityToDto(saved);
    }
    
    public CategoryDto updateCategory(Long id, CategoryDto dto) {
        return categoryRepository.findById(id)
            .map(category -> {
                if (dto.getName() != null) category.setName(dto.getName());
                if (dto.getSlug() != null) category.setSlug(dto.getSlug());
                if (dto.getDescription() != null) category.setDescription(dto.getDescription());
                if (dto.getImageUrl() != null) category.setImageUrl(dto.getImageUrl());
                if (dto.getActive() != null) category.setActive(dto.getActive());
                
                Category updated = categoryRepository.save(category);
                return entityToDto(updated);
            })
            .orElse(null);
    }
    
    public boolean deleteCategory(Long id) {
        if (categoryRepository.existsById(id)) {
            categoryRepository.deleteById(id);
            return true;
        }
        return false;
    }
    
    private CategoryDto entityToDto(Category category) {
        return CategoryDto.builder()
            .id(category.getId())
            .name(category.getName())
            .slug(category.getSlug())
            .description(category.getDescription())
            .imageUrl(category.getImageUrl())
            .active(category.getActive())
            .build();
    }
}
