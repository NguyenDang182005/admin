package com.example.demo.controller;

import com.example.demo.service.FileStorageService;
import com.example.demo.service.SystemConfigService;
import com.example.demo.entity.Setting;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/config")
public class SystemConfigController {

    @Autowired
    private SystemConfigService systemConfigService;

    @Autowired
    private FileStorageService fileStorageService;

    @GetMapping
    public List<Setting> getAllSettings() {
        return systemConfigService.getAllSettings();
    }

    @GetMapping("/logo")
    public ResponseEntity<Map<String, String>> getLogo() {
        String url = systemConfigService.getSettingValue("site_logo", "");
        return ResponseEntity.ok(Map.of("url", url));
    }

    @PostMapping("/logo")
    public ResponseEntity<Map<String, String>> uploadLogo(@RequestParam("file") MultipartFile file) {
        try {
            String url = fileStorageService.storeFile(file);
            systemConfigService.saveSetting("site_logo", url);
            return ResponseEntity.ok(Map.of("url", url, "message", "Logo updated successfully"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Failed to upload logo: " + e.getMessage()));
        }
    }

    @PutMapping("/{key}")
    public ResponseEntity<Setting> updateSetting(@PathVariable String key, @RequestBody Map<String, String> body) {
        Setting saved = systemConfigService.saveSetting(key, body.get("value"));
        return ResponseEntity.ok(saved);
    }
}
