/**
 * 회원가입 페이지 JavaScript
 */

let selectedUserType = null;

// 이메일 인증 상태 (타입별)
let emailVerifiedStatus = {
    'registered': false,
    'unregistered': false
};

// 타입별 이메일 인증 코드 발송
async function sendVerificationCodeForType(type) {
    const emailInput = document.getElementById(`email-${type}`);
    const email = emailInput ? emailInput.value.trim() : '';
    
    console.log('[이메일 인증] 시작 - 타입:', type, '이메일:', email);

    if (!email) {
        alert('이메일을 입력해주세요.');
        return;
    }

    // 이메일 형식 검증
    console.log('[이메일 인증] 형식 검증 중...');
    if (typeof validateEmailFormat !== 'function') {
        console.error('[이메일 인증] validateEmailFormat 함수가 정의되지 않음');
        alert('시스템 오류가 발생했습니다. 페이지를 새로고침해주세요.');
        return;
    }
    
    if (!validateEmailFormat(email)) {
        console.log('[이메일 인증] 형식 검증 실패:', email);
        alert('올바른 이메일 형식이 아닙니다.');
        return;
    }
    console.log('[이메일 인증] 형식 검증 통과');

    // 이메일 중복 체크
    console.log('[이메일 인증] 중복 체크 시작...');
    if (typeof checkEmailDuplicate !== 'function') {
        console.error('[이메일 인증] checkEmailDuplicate 함수가 정의되지 않음');
        alert('시스템 오류가 발생했습니다. 페이지를 새로고침해주세요.');
        return;
    }
    
    try {
        const checkResult = await checkEmailDuplicate(email);
        console.log('[이메일 인증] 중복 체크 결과:', checkResult);
        
        if (!checkResult) {
            console.log('[이메일 인증] 중복된 이메일:', email);
            alert('이미 사용중인 이메일입니다.');
            const feedbackId = `email-${type}-feedback`;
            if (typeof showError === 'function') {
                showError(`email-${type}`, feedbackId, '이미 사용중인 이메일입니다.');
            }
            return;
        }
        console.log('[이메일 인증] 중복 체크 통과 - 사용 가능한 이메일');
    } catch (error) {
        console.error('[이메일 인증] 중복 체크 중 오류:', error);
        alert('이메일 중복 확인에 실패했습니다. 다시 시도해주세요.');
        return;
    }

    const sendButton = document.getElementById(`sendCodeBtn-${type}`);
    const codeSection = document.getElementById(`verificationCodeSection-${type}`);

    try {
        sendButton.disabled = true;
        sendButton.textContent = '발송 중...';
        
        console.log('[이메일 인증] 인증 코드 발송 요청 중...');

        const response = await fetch('/api/auth/email/send-code', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email })
        });

        const data = await response.json();
        console.log('[이메일 인증] 인증 코드 발송 응답:', data);

        if (data.success) {
            alert(data.message);
            codeSection.classList.remove('hidden');
            startVerificationTimerForType(type);
            
            // 중복 체크 성공 피드백 표시
            const feedbackId = `email-${type}-feedback`;
            if (typeof showSuccess === 'function') {
                showSuccess(`email-${type}`, feedbackId, '사용 가능한 이메일입니다.');
            }
        } else {
            alert(data.message);
        }

    } catch (error) {
        console.error('[이메일 인증] 코드 발송 실패:', error);
        alert('인증 코드 발송에 실패했습니다.');
    } finally {
        sendButton.disabled = false;
        sendButton.textContent = '인증 코드 발송';
    }
}

// 타입별 인증 코드 검증
async function verifyCodeForType(type) {
    const email = document.getElementById(`email-${type}`).value;
    const code = document.getElementById(`verificationCode-${type}`).value;

    if (!code || code.length !== 6) {
        alert('6자리 인증 코드를 입력해주세요.');
        return;
    }

    try {
        const response = await fetch('/api/auth/email/verify-code', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, code })
        });

        const data = await response.json();

        if (data.success) {
            emailVerifiedStatus[type] = true;
            alert(data.message);

            document.getElementById(`verificationCodeSection-${type}`).classList.add('hidden');
            document.getElementById(`emailVerifiedBadge-${type}`).classList.remove('hidden');
            document.getElementById(`email-${type}`).readOnly = true;
            document.getElementById(`sendCodeBtn-${type}`).disabled = true;
        } else {
            alert(data.message);
        }

    } catch (error) {
        console.error('인증 코드 검증 실패:', error);
        alert('인증 코드 검증에 실패했습니다.');
    }
}

// 타입별 타이머
function startVerificationTimerForType(type) {
    let seconds = 300;
    const timerElement = document.getElementById(`verificationTimer-${type}`);

    const timer = setInterval(() => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        timerElement.textContent = `${minutes}:${secs.toString().padStart(2, '0')}`;

        if (seconds <= 0) {
            clearInterval(timer);
            timerElement.textContent = '시간 만료';
        }

        seconds--;
    }, 1000);
}

// 이용약관 모달 열기/닫기
function openTermsModal() {
    document.getElementById('termsModal').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeTermsModal() {
    document.getElementById('termsModal').classList.add('hidden');
    document.body.style.overflow = '';
}

// ESC 키로 모달 닫기
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeTermsModal();
    }
});

// 1단계: 교인 구분 선택
function selectUserType(type) {
    selectedUserType = type;
    goToStep(2, type);
}

