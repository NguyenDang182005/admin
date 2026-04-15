package com.example.demo.controller;

import com.example.demo.entity.DynamicPrice;
import com.example.demo.service.DynamicPriceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/dynamic-prices")
public class DynamicPriceController {

    @Autowired
    private DynamicPriceService dynamicPriceService;

    @GetMapping
    public ResponseEntity<List<DynamicPrice>> getAllRules() {
        return ResponseEntity.ok(dynamicPriceService.getAllRules());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getRuleById(@PathVariable Long id) {
        return dynamicPriceService.getRuleById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> createRule(@RequestBody DynamicPrice rule) {
        try {
            DynamicPrice created = dynamicPriceService.createRule(rule);
            return ResponseEntity.ok(created);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Lỗi khi tạo quy tắc: " + e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateRule(@PathVariable Long id, @RequestBody DynamicPrice rule) {
        try {
            DynamicPrice updated = dynamicPriceService.updateRule(id, rule);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteRule(@PathVariable Long id) {
        try {
            dynamicPriceService.deleteRule(id);
            return ResponseEntity.ok(Map.of("message", "Đã xóa quy tắc thành công"));
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}
