/**
 * 폼 검증 유틸리티
 * React의 form validation처럼 구성
 */

/**
 * 이메일 검증
 * @param {string} email - 검증할 이메일
 * @returns {Object} {valid: boolean, error: string}
 */
function validateEmail(email) {
    if (!email) {
        return { valid: false, error: '이메일을 입력해주세요.' };
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return { valid: false, error: '올바른 이메일 형식이 아닙니다.' };
    }
    
    return { valid: true };
}

/**
 * 비밀번호 검증
 * @param {string} password - 검증할 비밀번호
 * @param {number} minLength - 최소 길이 (기본: 8)
 * @param {Object} options - 추가 옵션
 * @returns {Object} {valid: boolean, error: string}
 */
function validatePassword(password, minLength = 8, options = {}) {
    const {
        requireUppercase = false,
        requireLowercase = false,
        requireNumber = false,
        requireSpecial = false
    } = options;
    
    if (!password) {
        return { valid: false, error: '비밀번호를 입력해주세요.' };
    }
    
    if (password.length < minLength) {
        return { valid: false, error: `비밀번호는 ${minLength}자 이상이어야 합니다.` };
    }
    
    if (requireUppercase && !/[A-Z]/.test(password)) {
        return { valid: false, error: '대문자를 포함해야 합니다.' };
    }
    
    if (requireLowercase && !/[a-z]/.test(password)) {
        return { valid: false, error: '소문자를 포함해야 합니다.' };
    }
    
    if (requireNumber && !/[0-9]/.test(password)) {
        return { valid: false, error: '숫자를 포함해야 합니다.' };
    }
    
    if (requireSpecial && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        return { valid: false, error: '특수문자를 포함해야 합니다.' };
    }
    
    return { valid: true };
}

/**
 * 비밀번호 확인 검증
 * @param {string} password - 원본 비밀번호
 * @param {string} confirmPassword - 확인 비밀번호
 * @returns {Object} {valid: boolean, error: string}
 */
function validatePasswordConfirm(password, confirmPassword) {
    if (!confirmPassword) {
        return { valid: false, error: '비밀번호 확인을 입력해주세요.' };
    }
    
    if (password !== confirmPassword) {
        return { valid: false, error: '비밀번호가 일치하지 않습니다.' };
    }
    
    return { valid: true };
}

/**
 * 필수 입력 검증
 * @param {any} value - 검증할 값
 * @param {string} fieldName - 필드명
 * @returns {Object} {valid: boolean, error: string}
 */
function validateRequired(value, fieldName = '필드') {
    if (value === null || value === undefined || value === '') {
        return { valid: false, error: `${fieldName}을(를) 입력해주세요.` };
    }
    
    // 문자열인 경우 trim 후 체크
    if (typeof value === 'string' && value.trim() === '') {
        return { valid: false, error: `${fieldName}을(를) 입력해주세요.` };
    }
    
    return { valid: true };
}

/**
 * 최소 길이 검증
 * @param {string} value - 검증할 값
 * @param {number} minLength - 최소 길이
 * @param {string} fieldName - 필드명
 * @returns {Object} {valid: boolean, error: string}
 */
function validateMinLength(value, minLength, fieldName = '필드') {
    if (!value || value.length < minLength) {
        return { valid: false, error: `${fieldName}은(는) ${minLength}자 이상이어야 합니다.` };
    }
    
    return { valid: true };
}

/**
 * 최대 길이 검증
 * @param {string} value - 검증할 값
 * @param {number} maxLength - 최대 길이
 * @param {string} fieldName - 필드명
 * @returns {Object} {valid: boolean, error: string}
 */
function validateMaxLength(value, maxLength, fieldName = '필드') {
    if (value && value.length > maxLength) {
        return { valid: false, error: `${fieldName}은(는) ${maxLength}자 이하여야 합니다.` };
    }
    
    return { valid: true };
}

/**
 * 숫자 범위 검증
 * @param {number} value - 검증할 값
 * @param {number} min - 최소값
 * @param {number} max - 최대값
 * @param {string} fieldName - 필드명
 * @returns {Object} {valid: boolean, error: string}
 */
function validateRange(value, min, max, fieldName = '필드') {
    const num = Number(value);
    
    if (isNaN(num)) {
        return { valid: false, error: `${fieldName}은(는) 숫자여야 합니다.` };
    }
    
    if (num < min || num > max) {
        return { valid: false, error: `${fieldName}은(는) ${min}에서 ${max} 사이여야 합니다.` };
    }
    
    return { valid: true };
}

/**
 * 전화번호 검증
 * @param {string} phone - 검증할 전화번호
 * @returns {Object} {valid: boolean, error: string}
 */
function validatePhone(phone) {
    if (!phone) {
        return { valid: false, error: '전화번호를 입력해주세요.' };
    }
    
    // 숫자만 추출
    const numbersOnly = phone.replace(/[^0-9]/g, '');
    
    // 한국 전화번호 형식 (10-11자리)
    if (numbersOnly.length < 10 || numbersOnly.length > 11) {
        return { valid: false, error: '올바른 전화번호 형식이 아닙니다.' };
    }
    
    return { valid: true };
}

