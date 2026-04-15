package com.example.demo.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/admin/data-explorer")
public class DataExplorerController {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    // Danh sách bảng được phép truy vấn (whitelist để tránh SQL injection)
    private static final Set<String> ALLOWED_TABLES = Set.of(
        "flights", "rooms", "hotels", "cars", "car_locations",
        "airport_taxis", "attractions",
        "bookings", "flight_bookings", "hotel_bookings",
        "car_rental_bookings", "taxi_bookings", "attraction_bookings",
        "dynamic_prices", "users"
    );

    @GetMapping("/tables")
    public ResponseEntity<List<Map<String, Object>>> getTableList() {
        List<Map<String, Object>> tables = new ArrayList<>();
        for (String t : ALLOWED_TABLES.stream().sorted().toList()) {
            try {
                Integer count = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM " + t, Integer.class);
                tables.add(Map.of("name", t, "count", count != null ? count : 0));
            } catch (Exception e) {
                tables.add(Map.of("name", t, "count", 0, "error", true));
            }
        }
        tables.sort(Comparator.comparing(m -> (String) m.get("name")));
        return ResponseEntity.ok(tables);
    }

    @GetMapping("/query")
    public ResponseEntity<Map<String, Object>> queryTable(
            @RequestParam String table,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "ASC") String sortDir) {

        if (!ALLOWED_TABLES.contains(table)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Bảng không được phép truy vấn"));
        }

        // Validate sortDir
        String direction = "DESC".equalsIgnoreCase(sortDir) ? "DESC" : "ASC";

        try {
            // Get columns info
            List<Map<String, Object>> columns = jdbcTemplate.queryForList(
                "SELECT COLUMN_NAME, DATA_TYPE, COLUMN_KEY FROM INFORMATION_SCHEMA.COLUMNS " +
                "WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? ORDER BY ORDINAL_POSITION", table);

            List<String> columnNames = columns.stream()
                .map(c -> (String) c.get("COLUMN_NAME"))
                .toList();

            // Validate sortBy column exists
            String safeSortBy = columnNames.contains(sortBy) ? sortBy : columnNames.get(0);

            // Get total count
            Integer total = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM " + table, Integer.class);

            // Get data with pagination
            int offset = page * size;
            List<Map<String, Object>> rows = jdbcTemplate.queryForList(
                "SELECT * FROM " + table + " ORDER BY " + safeSortBy + " " + direction + " LIMIT ? OFFSET ?",
                size, offset);

            Map<String, Object> result = new LinkedHashMap<>();
            result.put("table", table);
            result.put("columns", columns);
            result.put("data", rows);
            result.put("total", total != null ? total : 0);
            result.put("page", page);
            result.put("size", size);
            result.put("totalPages", (int) Math.ceil((double) (total != null ? total : 0) / size));

            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(
                Map.of("error", "Lỗi truy vấn: " + e.getMessage()));
        }
    }
}
