package com.example.demo.service;

import com.example.demo.entity.DynamicPrice;
import com.example.demo.repository.DynamicPriceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class DynamicPriceService {

    @Autowired
    private DynamicPriceRepository dynamicPriceRepository;

    public List<DynamicPrice> getAllRules() {
        return dynamicPriceRepository.findAllByOrderByTargetDateDesc();
    }

    public Optional<DynamicPrice> getRuleById(Long id) {
        return dynamicPriceRepository.findById(id);
    }

    @Transactional
    public DynamicPrice createRule(DynamicPrice rule) {
        return dynamicPriceRepository.save(rule);
    }

    @Transactional
    public DynamicPrice updateRule(Long id, DynamicPrice updated) {
        return dynamicPriceRepository.findById(id).map(existing -> {
            if (updated.getServiceType() != null) existing.setServiceType(updated.getServiceType());
            if (updated.getServiceId() != null) existing.setServiceId(updated.getServiceId());
            if (updated.getTargetDate() != null) existing.setTargetDate(updated.getTargetDate());
            existing.setDynamicPrice(updated.getDynamicPrice());
            existing.setMultiplier(updated.getMultiplier());
            return dynamicPriceRepository.save(existing);
        }).orElseThrow(() -> new RuntimeException("Dynamic price rule not found with id: " + id));
    }

    @Transactional
    public void deleteRule(Long id) {
        dynamicPriceRepository.deleteById(id);
    }
}
