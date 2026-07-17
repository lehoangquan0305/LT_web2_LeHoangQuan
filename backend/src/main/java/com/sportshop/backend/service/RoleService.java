package com.sportshop.backend.service;

import com.sportshop.backend.entity.Role;

import java.util.List;
import java.util.Optional;

public interface RoleService {

    List<Role> getAllRoles();

    Optional<Role> getRoleByName(String name);

    Role save(Role role);

}