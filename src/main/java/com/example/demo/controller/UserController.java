package com.example.demo.controller;

import com.example.demo.entity.User;
import com.example.demo.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/users")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String role) {

        Page<User> usersPage = userService.getAllUsers(page, size);

        Map<String, Object> response = new HashMap<>();
        response.put("content", usersPage.getContent());
        response.put("currentPage", usersPage.getNumber());
        response.put("totalPages", usersPage.getTotalPages());
        response.put("totalElements", usersPage.getTotalElements());
        response.put("size", usersPage.getSize());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getUserById(@PathVariable Long id) {
        return userService.getUserById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getUserStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("total", userService.countUsers());
        stats.put("customers", userService.getUsersByRole("CUSTOMER").size());
        stats.put("owners", userService.getUsersByRole("OWNER").size());
        stats.put("admins", userService.getUsersByRole("ADMIN").size());
        return ResponseEntity.ok(stats);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody User user) {
        try {
            User updated = userService.updateUser(id, user);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        try {
            userService.deleteUser(id);
            return ResponseEntity.ok(Map.of("message", "User deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}