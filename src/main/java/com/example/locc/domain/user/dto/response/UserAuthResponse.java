package com.example.locc.domain.user.dto.response;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class UserAuthResponse {

    private final String accessToken;
    private final String refreshToken;
    private final String tokenType;
    private final Long expiresIn;
    private final Long refreshExpiresIn;
    private final String username;
    private final String role;
    private final String message;
    private final Boolean totpRequired;
    private final Boolean totpSetupRequired;
    private final String preAuthToken;

    public UserAuthResponse withoutTokens() {
        return UserAuthResponse.builder()
                .tokenType(this.tokenType)
                .expiresIn(this.expiresIn)
                .refreshExpiresIn(this.refreshExpiresIn)
                .username(this.username)
                .role(this.role)
                .message(this.message)
                .totpRequired(this.totpRequired)
                .totpSetupRequired(this.totpSetupRequired)
                .preAuthToken(this.preAuthToken)
                .build();
    }
}
