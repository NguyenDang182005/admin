package com.example.demo.repository;

import com.example.demo.entity.Booking;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    @Query("SELECT b FROM Booking b ORDER BY b.createdAt DESC")
    Page<Booking> findAllByOrderByCreatedAtDesc(Pageable pageable);

    @Query("SELECT b FROM Booking b WHERE b.status = :status ORDER BY b.createdAt DESC")
    Page<Booking> findByStatus(@Param("status") String status, Pageable pageable);

    @Query("SELECT b FROM Booking b WHERE b.bookingType = :type ORDER BY b.createdAt DESC")
    Page<Booking> findByBookingType(@Param("type") String type, Pageable pageable);

    @Query("SELECT b FROM Booking b WHERE b.userId = :userId ORDER BY b.createdAt DESC")
    Page<Booking> findByUserId(@Param("userId") Long userId, Pageable pageable);

    List<Booking> findByUserId(Long userId);
}