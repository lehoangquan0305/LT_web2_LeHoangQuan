package com.sportshop.backend.service;

import com.sportshop.backend.dto.ReviewDto;
import com.sportshop.backend.entity.Order;
import com.sportshop.backend.entity.Product;
import com.sportshop.backend.entity.Review;
import com.sportshop.backend.entity.User;
import com.sportshop.backend.repository.OrderRepository;
import com.sportshop.backend.repository.ProductRepository;
import com.sportshop.backend.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;

    @Transactional(readOnly = true)
    public List<ReviewDto> getApprovedReviewsForProduct(Long productId) {
        return reviewRepository.findAll().stream()
                .filter(r -> r.getProduct() != null && r.getProduct().getId().equals(productId))
                .filter(r -> Boolean.TRUE.equals(r.getApproved()))
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .map(this::entityToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public ReviewDto submitReview(User user, Long productId, Integer rating, String comment) {
        if (rating == null || rating < 1 || rating > 5) {
            throw new RuntimeException("Số sao đánh giá phải từ 1 đến 5");
        }

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm"));

        boolean alreadyReviewed = reviewRepository.findAll().stream()
                .anyMatch(r -> r.getUser() != null && r.getUser().getId().equals(user.getId())
                        && r.getProduct() != null && r.getProduct().getId().equals(productId));
        if (alreadyReviewed) {
            throw new RuntimeException("Bạn đã đánh giá sản phẩm này rồi");
        }

        // Kiểm tra khách hàng đã từng mua sản phẩm này chưa (đơn hàng đã hoàn thành)
        boolean verifiedPurchase = orderRepository.findAll().stream()
                .filter(o -> o.getUser() != null && o.getUser().getId().equals(user.getId()))
                .filter(o -> "COMPLETED".equalsIgnoreCase(o.getStatus()) || "DELIVERED".equalsIgnoreCase(o.getStatus()))
                .flatMap(o -> o.getOrderItems().stream())
                .anyMatch(item -> item.getProductSize() != null
                        && item.getProductSize().getVariant() != null
                        && item.getProductSize().getVariant().getProduct() != null
                        && item.getProductSize().getVariant().getProduct().getId().equals(productId));

        Review review = Review.builder()
                .user(user)
                .product(product)
                .rating(rating)
                .comment(comment)
                .approved(false)
                .verifiedPurchase(verifiedPurchase)
                .build();

        return entityToDto(reviewRepository.save(review));
    }

    public List<ReviewDto> getAllReviews() {
        return reviewRepository.findAll()
                .stream()
                .map(this::entityToDto)
                .collect(Collectors.toList());
    }

    public ReviewDto getReviewById(Long id) {
        return reviewRepository.findById(id)
                .map(this::entityToDto)
                .orElse(null);
    }

    public ReviewDto setApproved(Long id, boolean approved) {
        return reviewRepository.findById(id)
                .map(review -> {
                    review.setApproved(approved);
                    return entityToDto(reviewRepository.save(review));
                })
                .orElse(null);
    }

    public ReviewDto replyToReview(Long id, String adminReply) {
        return reviewRepository.findById(id)
                .map(review -> {
                    review.setAdminReply(adminReply);
                    return entityToDto(reviewRepository.save(review));
                })
                .orElse(null);
    }

    public boolean deleteReview(Long id) {
        if (reviewRepository.existsById(id)) {
            reviewRepository.deleteById(id);
            return true;
        }
        return false;
    }

    private ReviewDto entityToDto(Review review) {
        return ReviewDto.builder()
                .id(review.getId())
                .rating(review.getRating())
                .comment(review.getComment())
                .approved(review.getApproved())
                .verifiedPurchase(review.getVerifiedPurchase())
                .adminReply(review.getAdminReply())
                .userId(review.getUser() != null ? review.getUser().getId() : null)
                .userName(review.getUser() != null ? review.getUser().getFullName() : null)
                .productId(review.getProduct() != null ? review.getProduct().getId() : null)
                .productName(review.getProduct() != null ? review.getProduct().getName() : null)
                .createdAt(review.getCreatedAt())
                .build();
    }
}