/**
 * URL 검증
 * @param {string} url - 검증할 URL
 * @returns {Object} {valid: boolean, error: string}
 */
function validateUrl(url) {
    if (!url) {
        return { valid: false, error: 'URL을 입력해주세요.' };
    }
    
    try {
        new URL(url);
        return { valid: true };
    } catch {
        return { valid: false, error: '올바른 URL 형식이 아닙니다.' };
    }
}

/**
 * 정규식 검증
 * @param {string} value - 검증할 값
 * @param {RegExp} pattern - 정규식 패턴
 * @param {string} errorMessage - 에러 메시지
 * @returns {Object} {valid: boolean, error: string}
 */
function validatePattern(value, pattern, errorMessage = '올바른 형식이 아닙니다.') {
    if (!value) {
        return { valid: false, error: errorMessage };
    }
    
    if (!pattern.test(value)) {
        return { valid: false, error: errorMessage };
    }
    
    return { valid: true };
}

/**
 * 폼 전체 검증
 * @param {string} formId - 폼 ID
 * @param {Object} rules - 검증 규칙 객체
 * @returns {Object} {valid: boolean, errors: Object}
 * 
 * @example
 * const rules = {
 *   email: [
 *     { validator: validateRequired, args: ['이메일'] },
 *     { validator: validateEmail }
 *   ],
 *   password: [
 *     { validator: validateRequired, args: ['비밀번호'] },
 *     { validator: validateMinLength, args: [8, '비밀번호'] }
 *   ]
 * };
 */
function validateForm(formId, rules) {
    const form = document.getElementById(formId);
    if (!form) {
        console.warn(`Form not found: ${formId}`);
        return { valid: false, errors: { form: '폼을 찾을 수 없습니다.' } };
    }
    
    const errors = {};
    let isValid = true;
    
    Object.keys(rules).forEach(fieldName => {
        const fieldRules = rules[fieldName];
        const field = form.elements[fieldName];
        
        if (!field) {
            console.warn(`Field not found: ${fieldName}`);
            return;
        }
        
        const value = field.value;
        
        // 각 규칙 검증
        for (let rule of fieldRules) {
            const { validator, args = [] } = rule;
            const result = validator(value, ...args);
            
            if (!result.valid) {
                errors[fieldName] = result.error;
                isValid = false;
                break; // 첫 번째 에러만 표시
            }
        }
    });
    
    return { valid: isValid, errors };
}

/**
 * 검증 에러 표시
 * @param {string} formId - 폼 ID
 * @param {Object} errors - 에러 객체 {fieldName: errorMessage}
 */
function displayValidationErrors(formId, errors) {
    const form = document.getElementById(formId);
    if (!form) return;
    
    // 기존 에러 메시지 제거
    form.querySelectorAll('.validation-error').forEach(el => el.remove());
    
    // 새 에러 메시지 표시
    Object.keys(errors).forEach(fieldName => {
        const field = form.elements[fieldName];
        if (!field) return;
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'validation-error text-red-600 text-sm mt-1';
        errorDiv.textContent = errors[fieldName];
        
        field.parentElement.appendChild(errorDiv);
        field.classList.add('border-red-500');
    });
}

/**
 * 검증 에러 제거
 * @param {string} formId - 폼 ID
 */
function clearValidationErrors(formId) {
    const form = document.getElementById(formId);
    if (!form) return;
    
    form.querySelectorAll('.validation-error').forEach(el => el.remove());
    form.querySelectorAll('.border-red-500').forEach(el => {
        el.classList.remove('border-red-500');
    });
}

/**
 * 실시간 검증 설정
 * @param {string} formId - 폼 ID
 * @param {Object} rules - 검증 규칙
 */
function setupLiveValidation(formId, rules) {
    const form = document.getElementById(formId);
    if (!form) return;
    
    Object.keys(rules).forEach(fieldName => {
        const field = form.elements[fieldName];
        if (!field) return;
        
        field.addEventListener('blur', function() {
            const fieldRules = rules[fieldName];
            const value = this.value;
            
            // 기존 에러 제거
            const existingError = this.parentElement.querySelector('.validation-error');
            if (existingError) existingError.remove();
            this.classList.remove('border-red-500');
            
            // 검증
            for (let rule of fieldRules) {
                const { validator, args = [] } = rule;
                const result = validator(value, ...args);
                
                if (!result.valid) {
                    const errorDiv = document.createElement('div');
                    errorDiv.className = 'validation-error text-red-600 text-sm mt-1';
                    errorDiv.textContent = result.error;
                    this.parentElement.appendChild(errorDiv);
                    this.classList.add('border-red-500');
                    break;
                }
            }
        });
    });
}

// 전역 스코프에 노출
window.validateEmail = validateEmail;
window.validatePassword = validatePassword;
window.validatePasswordConfirm = validatePasswordConfirm;
window.validateRequired = validateRequired;
window.validateMinLength = validateMinLength;
window.validateMaxLength = validateMaxLength;
window.validateRange = validateRange;
window.validatePhone = validatePhone;
window.validateUrl = validateUrl;
window.validatePattern = validatePattern;
window.validateForm = validateForm;
window.displayValidationErrors = displayValidationErrors;
window.clearValidationErrors = clearValidationErrors;
window.setupLiveValidation = setupLiveValidation;
