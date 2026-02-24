/**
 * OAuth2 소셜 로그인 후 토큰 처리
 */
(function() {
    const urlParams = new URLSearchParams(window.location.search);
    const accessToken = urlParams.get('accessToken');
    const refreshToken = urlParams.get('refreshToken');

    if (accessToken && refreshToken) {
        // localStorage에 토큰 저장
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);

        // 쿠키에도 저장 (관리자 페이지 접근용)
        document.cookie = `accessToken=${accessToken}; path=/; max-age=86400; SameSite=Lax`;
        document.cookie = `refreshToken=${refreshToken}; path=/; max-age=604800; SameSite=Lax`;

        // URL에서 토큰 제거 (보안)
        window.history.replaceState({}, document.title, window.location.pathname);

        console.log('OAuth2 로그인 완료');
    }
})();
