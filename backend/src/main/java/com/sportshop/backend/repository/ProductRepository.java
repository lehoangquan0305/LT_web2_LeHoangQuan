package com.sportshop.backend.repository;

import com.sportshop.backend.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductRepository 
        extends JpaRepository<Product, Long> {

}