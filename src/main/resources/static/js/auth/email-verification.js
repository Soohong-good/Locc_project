/**
 * 이메일 인증 기능
 */

let emailVerified = false;
let verificationTimer = null;
let cooldownTimer = null;

/**
 * 이메일 인증 코드 발송
 */
async function sendVerificationCode() {
    const email = document.getElementById('email').value;
    
    if (!email) {
        alert('이메일을 입력해주세요.');
        return;
    }
    
    if (!validateEmail(email)) {
        alert('올바른 이메일 형식이 아닙니다.');
        return;
    }
    
    const sendButton = document.getElementById('sendCodeBtn');
    const codeSection = document.getElementById('verificationCodeSection');
    
    try {
        sendButton.disabled = true;
        sendButton.textContent = '발송 중...';
        
        const response = await fetch('/api/auth/email/send-code', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email })
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert(data.message);
            codeSection.classList.remove('hidden');
            startVerificationTimer();
            startCooldownTimer();
        } else {
            alert(data.message);
            // 쿨다운 체크
            checkCooldown();
        }
        
    } catch (error) {
        console.error('인증 코드 발송 실패:', error);
        alert('인증 코드 발송에 실패했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
        sendButton.disabled = false;
        sendButton.textContent = '인증 코드 발송';
    }
}

/**
 * 인증 코드 검증
 */
async function verifyCode() {
    const email = document.getElementById('email').value;
    const code = document.getElementById('verificationCode').value;
    
    if (!code || code.length !== 6) {
        alert('6자리 인증 코드를 입력해주세요.');
        return;
    }
    
    const verifyButton = document.getElementById('verifyCodeBtn');
    
    try {
        verifyButton.disabled = true;
        verifyButton.textContent = '확인 중...';
        
        const response = await fetch('/api/auth/email/verify-code', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, code })
        });
        
        const data = await response.json();
        
        if (data.success) {
            emailVerified = true;
            alert(data.message);
            
            // UI 업데이트
            document.getElementById('verificationCodeSection').classList.add('hidden');
            document.getElementById('emailVerifiedBadge').classList.remove('hidden');
            document.getElementById('email').readOnly = true;
            document.getElementById('sendCodeBtn').disabled = true;
            
            // 타이머 정지
            stopVerificationTimer();
            
        } else {
            emailVerified = false;
            alert(data.message);
        }
        
    } catch (error) {
        console.error('인증 코드 검증 실패:', error);
        alert('인증 코드 검증에 실패했습니다.');
    } finally {
        verifyButton.disabled = false;
        verifyButton.textContent = '확인';
    }
}

/**
 * 인증 시간 타이머 시작 (5분)
 */
function startVerificationTimer() {
    let seconds = 300; // 5분
    const timerElement = document.getElementById('verificationTimer');
    
    stopVerificationTimer(); // 기존 타이머 정지
    
    verificationTimer = setInterval(() => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        timerElement.textContent = `${minutes}:${secs.toString().padStart(2, '0')}`;
        
        if (seconds <= 0) {
            stopVerificationTimer();
            timerElement.textContent = '시간 만료';
            document.getElementById('verificationCode').disabled = true;
            document.getElementById('verifyCodeBtn').disabled = true;
        }
        
        seconds--;
    }, 1000);
}

/**
 * 인증 타이머 정지
 */
function stopVerificationTimer() {
    if (verificationTimer) {
        clearInterval(verificationTimer);
        verificationTimer = null;
    }
}

/**
 * 재발송 쿨다운 타이머 시작 (1분)
 */
function startCooldownTimer() {
    const sendButton = document.getElementById('sendCodeBtn');
    let seconds = 60; // 1분
    
    stopCooldownTimer(); // 기존 타이머 정지
    
    sendButton.disabled = true;
    
    cooldownTimer = setInterval(() => {
        sendButton.textContent = `재발송 (${seconds}초)`;
        
        if (seconds <= 0) {
            stopCooldownTimer();
            sendButton.disabled = false;
            sendButton.textContent = '인증 코드 재발송';
        }
        
        seconds--;
    }, 1000);
}

/**
 * 쿨다운 타이머 정지
 */
function stopCooldownTimer() {
    if (cooldownTimer) {
        clearInterval(cooldownTimer);
        cooldownTimer = null;
    }
}

/**
 * 남은 쿨다운 시간 확인
 */
async function checkCooldown() {
    const email = document.getElementById('email').value;
    
    try {
        const response = await fetch(`/api/auth/email/cooldown?email=${encodeURIComponent(email)}`);
        const remainingSeconds = await response.json();
        
        if (remainingSeconds > 0) {
            startCooldownTimerWithRemaining(remainingSeconds);
        }
    } catch (error) {
        console.error('쿨다운 확인 실패:', error);
    }
}

/**
 * 남은 시간으로 쿨다운 타이머 시작
 */
function startCooldownTimerWithRemaining(remainingSeconds) {
    const sendButton = document.getElementById('sendCodeBtn');
    let seconds = remainingSeconds;
    
    stopCooldownTimer();
    
    sendButton.disabled = true;
    
    cooldownTimer = setInterval(() => {
        sendButton.textContent = `재발송 (${seconds}초)`;
        
        if (seconds <= 0) {
            stopCooldownTimer();
            sendButton.disabled = false;
            sendButton.textContent = '인증 코드 재발송';
        }
        
        seconds--;
    }, 1000);
}

/**
 * 이메일 유효성 검사
 */
function validateEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

/**
 * 인증 코드 입력란에서 숫자만 입력 가능하도록
 */
function validateCodeInput(input) {
    input.value = input.value.replace(/[^0-9]/g, '').slice(0, 6);
}

/**
 * 회원가입 폼 제출 전 이메일 인증 확인
 */
function checkEmailVerification() {
    if (!emailVerified) {
        alert('이메일 인증을 완료해주세요.');
        return false;
    }
    return true;
}
