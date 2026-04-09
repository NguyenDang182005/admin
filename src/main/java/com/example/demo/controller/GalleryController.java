package com.example.demo.controller;

import com.example.demo.entity.Gallery;
import com.example.demo.service.FileStorageService;
import com.example.demo.service.GalleryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/galleries")
public class GalleryController {

    @Autowired
    private GalleryService galleryService;

    @Autowired
    private FileStorageService fileStorageService;

    @GetMapping
    public List<Gallery> getAllImages() {
        return galleryService.getAllImages();
    }

    @PostMapping
    public ResponseEntity<?> uploadImage(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "title", required = false, defaultValue = "") String title,
            @RequestParam(value = "category", required = false, defaultValue = "general") String category) {
        try {
            String url = fileStorageService.storeFile(file);
            Gallery gallery = new Gallery();
            gallery.setUrl(url);
            gallery.setTitle(title.isBlank() ? file.getOriginalFilename() : title);
            gallery.setCategory(category);
            Gallery saved = galleryService.save(gallery);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Upload failed: " + e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateImage(
            @PathVariable Long id,
            @RequestBody Gallery galleryUpdate) {
        return galleryService.getById(id)
                .map(gallery -> {
                    if (galleryUpdate.getTitle() != null) {
                        gallery.setTitle(galleryUpdate.getTitle());
                    }
                    if (galleryUpdate.getCategory() != null) {
                        gallery.setCategory(galleryUpdate.getCategory());
                    }
                    return ResponseEntity.ok(galleryService.save(gallery));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteImage(@PathVariable Long id) {
        galleryService.getById(id).ifPresent(img -> fileStorageService.deleteFile(img.getUrl()));
        galleryService.deleteImage(id);
        return ResponseEntity.noContent().build();
    }
}
