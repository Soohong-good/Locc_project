/**
 * API 요청 헬퍼
 * React의 API 서비스 레이어처럼 구성
 */

/**
 * 기본 API 요청 함수
 * @param {string} url - API 엔드포인트
 * @param {string} method - HTTP 메서드
 * @param {Object} data - 요청 데이터 (옵션)
 * @param {Object} options - 추가 옵션
 * @returns {Promise<Response>} fetch response
 */
async function apiRequest(url, method = 'GET', data = null, options = {}) {
    const {
        useToken = true,
        contentType = 'application/json',
        customHeaders = {}
    } = options;
    
    const headers = { ...customHeaders };
    
    // 토큰 추가
    if (useToken) {
        const token = getToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
    }
    
    // Content-Type 추가
    if (contentType && method !== 'GET') {
        headers['Content-Type'] = contentType;
    }
    
    const config = {
        method,
        headers
    };
    
    // Body 추가 (GET 제외)
    if (data && method !== 'GET') {
        config.body = contentType === 'application/json' 
            ? JSON.stringify(data) 
            : data;
    }
    
    try {
        const response = await fetch(url, config);
        
        // 인증 에러 자동 처리
        if (handleAuthError(response)) {
            throw new Error('Authentication failed');
        }
        
        return response;
    } catch (error) {
        console.error('API Request Error:', error);
        throw error;
    }
}

/**
 * GET 요청
 * @param {string} url - API 엔드포인트
 * @param {Object} options - 추가 옵션
 * @returns {Promise<any>} JSON 응답
 */
async function apiGet(url, options = {}) {
    const response = await apiRequest(url, 'GET', null, options);
    
    if (response.ok) {
        return await response.json();
    } else {
        const error = await response.json().catch(() => ({ message: '요청에 실패했습니다.' }));
        throw new Error(error.message);
    }
}

/**
 * POST 요청 (생성)
 * @param {string} url - API 엔드포인트
 * @param {Object} data - 생성할 데이터
 * @param {Object} options - 추가 옵션
 * @returns {Promise<any>} JSON 응답
 */
async function apiPost(url, data, options = {}) {
    const response = await apiRequest(url, 'POST', data, options);
    
    if (response.ok) {
        return await response.json();
    } else {
        const error = await response.json().catch(() => ({ message: '생성에 실패했습니다.' }));
        throw new Error(error.message);
    }
}

/**
 * PUT 요청 (수정)
 * @param {string} url - API 엔드포인트
 * @param {Object} data - 수정할 데이터
 * @param {Object} options - 추가 옵션
 * @returns {Promise<any>} JSON 응답
 */
async function apiPut(url, data, options = {}) {
    const response = await apiRequest(url, 'PUT', data, options);
    
    if (response.ok) {
        return await response.json();
    } else {
        const error = await response.json().catch(() => ({ message: '수정에 실패했습니다.' }));
        throw new Error(error.message);
    }
}

/**
 * PATCH 요청 (부분 수정)
 * @param {string} url - API 엔드포인트
 * @param {Object} data - 수정할 데이터
 * @param {Object} options - 추가 옵션
 * @returns {Promise<any>} JSON 응답
 */
async function apiPatch(url, data, options = {}) {
    const response = await apiRequest(url, 'PATCH', data, options);
    
    if (response.ok) {
        return await response.json().catch(() => null);
    } else {
        const error = await response.json().catch(() => ({ message: '수정에 실패했습니다.' }));
        throw new Error(error.message);
    }
}

/**
 * DELETE 요청 (삭제)
 * @param {string} url - API 엔드포인트
 * @param {Object} options - 추가 옵션
 * @returns {Promise<void>}
 */
async function apiDelete(url, options = {}) {
    const response = await apiRequest(url, 'DELETE', null, options);
    
    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: '삭제에 실패했습니다.' }));
        throw new Error(error.message);
    }
}

/**
 * 리소스 생성 (POST) - 높은 수준 헬퍼
 * @param {string} url - API 엔드포인트
 * @param {Object} data - 생성할 데이터
 * @param {string} successMessage - 성공 메시지
 * @param {boolean} reload - 성공 시 페이지 리로드 여부
 * @returns {Promise<any>} 생성된 리소스
 */
async function createResource(url, data, successMessage = '추가되었습니다.', reload = false) {
    try {
        const result = await apiPost(url, data);
        showToast(successMessage, 'success');
        
        if (reload) {
            setTimeout(() => location.reload(), 500);
        }
        
        return result;
    } catch (error) {
        showToast(error.message, 'error');
        throw error;
    }
}

