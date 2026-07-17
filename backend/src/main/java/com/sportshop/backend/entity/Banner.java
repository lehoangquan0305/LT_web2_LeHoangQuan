package com.sportshop.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;


@Entity
@Table(name = "banners")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Banner extends BaseEntity {


    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    @Column(nullable = false,length = 255)
    private String title;


    @Column(length = 500)
    private String description;


    @Column(nullable = false)
    private String imageUrl;


    private String linkUrl;


    @Builder.Default
    private Integer displayOrder = 0;


    private LocalDateTime startDate;


    private LocalDateTime endDate;


    @Builder.Default
    private Boolean active = true;

}