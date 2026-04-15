package com.example.demo.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.Map;

@Service
public class SystemDataService {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    /**
     * Tịnh tiến (shift) ngày của tất cả dữ liệu demo (ID <= 50) lên n ngày.
     * Mỗi bảng được xử lý độc lập bằng JdbcTemplate (không dùng JPA transaction).
     */
    public Map<String, Object> shiftDemoData(int days) {
        Map<String, Object> results = new LinkedHashMap<>();
        int totalUpdated = 0;

        // 1. Shift flights (departure_time, arrival_time)
        totalUpdated += executeShift(results, "flights",
            "UPDATE flights SET departure_time = DATE_ADD(departure_time, INTERVAL ? DAY), " +
            "arrival_time = DATE_ADD(arrival_time, INTERVAL ? DAY) WHERE id <= 50",
            days, days);

        // 2. Shift hotel_bookings (check_in_date, check_out_date)
        totalUpdated += executeShift(results, "hotel_bookings",
            "UPDATE hotel_bookings SET check_in_date = DATE_ADD(check_in_date, INTERVAL ? DAY), " +
            "check_out_date = DATE_ADD(check_out_date, INTERVAL ? DAY) WHERE booking_id <= 50",
            days, days);

        // 3. Shift car_rental_bookings (pickup_datetime, dropoff_datetime)
        totalUpdated += executeShift(results, "car_rental_bookings",
            "UPDATE car_rental_bookings SET pickup_datetime = DATE_ADD(pickup_datetime, INTERVAL ? DAY), " +
            "dropoff_datetime = DATE_ADD(dropoff_datetime, INTERVAL ? DAY) WHERE booking_id <= 50",
            days, days);

        // 4. Shift taxi_bookings (pickup_datetime)
        totalUpdated += executeShift(results, "taxi_bookings",
            "UPDATE taxi_bookings SET pickup_datetime = DATE_ADD(pickup_datetime, INTERVAL ? DAY) " +
            "WHERE booking_id <= 50",
            days);

        // 5. Shift attraction_bookings (visit_date)
        totalUpdated += executeShift(results, "attraction_bookings",
            "UPDATE attraction_bookings SET visit_date = DATE_ADD(visit_date, INTERVAL ? DAY) " +
            "WHERE booking_id <= 50",
            days);

        // 6. Shift dynamic_prices (target_date)
        totalUpdated += executeShift(results, "dynamic_prices",
            "UPDATE dynamic_prices SET target_date = DATE_ADD(target_date, INTERVAL ? DAY) WHERE id <= 50",
            days);

        // 7. Shift bookings master table (created_at)
        totalUpdated += executeShift(results, "bookings",
            "UPDATE bookings SET created_at = DATE_ADD(created_at, INTERVAL ? DAY) WHERE id <= 50",
            days);

        results.put("totalUpdated", totalUpdated);
        return results;
    }

    private int executeShift(Map<String, Object> results, String tableName, String sql, Object... params) {
        try {
            int rows = jdbcTemplate.update(sql, params);
            results.put(tableName, rows);
            return rows;
        } catch (Exception e) {
            results.put(tableName, "Lỗi: " + extractMessage(e));
            return 0;
        }
    }

    private String extractMessage(Exception e) {
        String msg = e.getMessage();
        if (msg != null && msg.length() > 120) {
            msg = msg.substring(0, 120) + "...";
        }
        return msg != null ? msg : "Unknown error";
    }
}
