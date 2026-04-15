package com.example.demo.controller;

import com.example.demo.service.SystemDataService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/system")
public class SystemDataController {

    @Autowired
    private SystemDataService systemDataService;

    @PostMapping("/shift-data")
    public ResponseEntity<Map<String, Object>> shiftData(@RequestParam(defaultValue = "1") int days) {
        try {
            Map<String, Object> results = systemDataService.shiftDemoData(days);

            Map<String, Object> response = new LinkedHashMap<>();
            response.put("success", true);
            response.put("message", "Đã tịnh tiến dữ liệu demo thành công +" + days + " ngày.");
            response.put("details", results);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new LinkedHashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Lỗi khi tịnh tiến dữ liệu: " + e.getMessage());

            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }
}
