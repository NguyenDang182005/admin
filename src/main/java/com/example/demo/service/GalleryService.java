package com.example.demo.service;

import com.example.demo.entity.Gallery;
import com.example.demo.repository.GalleryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class GalleryService {

    @Autowired
    private GalleryRepository galleryRepository;

    public List<Gallery> getAllImages() {
        return galleryRepository.findAllByOrderByCreatedAtDesc();
    }

    public Gallery addImage(String url, String title) {
        Gallery image = new Gallery();
        image.setUrl(url);
        image.setTitle(title);
        return galleryRepository.save(image);
    }

    public void deleteImage(Long id) {
        galleryRepository.deleteById(id);
    }

    public Optional<Gallery> getById(Long id) {
        return galleryRepository.findById(id);
    }

    public Gallery save(Gallery gallery) {
        return galleryRepository.save(gallery);
    }
}
