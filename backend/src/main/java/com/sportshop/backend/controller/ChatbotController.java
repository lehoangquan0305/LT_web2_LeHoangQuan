package com.sportshop.backend.controller;

import com.sportshop.backend.entity.ChatbotLog;
import com.sportshop.backend.repository.ChatbotLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/chatbot")
@CrossOrigin(origins = "*") 
public class ChatbotController {

    @Autowired
    private ChatbotLogRepository chatbotLogRepository;

    @PostMapping("/logs")
    public ResponseEntity<Map<String, Object>> saveLog(@RequestBody ChatbotLogDto dto) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            if (dto.getUserMessage() == null || dto.getBotResponse() == null) {
                response.put("success", false);
                response.put("message", "Thiếu tin nhắn của khách hoặc phản hồi của bot rồi nè 🎀");
                return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
            }

            // Lưu log vào database
            ChatbotLog log = new ChatbotLog();
            log.setUserId(dto.getUserId());
            log.setUserMessage(dto.getUserMessage());
            log.setBotResponse(dto.getBotResponse());
            log.setIntent(dto.getIntent() != null ? dto.getIntent() : "CHITCHAT");
            log.setExtractedParameters(dto.getExtractedParameters());

            chatbotLogRepository.save(log);

            System.out.println("🌸 Đã ghi nhận cuộc trò chuyện vào database: " + dto.getUserMessage());

            // Trả về chính câu trả lời của AI để hiển thị lên khung chat
            response.put("success", true);
            response.put("message", dto.getBotResponse()); 
            return new ResponseEntity<>(response, HttpStatus.CREATED);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Huhu, có lỗi xảy ra mất rồi...");
            response.put("error", e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}

// --- DTO Class ---
class ChatbotLogDto {
    private Long userId;
    private String userMessage;
    private String botResponse;
    private String intent;
    private String extractedParameters;

    // Getters and Setters
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getUserMessage() { return userMessage; }
    public void setUserMessage(String userMessage) { this.userMessage = userMessage; }

    public String getBotResponse() { return botResponse; }
    public void setBotResponse(String botResponse) { this.botResponse = botResponse; }

    public String getIntent() { return intent; }
    public void setIntent(String intent) { this.intent = intent; }

    public String getExtractedParameters() { return extractedParameters; }
    public void setExtractedParameters(String extractedParameters) { this.extractedParameters = extractedParameters; }
}