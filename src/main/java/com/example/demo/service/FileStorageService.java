package com.example.demo.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.UUID;

import com.example.demo.config.FileStorageProperties;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class FileStorageService {

    private final FileStorageProperties fileStorageProperties;

    @Value("${server.port:8082}")
    private String serverPort;

    public String storeFile(MultipartFile file) throws IOException {
        Path uploadPath = Paths.get(fileStorageProperties.getUploadDir());
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        String filename = UUID.randomUUID() + extension;

        Path targetPath = uploadPath.resolve(filename);
        Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

        return "http://localhost:" + serverPort + "/uploads/" + filename;
    }

    public void deleteFile(String fileUrl) {
        try {
            String filename = fileUrl.substring(fileUrl.lastIndexOf("/") + 1);
            Path filePath = Paths.get(fileStorageProperties.getUploadDir()).resolve(filename);
            Files.deleteIfExists(filePath);
        } catch (IOException ignored) {}
    }
}
