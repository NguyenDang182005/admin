package com.example.demo.controller;

import com.example.demo.entity.Booking;
import com.example.demo.service.BookingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/bookings")
public class BookingController {

    @Autowired
    private BookingService bookingService;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllBookings(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String type) {

        Page<Booking> bookingsPage;

        if (status != null && !status.isEmpty()) {
            bookingsPage = bookingService.getBookingsByStatus(status, page, size);
        } else if (type != null && !type.isEmpty()) {
            bookingsPage = bookingService.getBookingsByType(type, page, size);
        } else {
            bookingsPage = bookingService.getAllBookings(page, size);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("content", bookingsPage.getContent());
        response.put("currentPage", bookingsPage.getNumber());
        response.put("totalPages", bookingsPage.getTotalPages());
        response.put("totalElements", bookingsPage.getTotalElements());
        response.put("size", bookingsPage.getSize());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getBookingById(@PathVariable Long id) {
        return bookingService.getBookingById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateBookingStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        
        String status = body.get("status");
        if (status == null || status.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Status is required"));
        }

        try {
            Booking updated = bookingService.updateBookingStatus(id, status);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteBooking(@PathVariable Long id) {
        try {
            bookingService.deleteBooking(id);
            return ResponseEntity.ok(Map.of("message", "Booking deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Long>> getBookingStats() {
        Map<String, Long> stats = new HashMap<>();
        stats.put("total", bookingService.countBookings());
        stats.put("pending", bookingService.countBookingsByStatus("PENDING"));
        stats.put("confirmed", bookingService.countBookingsByStatus("CONFIRMED"));
        stats.put("completed", bookingService.countBookingsByStatus("COMPLETED"));
        stats.put("cancelled", bookingService.countBookingsByStatus("CANCELLED"));
        return ResponseEntity.ok(stats);
    }
}