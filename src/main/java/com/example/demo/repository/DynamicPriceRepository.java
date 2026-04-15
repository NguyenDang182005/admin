package com.example.demo.repository;

import com.example.demo.entity.DynamicPrice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DynamicPriceRepository extends JpaRepository<DynamicPrice, Long> {

    List<DynamicPrice> findAllByOrderByTargetDateDesc();

    List<DynamicPrice> findByServiceType(String serviceType);

    @Modifying
    @Query("UPDATE DynamicPrice dp SET dp.targetDate = FUNCTION('DATE_ADD', dp.targetDate, :days) WHERE dp.id <= 50")
    int shiftTargetDates(@Param("days") int days);
}
