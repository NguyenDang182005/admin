package com.example.demo.controller;

import com.example.demo.service.StatisticService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/statistics")
public class StatisticController {

    @Autowired
    private StatisticService statisticService;

    @GetMapping("/revenue-by-category")
    public List<Map<String, Object>> getRevenueByCategory() {
        return statisticService.getRevenueByCategory();
    }

    @GetMapping("/overview")
    public Map<String, Object> getOverview() {
        return statisticService.getOverview();
    }

    @GetMapping("/revenue-trend")
    public List<Map<String, Object>> getRevenueTrend() {
        return statisticService.getRevenueTrend();
    }

    @GetMapping("/bookings-trend")
    public List<Map<String, Object>> getBookingsTrend() {
        return statisticService.getBookingsTrend();
    }

    @GetMapping("/confirmed-trend")
    public List<Map<String, Object>> getConfirmedTrend() {
        return statisticService.getConfirmedTrend();
    }

    @GetMapping("/users-trend")
    public List<Map<String, Object>> getUsersTrend() {
        return statisticService.getUsersTrend();
    }
}
