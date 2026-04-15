package com.example.demo.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "dynamic_prices")
public class DynamicPrice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "service_type", nullable = false)
    private String serviceType;

    @Column(name = "service_id", nullable = false)
    private Long serviceId;

    @Column(name = "target_date", nullable = false)
    private LocalDate targetDate;

    @Column(name = "dynamic_price")
    private BigDecimal dynamicPrice;

    @Column(name = "multiplier")
    private BigDecimal multiplier;

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getServiceType() { return serviceType; }
    public void setServiceType(String serviceType) { this.serviceType = serviceType; }

    public Long getServiceId() { return serviceId; }
    public void setServiceId(Long serviceId) { this.serviceId = serviceId; }

    public LocalDate getTargetDate() { return targetDate; }
    public void setTargetDate(LocalDate targetDate) { this.targetDate = targetDate; }

    public BigDecimal getDynamicPrice() { return dynamicPrice; }
    public void setDynamicPrice(BigDecimal dynamicPrice) { this.dynamicPrice = dynamicPrice; }

    public BigDecimal getMultiplier() { return multiplier; }
    public void setMultiplier(BigDecimal multiplier) { this.multiplier = multiplier; }
}
