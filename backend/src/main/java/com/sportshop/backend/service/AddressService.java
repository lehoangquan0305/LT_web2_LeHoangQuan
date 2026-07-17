package com.sportshop.backend.service;

import com.sportshop.backend.dto.AddressDto;
import com.sportshop.backend.entity.User;
import com.sportshop.backend.entity.UserAddress;
import com.sportshop.backend.repository.UserAddressRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AddressService {

    private final UserAddressRepository userAddressRepository;

    @Transactional(readOnly = true)
    public List<AddressDto> getAddresses(User user) {
        return userAddressRepository.findByUserId(user.getId())
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    @Transactional
    public AddressDto createAddress(User user, AddressDto dto) {
        if (Boolean.TRUE.equals(dto.getIsDefault())) {
            unsetOtherDefaults(user);
        }

        UserAddress address = UserAddress.builder()
                .user(user)
                .receiverName(dto.getReceiverName())
                .receiverPhone(dto.getReceiverPhone())
                .addressLine(dto.getAddressLine())
                .ward(dto.getWard())
                .district(dto.getDistrict())
                .province(dto.getProvince())
                .isDefault(Boolean.TRUE.equals(dto.getIsDefault()))
                .build();

        return toDto(userAddressRepository.save(address));
    }

    @Transactional
    public AddressDto updateAddress(User user, Long id, AddressDto dto) {
        UserAddress address = userAddressRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy địa chỉ"));

        if (!address.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Bạn không có quyền với địa chỉ này");
        }

        if (Boolean.TRUE.equals(dto.getIsDefault())) {
            unsetOtherDefaults(user);
        }

        address.setReceiverName(dto.getReceiverName());
        address.setReceiverPhone(dto.getReceiverPhone());
        address.setAddressLine(dto.getAddressLine());
        address.setWard(dto.getWard());
        address.setDistrict(dto.getDistrict());
        address.setProvince(dto.getProvince());
        address.setIsDefault(Boolean.TRUE.equals(dto.getIsDefault()));

        return toDto(userAddressRepository.save(address));
    }

    @Transactional
    public void deleteAddress(User user, Long id) {
        UserAddress address = userAddressRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy địa chỉ"));

        if (!address.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Bạn không có quyền với địa chỉ này");
        }

        userAddressRepository.delete(address);
    }

    private void unsetOtherDefaults(User user) {
        List<UserAddress> addresses = userAddressRepository.findByUserId(user.getId());
        addresses.forEach(a -> a.setIsDefault(false));
        userAddressRepository.saveAll(addresses);
    }

    private AddressDto toDto(UserAddress a) {
        return AddressDto.builder()
                .id(a.getId())
                .receiverName(a.getReceiverName())
                .receiverPhone(a.getReceiverPhone())
                .addressLine(a.getAddressLine())
                .ward(a.getWard())
                .district(a.getDistrict())
                .province(a.getProvince())
                .isDefault(a.getIsDefault())
                .build();
    }
}