/**
 * 리소스 수정 (PUT) - 높은 수준 헬퍼
 * @param {string} url - API 엔드포인트
 * @param {number|string} id - 리소스 ID
 * @param {Object} data - 수정할 데이터
 * @param {string} successMessage - 성공 메시지
 * @param {boolean} reload - 성공 시 페이지 리로드 여부
 * @returns {Promise<any>} 수정된 리소스
 */
async function updateResource(url, id, data, successMessage = '수정되었습니다.', reload = false) {
    try {
        const fullUrl = `${url}/${id}`;
        const result = await apiPut(fullUrl, data);
        showToast(successMessage, 'success');
        
        if (reload) {
            setTimeout(() => location.reload(), 500);
        }
        
        return result;
    } catch (error) {
        showToast(error.message, 'error');
        throw error;
    }
}

/**
 * 리소스 삭제 (DELETE) - 높은 수준 헬퍼
 * @param {string} url - API 엔드포인트
 * @param {number|string} id - 리소스 ID
 * @param {string} confirmMessage - 확인 메시지
 * @param {string} successMessage - 성공 메시지
 * @param {boolean} reload - 성공 시 페이지 리로드 여부
 * @returns {Promise<void>}
 */
async function deleteResource(url, id, confirmMessage = '정말 삭제하시겠습니까?', successMessage = '삭제되었습니다.', reload = false) {
    const confirmed = await showConfirmModal(confirmMessage);
    if (!confirmed) return;
    
    try {
        const fullUrl = `${url}/${id}`;
        await apiDelete(fullUrl);
        showToast(successMessage, 'success');
        
        if (reload) {
            setTimeout(() => location.reload(), 500);
        }
    } catch (error) {
        showToast(error.message, 'error');
        throw error;
    }
}

/**
 * 파일 업로드
 * @param {string} url - API 엔드포인트
 * @param {File} file - 업로드할 파일
 * @param {string} fieldName - 파일 필드명 (기본: 'file')
 * @param {Object} additionalData - 추가 데이터 (옵션)
 * @returns {Promise<any>} 업로드 결과
 */
async function uploadFile(url, file, fieldName = 'file', additionalData = {}) {
    const formData = new FormData();
    formData.append(fieldName, file);
    
    // 추가 데이터 첨부
    Object.keys(additionalData).forEach(key => {
        formData.append(key, additionalData[key]);
    });
    
    try {
        const response = await apiRequest(url, 'POST', formData, {
            contentType: null, // FormData는 자동으로 설정됨
            useToken: true
        });
        
        if (response.ok) {
            return await response.json();
        } else {
            const error = await response.json().catch(() => ({ message: '업로드에 실패했습니다.' }));
            throw new Error(error.message);
        }
    } catch (error) {
        showToast(error.message, 'error');
        throw error;
    }
}

/**
 * 이미지 파일 검증
 * @param {File} file - 검증할 파일
 * @param {number} maxSize - 최대 크기 (바이트, 기본: 5MB)
 * @param {Array<string>} allowedTypes - 허용된 MIME 타입들
 * @returns {Object} {valid: boolean, error: string}
 */
function validateImageFile(file, maxSize = 5 * 1024 * 1024, allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']) {
    if (!file) {
        return { valid: false, error: '파일을 선택해주세요.' };
    }
    
    if (file.size > maxSize) {
        const maxSizeMB = Math.round(maxSize / 1024 / 1024);
        return { valid: false, error: `파일 크기는 ${maxSizeMB}MB 이하여야 합니다.` };
    }
    
    if (!allowedTypes.includes(file.type)) {
        return { valid: false, error: '지원하지 않는 파일 형식입니다.' };
    }
    
    return { valid: true };
}

/**
 * 배치 요청 (여러 API 동시 호출)
 * @param {Array<Promise>} requests - Promise 배열
 * @returns {Promise<Array>} 결과 배열
 */
async function batchRequests(requests) {
    try {
        return await Promise.all(requests);
    } catch (error) {
        console.error('Batch request error:', error);
        throw error;
    }
}

// 전역 스코프에 노출
window.apiRequest = apiRequest;
window.apiGet = apiGet;
window.apiPost = apiPost;
window.apiPut = apiPut;
window.apiPatch = apiPatch;
window.apiDelete = apiDelete;
window.createResource = createResource;
window.updateResource = updateResource;
window.deleteResource = deleteResource;
window.uploadFile = uploadFile;
window.validateImageFile = validateImageFile;
window.batchRequests = batchRequests;
