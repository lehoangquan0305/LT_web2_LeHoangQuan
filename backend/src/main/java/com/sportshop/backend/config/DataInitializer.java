package com.sportshop.backend.config;

import com.sportshop.backend.entity.Role;
import com.sportshop.backend.entity.User;
import com.sportshop.backend.repository.RoleRepository;
import com.sportshop.backend.repository.UserRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;


@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {


    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;


    @Override
    public void run(String... args) {


        // ======================
        // CREATE ROLES
        // ======================

        Role adminRole = roleRepository
                .findByName("ADMIN")
                .orElseGet(() -> {

                    Role role = Role.builder()
                            .name("ADMIN")
                            .description("Administrator")
                            .build();

                    return roleRepository.save(role);
                });


        Role userRole = roleRepository
                .findByName("USER")
                .orElseGet(() -> {

                    Role role = Role.builder()
                            .name("USER")
                            .description("Customer")
                            .build();

                    return roleRepository.save(role);
                });



        // ======================
        // CREATE ADMIN ACCOUNT
        // ======================

        if(!userRepository.existsByEmail("admin@sportshop.com")){


            User admin = User.builder()
                    .fullName("System Admin")
                    .email("admin@sportshop.com")
                    .password(
                            passwordEncoder.encode("Admin@123")
                    )
                    .phone("0900000000")
                    .enabled(true)
                    .role(adminRole)
                    .build();


            userRepository.save(admin);
        }



        // ======================
        // CREATE NORMAL USER
        // ======================


        if(!userRepository.existsByEmail("user@sportshop.com")){


            User user = User.builder()
                    .fullName("Normal User")
                    .email("user@sportshop.com")
                    .password(
                            passwordEncoder.encode("User@123")
                    )
                    .phone("0911111111")
                    .enabled(true)
                    .role(userRole)
                    .build();


            userRepository.save(user);

        }


    }
}