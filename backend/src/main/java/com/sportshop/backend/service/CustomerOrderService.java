package com.sportshop.backend.service;

import com.sportshop.backend.dto.CheckoutRequest;
import com.sportshop.backend.dto.OrderDetailDto;
import com.sportshop.backend.dto.OrderDto;
import com.sportshop.backend.dto.OrderItemDto;
import com.sportshop.backend.entity.*;
import com.sportshop.backend.entity.enums.OrderStatus;
import com.sportshop.backend.entity.enums.PaymentMethod;
import com.sportshop.backend.entity.enums.PaymentStatus;
import com.sportshop.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CustomerOrderService {

    private final CartRepository cartRepository;
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final OrderStatusHistoryRepository orderStatusHistoryRepository;
    private final ProductSizeRepository productSizeRepository;
    private final InventoryHistoryRepository inventoryHistoryRepository;
    private final PaymentRepository paymentRepository;
    private final CouponService couponService;

    private static final BigDecimal FREE_SHIPPING_THRESHOLD = BigDecimal.valueOf(500_000);
    private static final BigDecimal DEFAULT_SHIPPING_FEE = BigDecimal.valueOf(30_000);

    @Transactional
    public OrderDetailDto checkout(User user, CheckoutRequest request) {
        Cart cart = cartRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Giỏ hàng trống"));

        if (cart.getCartItems().isEmpty()) {
            throw new RuntimeException("Giỏ hàng của bạn đang trống");
        }

        if (request.getReceiverName() == null || request.getReceiverName().isBlank()
                || request.getReceiverPhone() == null || request.getReceiverPhone().isBlank()
                || request.getShippingAddress() == null || request.getShippingAddress().isBlank()) {
            throw new RuntimeException("Vui lòng nhập đầy đủ thông tin nhận hàng");
        }

        // 1. Kiểm tra tồn kho cho toàn bộ sản phẩm trong giỏ trước khi trừ kho
        for (CartItem item : cart.getCartItems()) {
            ProductSize size = item.getProductSize();
            if (size.getStock() == null || size.getStock() < item.getQuantity()) {
                throw new RuntimeException(
                        "Sản phẩm \"" + size.getVariant().getProduct().getName() + "\" (size " + size.getSize()
                                + ") không đủ hàng trong kho"
                );
            }
        }

        // 2. Tính tiền hàng
        BigDecimal subtotal = cart.getCartItems().stream()
                .map(this::effectiveLinePrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // 3. Áp mã giảm giá (nếu có)
        BigDecimal discountAmount = BigDecimal.ZERO;
        Coupon appliedCoupon = null;
        if (request.getCouponCode() != null && !request.getCouponCode().isBlank()) {
            CouponService.CouponResult result = couponService.validate(request.getCouponCode(), subtotal);
            if (!result.valid) {
                throw new RuntimeException(result.message);
            }
            discountAmount = result.discountAmount;
            appliedCoupon = result.coupon;
        }

        // 4. Phí vận chuyển
        BigDecimal shippingFee = subtotal.compareTo(FREE_SHIPPING_THRESHOLD) >= 0 ? BigDecimal.ZERO : DEFAULT_SHIPPING_FEE;

        BigDecimal totalAmount = subtotal.subtract(discountAmount).add(shippingFee);
        if (totalAmount.compareTo(BigDecimal.ZERO) < 0) totalAmount = BigDecimal.ZERO;

        // 5. Tạo đơn hàng
        Order order = Order.builder()
                .orderCode(generateOrderCode())
                .subtotal(subtotal)
                .discountAmount(discountAmount)
                .shippingFee(shippingFee)
                .totalAmount(totalAmount)
                .status(OrderStatus.PENDING.name())
                .receiverName(request.getReceiverName())
                .receiverPhone(request.getReceiverPhone())
                .shippingAddress(request.getShippingAddress())
                .note(request.getNote())
                .user(user)
                .build();

        order = orderRepository.save(order);

        // 6. Snapshot từng dòng sản phẩm + trừ kho + ghi lịch sử kho
        for (CartItem item : cart.getCartItems()) {
            ProductSize size = item.getProductSize();
            ProductVariant variant = size.getVariant();
            Product product = variant.getProduct();

            BigDecimal unitPrice = effectiveUnitPrice(variant, product);
            BigDecimal totalPrice = unitPrice.multiply(BigDecimal.valueOf(item.getQuantity()));

            OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .productSize(size)
                    .productName(product.getName())
                    .sku(variant.getSku())
                    .color(variant.getColor() != null ? variant.getColor().getName() : "")
                    .size(size.getSize())
                    .thumbnailUrl(variant.getImageUrl() != null ? variant.getImageUrl() : product.getThumbnailUrl())
                    .unitPrice(unitPrice)
                    .quantity(item.getQuantity())
                    .totalPrice(totalPrice)
                    .build();
            orderItemRepository.save(orderItem);

            // Trừ kho
            size.setStock(size.getStock() - item.getQuantity());
            productSizeRepository.save(size);

            inventoryHistoryRepository.save(InventoryHistory.builder()
                    .productSize(size)
                    .quantity(-item.getQuantity())
                    .type("ORDER")
                    .note("Trừ kho cho đơn hàng " + order.getOrderCode())
                    .build());

            // Tăng số lượng đã bán
            product.setSoldCount((product.getSoldCount() == null ? 0 : product.getSoldCount()) + item.getQuantity());
        }

        // 7. Lịch sử trạng thái đơn hàng
        orderStatusHistoryRepository.save(OrderStatusHistory.builder()
                .order(order)
                .status(OrderStatus.PENDING)
                .note("Đơn hàng được tạo")
                .changedBy("CUSTOMER")
                .build());

        // 8. Tạo bản ghi thanh toán
        PaymentMethod method;
        try {
            method = PaymentMethod.valueOf(
                    request.getPaymentMethod() != null ? request.getPaymentMethod().toUpperCase() : "CASH");
        } catch (IllegalArgumentException e) {
            method = PaymentMethod.CASH;
        }

        paymentRepository.save(Payment.builder()
                .order(order)
                .amount(totalAmount)
                .paymentMethod(method)
                .paymentStatus(method == PaymentMethod.CASH ? PaymentStatus.UNPAID : PaymentStatus.PENDING)
                .paymentDescription("Thanh toán cho đơn hàng " + order.getOrderCode())
                .build());

        // 9. Cộng lượt dùng coupon
        if (appliedCoupon != null) {
            couponService.incrementUsage(appliedCoupon);
        }

        // 10. Xóa giỏ hàng
        cart.getCartItems().clear();
        cartRepository.save(cart);

        return toDetailDto(order);
    }

    @Transactional(readOnly = true)
    public List<OrderDto> getMyOrders(User user) {
        return orderRepository.findAll().stream()
                .filter(o -> o.getUser() != null && o.getUser().getId().equals(user.getId()))
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public OrderDetailDto getMyOrderDetail(User user, Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng"));

        if (order.getUser() == null || !order.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Bạn không có quyền xem đơn hàng này");
        }

        return toDetailDto(order);
    }

    @Transactional
    public OrderDetailDto cancelMyOrder(User user, Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng"));

        if (order.getUser() == null || !order.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Bạn không có quyền huỷ đơn hàng này");
        }

        if (!OrderStatus.PENDING.name().equals(order.getStatus())) {
            throw new RuntimeException("Chỉ có thể huỷ đơn hàng khi đang ở trạng thái chờ xử lý");
        }

        order.setStatus(OrderStatus.CANCELLED.name());
        orderRepository.save(order);

        orderStatusHistoryRepository.save(OrderStatusHistory.builder()
                .order(order)
                .status(OrderStatus.CANCELLED)
                .note("Khách hàng huỷ đơn")
                .changedBy("CUSTOMER")
                .build());

        // Hoàn lại kho
        List<OrderItem> items = orderItemRepository.findByOrderId(order.getId());
        for (OrderItem item : items) {
            ProductSize size = item.getProductSize();
            size.setStock(size.getStock() + item.getQuantity());
            productSizeRepository.save(size);

            inventoryHistoryRepository.save(InventoryHistory.builder()
                    .productSize(size)
                    .quantity(item.getQuantity())
                    .type("CANCEL")
                    .note("Hoàn kho do huỷ đơn " + order.getOrderCode())
                    .build());
        }

        return toDetailDto(order);
    }

    private BigDecimal effectiveUnitPrice(ProductVariant variant, Product product) {
        BigDecimal price = variant.getPrice() != null ? variant.getPrice() : product.getPrice();
        BigDecimal discountPrice = variant.getDiscountPrice() != null ? variant.getDiscountPrice() : product.getDiscountPrice();
        return discountPrice != null ? discountPrice : price;
    }

    private BigDecimal effectiveLinePrice(CartItem item) {
        ProductVariant variant = item.getProductSize().getVariant();
        Product product = variant.getProduct();
        return effectiveUnitPrice(variant, product).multiply(BigDecimal.valueOf(item.getQuantity()));
    }

    private String generateOrderCode() {
        String stamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyMMddHHmmss"));
        return "DH" + stamp;
    }

    private OrderDto toDto(Order o) {
        return OrderDto.builder()
                .id(o.getId())
                .orderCode(o.getOrderCode())
                .subtotal(o.getSubtotal())
                .discountAmount(o.getDiscountAmount())
                .shippingFee(o.getShippingFee())
                .totalAmount(o.getTotalAmount())
                .status(o.getStatus())
                .receiverName(o.getReceiverName())
                .receiverPhone(o.getReceiverPhone())
                .shippingAddress(o.getShippingAddress())
                .note(o.getNote())
                .createdAt(o.getCreatedAt())
                .updatedAt(o.getUpdatedAt())
                .build();
    }

    private OrderDetailDto toDetailDto(Order o) {
        List<OrderItemDto> items = orderItemRepository.findByOrderId(o.getId()).stream()
                .map(i -> OrderItemDto.builder()
                        .id(i.getId())
                        .productName(i.getProductName())
                        .sku(i.getSku())
                        .color(i.getColor())
                        .size(i.getSize())
                        .thumbnailUrl(i.getThumbnailUrl())
                        .unitPrice(i.getUnitPrice())
                        .quantity(i.getQuantity())
                        .totalPrice(i.getTotalPrice())
                        .build())
                .collect(Collectors.toList());

        Payment payment = paymentRepository.findByOrderId(o.getId()).orElse(null);

        return OrderDetailDto.builder()
                .id(o.getId())
                .orderCode(o.getOrderCode())
                .subtotal(o.getSubtotal())
                .discountAmount(o.getDiscountAmount())
                .shippingFee(o.getShippingFee())
                .totalAmount(o.getTotalAmount())
                .status(o.getStatus())
                .receiverName(o.getReceiverName())
                .receiverPhone(o.getReceiverPhone())
                .shippingAddress(o.getShippingAddress())
                .note(o.getNote())
                .createdAt(o.getCreatedAt())
                .items(items)
                .paymentMethod(payment != null ? payment.getPaymentMethod().name() : null)
                .paymentStatus(payment != null ? payment.getPaymentStatus().name() : null)
                .build();
    }
}
