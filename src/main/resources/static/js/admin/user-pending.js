/**
 * 승인 대기 회원 관리 페이지
 * admin/user/pending.html
 */

let currentUserId = null;

/**
 * 회원 상세 정보 모달 표시
 */
function showUserDetail(button) {
    const userId = button.dataset.userId;
    const userName = button.dataset.userName;
    const userEmail = button.dataset.userEmail;
    const userType = button.dataset.userType;
    const userGender = button.dataset.userGender;
    const userPhone = button.dataset.userPhone;
    const userAddress = button.dataset.userAddress;
    const userBirth = button.dataset.userBirth;
    const userPath = button.dataset.userPath;

    // 이메일 표시 처리 (임시 이메일 대응)
    let displayEmail = userEmail;
    if (userEmail.includes('@temp.local')) {
        displayEmail = '<span class="text-orange-600 italic">(소셜 로그인 - 추가 정보 입력 필요)</span>';
    } else {
        displayEmail = escapeHtml(userEmail);
    }

    // 교인 구분 텍스트 변환
    const userTypeText = userType === 'REGISTERED' ? '등록교인' : '미등록교인';
    
    // 성별 텍스트 변환
    const genderText = userGender === 'MALE' ? '남성' : userGender === 'FEMALE' ? '여성' : '기타';

    // 모달 내용 구성
    const content = `
        <div class="grid grid-cols-2 gap-4">
            <div>
                <label class="text-sm font-medium text-slate-600">이름</label>
                <p class="text-slate-900 mt-1">${escapeHtml(userName)}</p>
            </div>
            <div>
                <label class="text-sm font-medium text-slate-600">이메일</label>
                <p class="text-slate-900 mt-1">${displayEmail}</p>
            </div>
            <div>
                <label class="text-sm font-medium text-slate-600">교인 구분</label>
                <p class="text-slate-900 mt-1">${userTypeText}</p>
            </div>
            <div>
                <label class="text-sm font-medium text-slate-600">성별</label>
                <p class="text-slate-900 mt-1">${genderText}</p>
            </div>
            <div>
                <label class="text-sm font-medium text-slate-600">전화번호</label>
                <p class="text-slate-900 mt-1">${escapeHtml(userPhone || '-')}</p>
            </div>
            <div>
                <label class="text-sm font-medium text-slate-600">생년월일</label>
                <p class="text-slate-900 mt-1">${userBirth || '-'}</p>
            </div>
            <div class="col-span-2">
                <label class="text-sm font-medium text-slate-600">주소</label>
                <p class="text-slate-900 mt-1">${escapeHtml(userAddress || '-')}</p>
            </div>
            <div class="col-span-2">
                <label class="text-sm font-medium text-slate-600">등록 경로</label>
                <p class="text-slate-900 mt-1">${escapeHtml(userPath || '-')}</p>
            </div>
        </div>
    `;

    document.getElementById('modalContent').innerHTML = content;
    document.getElementById('detailModal').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

/**
 * 상세보기 모달 닫기
 */
function closeModal() {
    document.getElementById('detailModal').classList.add('hidden');
    document.body.style.overflow = '';
    currentUserId = null;
}

/**
 * 반려 모달 표시
 */
function showRejectModal() {
    if (!currentUserId) {
        alert('회원 정보를 불러올 수 없습니다.');
        return;
    }
    
    document.getElementById('rejectModal').classList.remove('hidden');
}

/**
 * 반려 모달 닫기
 */
function closeRejectModal() {
    document.getElementById('rejectModal').classList.add('hidden');
    document.getElementById('rejectReason').value = '';
}

/**
 * 회원 승인
 */
async function approveUser() {
    if (!currentUserId) {
        alert('회원 정보를 불러올 수 없습니다.');
        return;
    }

    if (!confirm('이 회원을 승인하시겠습니까?')) {
        return;
    }

    try {
        const response = await fetch(`/api/admin/users/${currentUserId}/approve`, {
            method: 'POST',
            headers: getAuthHeaders()
        });

        if (handleAuthError(response)) return;

        if (response.ok) {
            alert('회원이 승인되었습니다.');
            closeModal();
            location.reload();
        } else {
            const error = await response.json().catch(() => ({ message: '승인에 실패했습니다.' }));
            alert(error.message || '승인에 실패했습니다.');
        }
    } catch (error) {
        console.error('승인 처리 실패:', error);
        alert('승인 처리 중 오류가 발생했습니다.');
    }
}

/**
 * 회원 반려
 */
async function rejectUser() {
    if (!currentUserId) {
        alert('회원 정보를 불러올 수 없습니다.');
        return;
    }

    const reason = document.getElementById('rejectReason').value.trim();
    if (!reason) {
        alert('반려 사유를 입력해주세요.');
        return;
    }

    if (!confirm('이 회원을 반려하시겠습니까?')) {
        return;
    }

    try {
        const response = await fetch(`/api/admin/users/${currentUserId}/reject?reason=${encodeURIComponent(reason)}`, {
            method: 'POST',
            headers: getAuthHeaders()
        });

        if (handleAuthError(response)) return;

        if (response.ok) {
            alert('회원이 반려되었습니다.');
            closeRejectModal();
            closeModal();
            location.reload();
        } else {
            const error = await response.json().catch(() => ({ message: '반려에 실패했습니다.' }));
            alert(error.message || '반려에 실패했습니다.');
        }
    } catch (error) {
        console.error('반려 처리 실패:', error);
        alert('반려 처리 중 오류가 발생했습니다.');
    }
}

/**
 * HTML 이스케이프
 */
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 모달 외부 클릭 시 닫기
window.addEventListener('click', function(event) {
    const detailModal = document.getElementById('detailModal');
    const rejectModal = document.getElementById('rejectModal');
    
    if (event.target === detailModal) {
        closeModal();
    }
    if (event.target === rejectModal) {
        closeRejectModal();
    }
});

// ESC 키로 모달 닫기
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeModal();
        closeRejectModal();
    }
});
