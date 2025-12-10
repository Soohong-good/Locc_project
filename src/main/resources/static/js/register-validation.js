// ============================================
// 회원가입 폼 유효성 검사 스크립트
// ============================================

// 유효성 검사 상태 저장
const validationState = {
    registered: {
        email: false,
        password: false,
        passwordConfirm: false,
        name: false,
        gender: false,
        phoneNumber: false
    },
    unregistered: {
        email: false,
        password: false,
        passwordConfirm: false,
        name: false,
        gender: false,
        phoneNumber: false,
        registrationPath: false
    }
};

// ============================================
// 유효성 검사 함수들
// ============================================

// 이메일 형식 검사
function validateEmailFormat(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// 비밀번호 강도 검사
function validatePasswordStrength(password) {
    const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return re.test(password);
}

// 이메일 중복 체크 (비동기)
async function checkEmailDuplicate(email) {
    try {
        const response = await fetch(`/api/auth/check-email?email=${encodeURIComponent(email)}`);
        return await response.json(); // true면 사용 가능, false면 중복
    } catch (error) {
        console.error('Email check error:', error);
        return false;
    }
}

// ============================================
// 피드백 표시 함수들
// ============================================

function showSuccess(inputId, feedbackId, message) {
    const input = document.getElementById(inputId);
    const feedback = document.getElementById(feedbackId);
    
    input.classList.remove('border-slate-300', 'border-red-500');
    input.classList.add('border-blue-500');
    
    feedback.textContent = message;
    feedback.className = 'mt-1 text-xs text-blue-600';
    feedback.classList.remove('hidden');
}

function showError(inputId, feedbackId, message) {
    const input = document.getElementById(inputId);
    const feedback = document.getElementById(feedbackId);
    
    input.classList.remove('border-slate-300', 'border-blue-500');
    input.classList.add('border-red-500');
    
    feedback.textContent = message;
    feedback.className = 'mt-1 text-xs text-red-600';
    feedback.classList.remove('hidden');
}

function clearFeedback(inputId, feedbackId) {
    const input = document.getElementById(inputId);
    const feedback = document.getElementById(feedbackId);
    
    input.classList.remove('border-blue-500', 'border-red-500');
    input.classList.add('border-slate-300');
    
    feedback.classList.add('hidden');
}

// ============================================
// 개별 필드 유효성 검사
// ============================================

async function validateEmailField(type) {
    const emailInput = document.getElementById(`email-${type}`);
    const email = emailInput.value.trim();
    const feedbackId = `email-${type}-feedback`;
    
    if (!email) {
        showError(`email-${type}`, feedbackId, '이메일을 입력해주세요.');
        validationState[type].email = false;
        return false;
    }
    
    if (!validateEmailFormat(email)) {
        showError(`email-${type}`, feedbackId, '올바른 이메일 형식이 아닙니다.');
        validationState[type].email = false;
        return false;
    }
    
    // 이메일 중복 체크
    const isAvailable = await checkEmailDuplicate(email);
    if (!isAvailable) {
        showError(`email-${type}`, feedbackId, '이미 사용중인 이메일입니다.');
        validationState[type].email = false;
        return false;
    }
    
    showSuccess(`email-${type}`, feedbackId, '사용 가능한 이메일입니다.');
    validationState[type].email = true;
    return true;
}

function validatePasswordField(type) {
    const passwordInput = document.getElementById(`password-${type}`);
    const password = passwordInput.value;
    const feedbackId = `password-${type}-feedback`;
    
    if (!password) {
        showError(`password-${type}`, feedbackId, '비밀번호를 입력해주세요.');
        validationState[type].password = false;
        return false;
    }
    
    if (!validatePasswordStrength(password)) {
        showError(`password-${type}`, feedbackId, '8자 이상의 대소문자, 숫자, 특수문자를 포함해야 합니다.');
        validationState[type].password = false;
        return false;
    }
    
    showSuccess(`password-${type}`, feedbackId, '사용 가능한 비밀번호입니다.');
    validationState[type].password = true;
    
    // 비밀번호 확인 필드도 체크
    const passwordConfirmInput = document.getElementById(`passwordConfirm-${type}`);
    if (passwordConfirmInput && passwordConfirmInput.value) {
        validatePasswordConfirmField(type);
    }
    
    return true;
}

function validatePasswordConfirmField(type) {
    const passwordInput = document.getElementById(`password-${type}`);
    const passwordConfirmInput = document.getElementById(`passwordConfirm-${type}`);
    const password = passwordInput.value;
    const passwordConfirm = passwordConfirmInput.value;
    const feedbackId = `passwordConfirm-${type}-feedback`;
    
    if (!passwordConfirm) {
        showError(`passwordConfirm-${type}`, feedbackId, '비밀번호 확인을 입력해주세요.');
        validationState[type].passwordConfirm = false;
        return false;
    }
    
    if (password !== passwordConfirm) {
        showError(`passwordConfirm-${type}`, feedbackId, '비밀번호가 일치하지 않습니다.');
        validationState[type].passwordConfirm = false;
        return false;
    }
    
    showSuccess(`passwordConfirm-${type}`, feedbackId, '비밀번호가 일치합니다.');
    validationState[type].passwordConfirm = true;
    return true;
}

function validateNameField(type) {
    const nameInput = document.getElementById(`name-${type}`);
    const name = nameInput.value.trim();
    const feedbackId = `name-${type}-feedback`;
    
    if (!name) {
        showError(`name-${type}`, feedbackId, '이름을 입력해주세요.');
        validationState[type].name = false;
        return false;
    }
    
    showSuccess(`name-${type}`, feedbackId, '');
    clearFeedback(`name-${type}`, feedbackId);
    validationState[type].name = true;
    return true;
}

function validateGenderField(type) {
    const genderSelect = document.getElementById(`gender-${type}`);
    const gender = genderSelect.value;
    const feedbackId = `gender-${type}-feedback`;
    
    if (!gender) {
        showError(`gender-${type}`, feedbackId, '성별을 선택해주세요.');
        validationState[type].gender = false;
        return false;
    }
    
    showSuccess(`gender-${type}`, feedbackId, '');
    clearFeedback(`gender-${type}`, feedbackId);
    validationState[type].gender = true;
    return true;
}

function validatePhoneNumberField(type) {
    const phoneInput = document.getElementById(`phoneNumber-${type}`);
    const phone = phoneInput.value.trim();
    const feedbackId = `phoneNumber-${type}-feedback`;
    
    if (!phone) {
        showError(`phoneNumber-${type}`, feedbackId, '전화번호를 입력해주세요.');
        validationState[type].phoneNumber = false;
        return false;
    }
    
    showSuccess(`phoneNumber-${type}`, feedbackId, '');
    clearFeedback(`phoneNumber-${type}`, feedbackId);
    validationState[type].phoneNumber = true;
    return true;
}

function validateRegistrationPathField() {
    const textarea = document.getElementById('registrationPath-unregistered');
    const value = textarea.value.trim();
    const feedbackId = 'registrationPath-unregistered-feedback';
    
    if (!value) {
        showError('registrationPath-unregistered', feedbackId, '가입 경로를 입력해주세요.');
        validationState.unregistered.registrationPath = false;
        return false;
    }
    
    clearFeedback('registrationPath-unregistered', feedbackId);
    validationState.unregistered.registrationPath = true;
    return true;
}

// ============================================
// 전체 폼 유효성 검사
// ============================================

async function validateAllFields(type) {
    const results = await Promise.all([
        validateEmailField(type),
        validatePasswordField(type),
        validatePasswordConfirmField(type),
        validateNameField(type),
        validateGenderField(type),
        validatePhoneNumberField(type)
    ]);
    
    if (type === 'unregistered') {
        results.push(validateRegistrationPathField());
    }
    
    return results.every(result => result === true);
}

// ============================================
// 이벤트 리스너 등록
// ============================================

function setupValidationListeners(type) {
    const emailInput = document.getElementById(`email-${type}`);
    const passwordInput = document.getElementById(`password-${type}`);
    const passwordConfirmInput = document.getElementById(`passwordConfirm-${type}`);
    const nameInput = document.getElementById(`name-${type}`);
    const genderSelect = document.getElementById(`gender-${type}`);
    const phoneInput = document.getElementById(`phoneNumber-${type}`);
    
    // 실시간 검증 (blur 이벤트)
    emailInput?.addEventListener('blur', () => validateEmailField(type));
    passwordInput?.addEventListener('input', () => validatePasswordField(type));
    passwordConfirmInput?.addEventListener('input', () => validatePasswordConfirmField(type));
    nameInput?.addEventListener('blur', () => validateNameField(type));
    genderSelect?.addEventListener('change', () => validateGenderField(type));
    phoneInput?.addEventListener('blur', () => validatePhoneNumberField(type));
    
    if (type === 'unregistered') {
        const registrationPathTextarea = document.getElementById('registrationPath-unregistered');
        registrationPathTextarea?.addEventListener('blur', () => validateRegistrationPathField());
    }
}

// ============================================
// 초기화
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    setupValidationListeners('registered');
    setupValidationListeners('unregistered');
});