// 단계 이동
function goToStep(step, type = null) {
    if (step === 1) {
        document.querySelectorAll('.step-container').forEach(el => el.classList.add('hidden'));
        document.getElementById('step1').classList.remove('hidden');
    } else if (step === 2) {
        document.querySelectorAll('.step-container').forEach(el => el.classList.add('hidden'));
        const userType = type || selectedUserType;
        if (userType === 'REGISTERED') {
            document.getElementById('step2-registered').classList.remove('hidden');
        } else {
            document.getElementById('step2-unregistered').classList.remove('hidden');
        }
    } else if (step === 3) {
        const userType = type || selectedUserType;

        // 필수 동의 체크
        const consentClass = userType === 'REGISTERED' ? 'consent-registered' : 'consent-unregistered';
        const requiredConsents = document.querySelectorAll(`.${consentClass}[required]`);
        const allChecked = Array.from(requiredConsents).every(cb => cb.checked);

        if (!allChecked) {
            alert('필수 항목에 모두 동의해주세요.');
            return;
        }

        document.querySelectorAll('.step-container').forEach(el => el.classList.add('hidden'));
        if (userType === 'REGISTERED') {
            document.getElementById('step3-registered').classList.remove('hidden');
        } else {
            document.getElementById('step3-unregistered').classList.remove('hidden');
        }
    }

    // 페이지 상단으로 스크롤
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// 전체 동의 토글
function toggleAllConsents(type) {
    const agreeAllCheckbox = document.getElementById(`agreeAll-${type}`);
    const consentCheckboxes = document.querySelectorAll(`.consent-${type}`);

    consentCheckboxes.forEach(cb => {
        cb.checked = agreeAllCheckbox.checked;
    });
}

// 개별 체크박스 변경 시 전체 동의 상태 업데이트
document.addEventListener('change', function(e) {
    if (e.target.classList.contains('consent-registered')) {
        updateAgreeAll('registered');
    } else if (e.target.classList.contains('consent-unregistered')) {
        updateAgreeAll('unregistered');
    }
});

function updateAgreeAll(type) {
    const agreeAllCheckbox = document.getElementById(`agreeAll-${type}`);
    const consentCheckboxes = document.querySelectorAll(`.consent-${type}`);
    const allChecked = Array.from(consentCheckboxes).every(cb => cb.checked);

    agreeAllCheckbox.checked = allChecked;
}

// Daum 주소 API
function execDaumPostcode(type) {
    new daum.Postcode({
        oncomplete: function(data) {
            const postcodeInput = document.getElementById(`postcode-${type}`);
            const addressInput = document.getElementById(`address-${type}`);

            postcodeInput.value = data.zonecode;
            addressInput.value = data.roadAddress;
        }
    }).open();
}

// 회원가입 제출
async function submitRegistration(formType, userType) {
    // 이메일 인증 확인
    if (!emailVerifiedStatus[formType]) {
        alert('이메일 인증을 완료해주세요.');
        return;
    }

    const form = document.getElementById(`registerForm-${formType}`);
    const errorDiv = document.getElementById(`errorMessage-${formType}`);
    const successDiv = document.getElementById(`successMessage-${formType}`);

    errorDiv.classList.add('hidden');
    successDiv.classList.add('hidden');

    const formData = new FormData(form);

    // 주소 조합 (도로명주소 + 상세주소)
    let fullAddress = null;
    const roadAddress = formData.get('roadAddress');
    const detailAddress = formData.get('detailAddress');

    if (roadAddress) {
        fullAddress = roadAddress;
        if (detailAddress) {
            fullAddress += ', ' + detailAddress;
        }
    }

    const data = {
        email: formData.get('email'),
        password: formData.get('password'),
        name: formData.get('name'),
        userType: userType,
        gender: formData.get('gender') || null,
        phoneNumber: formData.get('phoneNumber') || null,
        birth: formData.get('birth') || null,
        address: fullAddress,
        registrationPath: formData.get('registrationPath') || null,
        // 약관 동의 추가 (2단계에서 체크했으므로 true)
        agreedToTerms: true,
        agreedToPrivacy: true,
        agreedToMarketing: false
    };

    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            const result = await response.json();

            // 회원가입 완료 페이지로 리다이렉트
            const email = encodeURIComponent(data.email);
            window.location.href = `/auth/register-complete?email=${email}`;
        } else {
            const error = await response.json();
            errorDiv.textContent = error.message || '회원가입에 실패했습니다.';
            errorDiv.classList.remove('hidden');
        }
    } catch (error) {
        console.error('Register error:', error);
        errorDiv.textContent = '회원가입 중 오류가 발생했습니다.';
        errorDiv.classList.remove('hidden');
    }
}

// DOMContentLoaded 이벤트 리스너
document.addEventListener('DOMContentLoaded', function() {
    // 등록교인 회원가입
    const registeredForm = document.getElementById('registerForm-registered');
    if (registeredForm) {
        registeredForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            // 유효성 검사 실행
            const isValid = await validateAllFields('registered');
            if (!isValid) {
                return;
            }

            await submitRegistration('registered', 'REGISTERED');
        });
    }

    // 미등록교인 회원가입
    const unregisteredForm = document.getElementById('registerForm-unregistered');
    if (unregisteredForm) {
        unregisteredForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            // 유효성 검사 실행
            const isValid = await validateAllFields('unregistered');
            if (!isValid) {
                return;
            }

            await submitRegistration('unregistered', 'UNREGISTERED');
        });
    }

    // 글자 수 카운터 (미등록교인 가입 경로)
    const registrationPathTextarea = document.querySelector('#registerForm-unregistered textarea[name="registrationPath"]');
    const charCountSpan = document.getElementById('charCount-unregistered');

    if (registrationPathTextarea && charCountSpan) {
        registrationPathTextarea.addEventListener('input', function() {
            charCountSpan.textContent = this.value.length;
        });
    }
});
