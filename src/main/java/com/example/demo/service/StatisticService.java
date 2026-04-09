package com.example.demo.service;

import com.example.demo.repository.BookingStatsRepository;
import com.example.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class StatisticService {

    @Autowired
    private BookingStatsRepository bookingStatsRepository;

    @Autowired
    private UserRepository userRepository;

    // Doanh thu theo từng loại dịch vụ → cho PieChart
    public List<Map<String, Object>> getRevenueByCategory() {
        List<Object[]> raw = bookingStatsRepository.getRevenueByType();
        List<Map<String, Object>> result = new ArrayList<>();
        for (Object[] row : raw) {
            Map<String, Object> entry = new HashMap<>();
            entry.put("name", row[0].toString());
            entry.put("value", ((Number) row[1]).doubleValue());
            result.add(entry);
        }
        return result;
    }

    // Tổng quan dashboard
    public Map<String, Object> getOverview() {
        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("totalBookings", bookingStatsRepository.countTotal());
        stats.put("totalRevenue", bookingStatsRepository.totalRevenue());
        stats.put("totalUsers", bookingStatsRepository.countUsers());

        // Bookings by status
        List<Object[]> byStatus = bookingStatsRepository.countByStatus();
        Map<String, Long> statusMap = new LinkedHashMap<>();
        for (Object[] row : byStatus) {
            statusMap.put(row[0].toString(), ((Number) row[1]).longValue());
        }
        stats.put("bookingsByStatus", statusMap);

        return stats;
    }

    // Xu hướng doanh thu 7 ngày gần nhất
    public List<Map<String, Object>> getRevenueTrend() {
        java.time.LocalDateTime startDate = java.time.LocalDateTime.now().minusDays(7);
        List<Object[]> raw = bookingStatsRepository.getDailyRevenue(startDate);
        
        Map<String, Double> trendMap = new LinkedHashMap<>();
        // Initialize last 7 days with 0
        for (int i = 6; i >= 0; i--) {
            String date = java.time.LocalDate.now().minusDays(i).toString();
            trendMap.put(date, 0.0);
        }

        for (Object[] row : raw) {
            if (row[0] != null) {
                String dateStr = row[0].toString();
                // Ensure it's just YYYY-MM-DD
                if (dateStr.length() > 10) dateStr = dateStr.substring(0, 10);
                if (trendMap.containsKey(dateStr)) {
                    trendMap.put(dateStr, ((Number) row[1]).doubleValue());
                }
            }
        }

        List<Map<String, Object>> result = new ArrayList<>();
        trendMap.forEach((date, amount) -> {
            Map<String, Object> entry = new HashMap<>();
            entry.put("date", date);
            entry.put("revenue", amount);
            result.add(entry);
        });
        return result;
    }

    // Xu hướng tổng số đơn hàng 7 ngày qua
    public List<Map<String, Object>> getBookingsTrend() {
        java.time.LocalDateTime startDate = java.time.LocalDateTime.now().minusDays(7);
        List<Object[]> raw = bookingStatsRepository.getDailyBookingCount(startDate);
        return processTrendData(raw, "count");
    }

    // Xu hướng đơn hàng thành công 7 ngày qua
    public List<Map<String, Object>> getConfirmedTrend() {
        java.time.LocalDateTime startDate = java.time.LocalDateTime.now().minusDays(7);
        List<Object[]> raw = bookingStatsRepository.getDailyConfirmedCount(startDate);
        return processTrendData(raw, "count");
    }

    // Xu hướng người dùng mới 7 ngày qua
    public List<Map<String, Object>> getUsersTrend() {
        java.time.LocalDateTime startDate = java.time.LocalDateTime.now().minusDays(7);
        List<Object[]> raw = userRepository.getDailyNewUsers(startDate);
        return processTrendData(raw, "count");
    }

    // Helper method to process raw trend data
    private List<Map<String, Object>> processTrendData(List<Object[]> raw, String valueKey) {
        Map<String, Long> trendMap = new LinkedHashMap<>();
        for (int i = 6; i >= 0; i--) {
            String date = java.time.LocalDate.now().minusDays(i).toString();
            trendMap.put(date, 0L);
        }
        for (Object[] row : raw) {
            if (row[0] != null) {
                String dateStr = row[0].toString();
                if (dateStr.length() > 10) dateStr = dateStr.substring(0, 10);
                if (trendMap.containsKey(dateStr)) {
                    trendMap.put(dateStr, ((Number) row[1]).longValue());
                }
            }
        }
        List<Map<String, Object>> result = new ArrayList<>();
        trendMap.forEach((date, val) -> {
            Map<String, Object> entry = new HashMap<>();
            entry.put("date", date);
            entry.put(valueKey, val);
            result.add(entry);
        });
        return result;
    }
}
