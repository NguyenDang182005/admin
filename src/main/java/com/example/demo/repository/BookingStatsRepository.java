package com.example.demo.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import com.example.demo.entity.Booking;

import java.util.List;

@Repository
public interface BookingStatsRepository extends JpaRepository<Booking, Long> {

    // Tổng doanh thu theo loại dịch vụ
    @Query("SELECT b.bookingType, SUM(b.totalPrice) FROM Booking b WHERE b.status IN ('CONFIRMED', 'COMPLETED') GROUP BY b.bookingType")
    List<Object[]> getRevenueByType();

    // Tổng số bookings
    @Query("SELECT COUNT(b) FROM Booking b")
    Long countTotal();

    // Tổng doanh thu
    @Query("SELECT COALESCE(SUM(b.totalPrice), 0) FROM Booking b WHERE b.status IN ('CONFIRMED', 'COMPLETED')")
    Double totalRevenue();

    // Bookings theo trạng thái
    @Query("SELECT b.status, COUNT(b) FROM Booking b GROUP BY b.status")
    List<Object[]> countByStatus();

    // Tổng số người dùng (join với User entity)
    @Query("SELECT COUNT(u) FROM User u")
    Long countUsers();

    // Doanh thu theo ngày (7 ngày gần nhất)
    @Query("SELECT FUNCTION('DATE', b.createdAt), SUM(b.totalPrice) " +
           "FROM Booking b " +
           "WHERE b.createdAt >= :startDate " +
           "AND b.status IN ('CONFIRMED', 'COMPLETED') " +
           "GROUP BY FUNCTION('DATE', b.createdAt) " +
           "ORDER BY FUNCTION('DATE', b.createdAt) ASC")
    List<Object[]> getDailyRevenue(@org.springframework.data.repository.query.Param("startDate") java.time.LocalDateTime startDate);

    // Tổng số đơn hàng theo ngày
    @Query("SELECT FUNCTION('DATE', b.createdAt), COUNT(b) " +
           "FROM Booking b " +
           "WHERE b.createdAt >= :startDate " +
           "GROUP BY FUNCTION('DATE', b.createdAt) " +
           "ORDER BY FUNCTION('DATE', b.createdAt) ASC")
    List<Object[]> getDailyBookingCount(@org.springframework.data.repository.query.Param("startDate") java.time.LocalDateTime startDate);

    // Số đơn thành công theo ngày
    @Query("SELECT FUNCTION('DATE', b.createdAt), COUNT(b) " +
           "FROM Booking b " +
           "WHERE b.createdAt >= :startDate " +
           "AND b.status IN ('CONFIRMED', 'COMPLETED') " +
           "GROUP BY FUNCTION('DATE', b.createdAt) " +
           "ORDER BY FUNCTION('DATE', b.createdAt) ASC")
    List<Object[]> getDailyConfirmedCount(@org.springframework.data.repository.query.Param("startDate") java.time.LocalDateTime startDate);
}
