package com.sportshop.backend.repository; // Phải để đúng gói (package) này nhé

import com.sportshop.backend.entity.ChatbotLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ChatbotLogRepository extends JpaRepository<ChatbotLog, Long> {
    // Chỉ cần khai báo như thế này thôi, Spring Boot sẽ tự làm hết các việc:
    // thêm, sửa, xóa, tìm kiếm dữ liệu trong MySQL cho cậu luôn!
}