package com.example.demo.service;

import com.example.demo.entity.Setting;
import com.example.demo.repository.SettingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class SystemConfigService {

    @Autowired
    private SettingRepository settingRepository;

    public List<Setting> getAllSettings() {
        return settingRepository.findAll();
    }

    public Optional<Setting> getSetting(String key) {
        return settingRepository.findById(key);
    }

    public String getSettingValue(String key, String defaultValue) {
        return settingRepository.findById(key)
                .map(Setting::getValue)
                .orElse(defaultValue);
    }

    public Setting saveSetting(String key, String value) {
        Setting setting = settingRepository.findById(key)
                .orElse(new Setting(key, value));
        setting.setValue(value);
        return settingRepository.save(setting);
    }
}
