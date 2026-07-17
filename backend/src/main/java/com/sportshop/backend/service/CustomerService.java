package com.sportshop.backend.service;

import com.sportshop.backend.dto.CustomerDto;
import com.sportshop.backend.entity.Role;
import com.sportshop.backend.entity.User;
import com.sportshop.backend.repository.RoleRepository;
import com.sportshop.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CustomerService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    public List<CustomerDto> getAllCustomers() {
        return userRepository.findAll()
                .stream()
                .map(this::entityToDto)
                .collect(Collectors.toList());
    }

    public CustomerDto getCustomerById(Long id) {
        return userRepository.findById(id)
                .map(this::entityToDto)
                .orElse(null);
    }

    public CustomerDto createCustomer(CustomerDto dto, String rawPassword) {
        Role role = roleRepository.findByName("CUSTOMER")
                .orElseGet(() -> roleRepository.findByName("USER").orElse(null));

        User user = User.builder()
                .fullName(dto.getFullName())
                .email(dto.getEmail())
                .phone(dto.getPhone())
                .avatarUrl(dto.getAvatarUrl())
                .birthday(dto.getBirthday())
                .password(passwordEncoder.encode(rawPassword != null ? rawPassword : "123456"))
                .enabled(dto.getEnabled() != null ? dto.getEnabled() : true)
                .role(role)
                .build();

        User saved = userRepository.save(user);
        return entityToDto(saved);
    }

    public CustomerDto updateCustomer(Long id, CustomerDto dto) {
        return userRepository.findById(id)
                .map(user -> {
                    if (dto.getFullName() != null) user.setFullName(dto.getFullName());
                    if (dto.getPhone() != null) user.setPhone(dto.getPhone());
                    if (dto.getAvatarUrl() != null) user.setAvatarUrl(dto.getAvatarUrl());
                    if (dto.getBirthday() != null) user.setBirthday(dto.getBirthday());
                    if (dto.getEnabled() != null) user.setEnabled(dto.getEnabled());

                    User updated = userRepository.save(user);
                    return entityToDto(updated);
                })
                .orElse(null);
    }

    public CustomerDto toggleEnabled(Long id) {
        return userRepository.findById(id)
                .map(user -> {
                    user.setEnabled(!Boolean.TRUE.equals(user.getEnabled()));
                    return entityToDto(userRepository.save(user));
                })
                .orElse(null);
    }

    public boolean deleteCustomer(Long id) {
        if (userRepository.existsById(id)) {
            userRepository.deleteById(id);
            return true;
        }
        return false;
    }

    private CustomerDto entityToDto(User user) {
        return CustomerDto.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .avatarUrl(user.getAvatarUrl())
                .birthday(user.getBirthday())
                .enabled(user.getEnabled())
                .roleName(user.getRole() != null ? user.getRole().getName() : null)
                .createdAt(user.getCreatedAt())
                .build();
    }
}
