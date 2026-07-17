package com.sportshop.backend.dto;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AddressDto {
    private Long id;
    private String receiverName;
    private String receiverPhone;
    private String addressLine;
    private String ward;
    private String district;
    private String province;
    private Boolean isDefault;
}
