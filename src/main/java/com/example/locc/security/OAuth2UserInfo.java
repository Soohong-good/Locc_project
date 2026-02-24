package com.example.locc.security;

import java.util.Map;

/**
 * OAuth2 제공자별 사용자 정보 추상화
 */
public interface OAuth2UserInfo {
    String getProviderId();
    String getProvider();
    String getEmail();
    String getName();
}
