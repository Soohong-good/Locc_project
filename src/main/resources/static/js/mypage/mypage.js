// ============================================
// 마이페이지 스크립트
// ============================================

// 탭 전환
function switchTab(tabName) {
    // 모든 탭 버튼 비활성화
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('border-blue-600', 'text-blue-600');
        btn.classList.add('border-transparent', 'text-slate-600');
    });

    // 모든 탭 컨텐츠 숨기기
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.add('hidden');
    });

    // 선택한 탭 활성화
    const selectedBtn = document.getElementById(`tab-${tabName}`);
    const selectedContent = document.getElementById(`content-${tabName}`);

    if (selectedBtn && selectedContent) {
        selectedBtn.classList.remove('border-transparent', 'text-slate-600');
        selectedBtn.classList.add('border-blue-600', 'text-blue-600');
        selectedContent.classList.remove('hidden');
    }
}

// ============================================
// 프로필 수정
// ============================================

document.getElementById('profileForm')?.addEventListener('submit', async function(e) {
    e.preventDefault();

    const formData = {
        name: document.getElementById('name').value.trim(),
        gender: document.getElementById('gender').value,
        phoneNumber: document.getElementById('phoneNumber').value.trim(),
        birth: document.getElementById('birth').value || null,
        address: document.getElementById('address').value.trim()
    };

    // 유효성 검사
    if (!formData.name) {
        showError('name', 'name-feedback', '이름을 입력해주세요.');
        return;
    }

    try {
        const token = localStorage.getItem('accessToken');
        const response = await fetch('/api/mypage/profile', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (response.ok) {
            alert(data.message);
            location.reload();
        } else {
            alert(data.message || '프로필 수정에 실패했습니다.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('프로필 수정 중 오류가 발생했습니다.');
    }
});

// ============================================
// 비밀번호 변경
// ============================================

// 비밀번호 강도 검사
function validatePasswordStrength(password) {
    const re = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&#^()_+\-=\[\]{};':"\\|,.<>\/])[A-Za-z\d@$!%*?&#^()_+\-=\[\]{};':"\\|,.<>\/]{8,}$/;
    return re.test(password);
}

document.getElementById('passwordForm')?.addEventListener('submit', async function(e) {
    e.preventDefault();

    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const newPasswordConfirm = document.getElementById('newPasswordConfirm').value;

    // 유효성 검사
    if (!currentPassword) {
        showError('currentPassword', 'currentPassword-feedback', '현재 비밀번호를 입력해주세요.');
        return;
    }

    if (!newPassword) {
        showError('newPassword', 'newPassword-feedback', '새 비밀번호를 입력해주세요.');
        return;
    }

    if (!validatePasswordStrength(newPassword)) {
        showError('newPassword', 'newPassword-feedback', '8자 이상의 영문, 숫자, 특수문자를 포함해야 합니다.');
        return;
    }

    if (newPassword !== newPasswordConfirm) {
        showError('newPasswordConfirm', 'newPasswordConfirm-feedback', '새 비밀번호가 일치하지 않습니다.');
        return;
    }

    try {
        const token = localStorage.getItem('accessToken');
        const response = await fetch('/api/mypage/password', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                currentPassword,
                newPassword,
                newPasswordConfirm
            })
        });

        const data = await response.json();

        if (response.ok) {
            alert(data.message);
            // 폼 초기화
            document.getElementById('passwordForm').reset();
            switchTab('info');
        } else {
            alert(data.message || '비밀번호 변경에 실패했습니다.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('비밀번호 변경 중 오류가 발생했습니다.');
    }
});

// ============================================
// 피드백 표시 함수
// ============================================

function showError(inputId, feedbackId, message) {
    const input = document.getElementById(inputId);
    const feedback = document.getElementById(feedbackId);

    if (input && feedback) {
        input.classList.add('border-red-500');
        feedback.textContent = message;
        feedback.classList.remove('hidden');
    }
}

function clearError(inputId, feedbackId) {
    const input = document.getElementById(inputId);
    const feedback = document.getElementById(feedbackId);

    if (input && feedback) {
        input.classList.remove('border-red-500');
        feedback.classList.add('hidden');
    }
}

// 입력 시 에러 제거
document.querySelectorAll('input').forEach(input => {
    input.addEventListener('input', function() {
        const feedbackId = this.id + '-feedback';
        clearError(this.id, feedbackId);
    });
});

// ============================================
// 페이지 로드 시 초기화
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    // 첫 번째 탭 활성화
    switchTab('info');
});
