/**
 * 공통 유틸리티 함수들
 * 모든 페이지에서 사용 가능
 */

/**
 * 토큰 존재 여부 확인 및 리다이렉트
 * @returns {boolean} 토큰이 존재하면 true, 없으면 false (로그인 페이지로 리다이렉트)
 */
function checkToken() {
    const token = localStorage.getItem('accessToken');
    if (!token) {
        alert('로그인이 필요합니다.');
        window.location.href = '/auth/login';
        return false;
    }
    return true;
}

/**
 * 인증 에러 처리 (401, 403)
 * @param {Response} response - fetch API response 객체
 * @returns {boolean} 인증 에러면 true (리다이렉트), 아니면 false
 */
function handleAuthError(response) {
    if (response.status === 401 || response.status === 403) {
        alert('로그인이 만료되었습니다. 다시 로그인해주세요.');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        // 쿠키도 삭제
        document.cookie = 'accessToken=; path=/; max-age=0';
        document.cookie = 'refreshToken=; path=/; max-age=0';
        window.location.href = '/auth/login';
        return true;
    }
    return false;
}

/**
 * Toast 알림 표시 (현재는 alert, 추후 개선 예정)
 * @param {string} message - 표시할 메시지
 * @param {string} type - 알림 타입 ('success', 'error', 'info', 'warning')
 */
function showToast(message, type = 'info') {
    // TODO: 추후 Toast UI로 변경
    alert(message);
    
    // 향후 구현 예정:
    // const toast = document.createElement('div');
    // toast.className = `toast toast-${type}`;
    // toast.textContent = message;
    // document.body.appendChild(toast);
    // 
    // setTimeout(() => {
    //     toast.classList.add('fade-out');
    //     setTimeout(() => toast.remove(), 300);
    // }, 3000);
}

/**
 * 로딩 상태 표시
 * @param {HTMLElement} element - 로딩 표시할 버튼이나 요소
 * @param {string} loadingText - 로딩 중 표시할 텍스트 (기본: '처리 중...')
 */
function showLoading(element, loadingText = '처리 중...') {
    if (!element) return;
    
    element.disabled = true;
    element.dataset.originalText = element.textContent;
    element.textContent = loadingText;
}

/**
 * 로딩 상태 해제
 * @param {HTMLElement} element - 로딩 해제할 버튼이나 요소
 */
function hideLoading(element) {
    if (!element) return;
    
    element.disabled = false;
    if (element.dataset.originalText) {
        element.textContent = element.dataset.originalText;
        delete element.dataset.originalText;
    }
}

/**
 * 애니메이션과 함께 요소 제거
 * @param {HTMLElement} element - 제거할 요소
 * @param {number} duration - 애니메이션 지속 시간 (ms, 기본: 300)
 */
function animatedRemove(element, duration = 300) {
    if (!element) return;
    
    element.style.transition = `opacity ${duration}ms ease`;
    element.style.opacity = '0';
    
    setTimeout(() => {
        element.remove();
    }, duration);
}

/**
 * LocalStorage에서 토큰 가져오기
 * @returns {string|null} accessToken 또는 null
 */
function getToken() {
    return localStorage.getItem('accessToken');
}

/**
 * API 요청에 사용할 공통 헤더 생성
 * @param {boolean} includeContentType - Content-Type 포함 여부 (기본: true)
 * @returns {Object} 헤더 객체
 */
function getAuthHeaders(includeContentType = true) {
    const token = getToken();
    const headers = {
        'Authorization': `Bearer ${token}`
    };
    
    if (includeContentType) {
        headers['Content-Type'] = 'application/json';
    }
    
    return headers;
}

/**
 * 확인 대화상자 표시
 * @param {string} message - 확인 메시지
 * @returns {boolean} 사용자가 확인을 누르면 true
 */
function confirmAction(message) {
    return confirm(message);
}

/**
 * 날짜 포맷팅 (YYYY-MM-DD HH:mm:ss)
 * @param {Date|string} date - 날짜 객체 또는 문자열
 * @returns {string} 포맷된 날짜 문자열
 */
function formatDateTime(date) {
    const d = date instanceof Date ? date : new Date(date);
    
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');
    
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

/**
 * 날짜만 포맷팅 (YYYY-MM-DD)
 * @param {Date|string} date - 날짜 객체 또는 문자열
 * @returns {string} 포맷된 날짜 문자열
 */
function formatDate(date) {
    const d = date instanceof Date ? date : new Date(date);
    
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
}

/**
 * 디바운스 함수 (연속 호출 방지)
 * @param {Function} func - 실행할 함수
 * @param {number} wait - 대기 시간 (ms)
 * @returns {Function} 디바운스된 함수
 */
function debounce(func, wait = 300) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// 전역 스코프에 노출 (다른 스크립트에서 사용 가능)
window.checkToken = checkToken;
window.handleAuthError = handleAuthError;
window.showToast = showToast;
window.showLoading = showLoading;
window.hideLoading = hideLoading;
window.animatedRemove = animatedRemove;
window.getToken = getToken;
window.getAuthHeaders = getAuthHeaders;
window.confirmAction = confirmAction;
window.formatDateTime = formatDateTime;
window.formatDate = formatDate;
window.debounce = debounce;
