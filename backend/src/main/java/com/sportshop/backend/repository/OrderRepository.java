package com.sportshop.backend.repository;

import com.sportshop.backend.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderRepository 
        extends JpaRepository<Order, Long> {

}