package com.example.demo.dto;

public class SocialLoginRequest {
    private String provider;
    private String token;
    private String email;
    private String name;

    public String getProvider() { return provider; }
    public void setProvider(String provider) { this.provider = provider; }
    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
}
