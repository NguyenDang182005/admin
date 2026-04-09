package com.example.demo.service;

import com.example.demo.entity.Booking;
import com.example.demo.repository.BookingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class BookingService {

    @Autowired
    private BookingRepository bookingRepository;

    public Page<Booking> getAllBookings(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return bookingRepository.findAllByOrderByCreatedAtDesc(pageable);
    }

    public Page<Booking> getBookingsByStatus(String status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return bookingRepository.findByStatus(status, pageable);
    }

    public Page<Booking> getBookingsByType(String type, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return bookingRepository.findByBookingType(type, pageable);
    }

    public Optional<Booking> getBookingById(Long id) {
        return bookingRepository.findById(id);
    }

    @Transactional
    public Booking updateBookingStatus(Long id, String status) {
        Optional<Booking> bookingOpt = bookingRepository.findById(id);
        if (bookingOpt.isPresent()) {
            Booking booking = bookingOpt.get();
            booking.setStatus(status);
            return bookingRepository.save(booking);
        }
        throw new RuntimeException("Booking not found with id: " + id);
    }

    @Transactional
    public void deleteBooking(Long id) {
        bookingRepository.deleteById(id);
    }

    public long countBookings() {
        return bookingRepository.count();
    }

    public long countBookingsByStatus(String status) {
        return bookingRepository.findByStatus(status, PageRequest.of(0, 1)).getTotalElements();
    }
}