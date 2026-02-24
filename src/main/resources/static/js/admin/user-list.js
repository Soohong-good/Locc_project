/**
 * 관리자 - 전체 회원 관리 페이지
 */

let currentUserId = null;
let currentUserEnabled = null;

/**
 * 회원 상세 정보 모달 표시
 */
function showUserDetail(button) {
    const userId = button.getAttribute('data-user-id');
    const userName = button.getAttribute('data-user-name');
    const userEmail = button.getAttribute('data-user-email');
    const userType = button.getAttribute('data-user-type');
    const userRole = button.getAttribute('data-user-role');
    const userStatus = button.getAttribute('data-user-status');
    const userGender = button.getAttribute('data-user-gender');
    const userPhone = button.getAttribute('data-user-phone');
    const userAddress = button.getAttribute('data-user-address');
    const userBirth = button.getAttribute('data-user-birth');
    const userPath = button.getAttribute('data-user-path');
    const userRejection = button.getAttribute('data-user-rejection');
    const userEnabled = button.getAttribute('data-user-enabled') === 'true';

    // 교인 구분 텍스트
    const userTypeText = userType === 'REGISTERED' ? '등록교인' : '미등록교인';
    
    // 권한 텍스트
    const userRoleText = userRole === 'ADMIN' ? '관리자' : '일반';
    
    // 승인 상태 텍스트
    let statusText = '';
    let statusClass = '';
    if (userStatus === 'APPROVED') {
        statusText = '승인';
        statusClass = 'bg-green-100 text-green-800';
    } else if (userStatus === 'PENDING') {
        statusText = '승인 대기';
        statusClass = 'bg-yellow-100 text-yellow-800';
    } else if (userStatus === 'REJECTED') {
        statusText = '반려';
        statusClass = 'bg-red-100 text-red-800';
    }

    // 계정 상태
    const enabledText = userEnabled ? '활성' : '차단됨';
    const enabledClass = userEnabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';

    // 모달 내용 구성
    let content = `
        <div class="space-y-4">
            <div class="flex justify-between items-start">
                <div>
                    <h3 class="text-xl font-medium text-slate-900">${userName}</h3>
                    <p class="text-slate-600">${userEmail}</p>
                </div>
                <div class="flex gap-2">
                    <span class="px-3 py-1 ${statusClass} rounded text-sm font-medium">${statusText}</span>
                    <span class="px-3 py-1 ${enabledClass} rounded text-sm font-medium">${enabledText}</span>
                </div>
            </div>
            
            <div class="border-t pt-4 grid grid-cols-2 gap-4">
                <div>
                    <p class="text-sm text-slate-600 mb-1">교인 구분</p>
                    <p class="font-medium">${userTypeText}</p>
                </div>
                <div>
                    <p class="text-sm text-slate-600 mb-1">권한</p>
                    <p class="font-medium">${userRoleText}</p>
                </div>
                <div>
                    <p class="text-sm text-slate-600 mb-1">성별</p>
                    <p class="font-medium">${userGender || '-'}</p>
                </div>
                <div>
                    <p class="text-sm text-slate-600 mb-1">생년월일</p>
                    <p class="font-medium">${userBirth || '-'}</p>
                </div>
                <div class="col-span-2">
                    <p class="text-sm text-slate-600 mb-1">전화번호</p>
                    <p class="font-medium">${userPhone || '-'}</p>
                </div>
                <div class="col-span-2">
                    <p class="text-sm text-slate-600 mb-1">주소</p>
                    <p class="font-medium">${userAddress || '-'}</p>
                </div>
                <div class="col-span-2">
                    <p class="text-sm text-slate-600 mb-1">등록 경로</p>
                    <p class="font-medium">${userPath || '-'}</p>
                </div>
            </div>
    `;

    if (userStatus === 'REJECTED' && userRejection) {
        content += `
            <div class="border-t pt-4">
                <p class="text-sm text-slate-600 mb-1">반려 사유</p>
                <p class="text-red-600 font-medium">${userRejection}</p>
            </div>
        `;
    }

    if (!userEnabled) {
        content += `
            <div class="border-t pt-4">
                <p class="text-red-600 font-medium">⚠️ 차단된 회원입니다</p>
            </div>
        `;
    }

    content += `</div>`;

    // 모달에 내용 삽입 및 표시
    document.getElementById('modalContent').innerHTML = content;
    document.getElementById('detailModal').classList.remove('hidden');
}

/**
 * 상세보기 모달 닫기
 */
function closeModal() {
    document.getElementById('detailModal').classList.add('hidden');
}

/**
 * 차단/차단해제 확인 모달 표시
 */
function confirmBlock(button) {
    currentUserId = button.getAttribute('data-user-id');
    const userName = button.getAttribute('data-user-name');
    currentUserEnabled = button.getAttribute('data-user-enabled') === 'true';
    
    const action = currentUserEnabled ? '차단' : '차단 해제';
    const actionClass = currentUserEnabled ? 'text-red-600' : 'text-green-600';
    const message = currentUserEnabled 
        ? '차단된 회원은 로그인할 수 없습니다.' 
        : '차단을 해제하면 다시 로그인할 수 있습니다.';
    
    document.getElementById('blockModalTitle').textContent = `회원 ${action} 확인`;
    document.getElementById('blockModalTitle').className = `text-2xl font-light ${actionClass}`;
    document.getElementById('blockUserName').textContent = userName;
    document.getElementById('blockActionText').textContent = action;
    document.getElementById('blockMessage').textContent = message;
    document.getElementById('blockConfirmButton').textContent = `${action} 확인`;
    document.getElementById('blockConfirmButton').className = currentUserEnabled
        ? 'flex-1 py-3 bg-red-600 text-white hover:bg-red-700 transition font-medium rounded'
        : 'flex-1 py-3 bg-green-600 text-white hover:bg-green-700 transition font-medium rounded';
    
    document.getElementById('blockModal').classList.remove('hidden');
}

/**
 * 차단 확인 모달 닫기
 */
function closeBlockModal() {
    currentUserId = null;
    currentUserEnabled = null;
    document.getElementById('blockModal').classList.add('hidden');
}

/**
 * 회원 차단/차단해제 실행
 */
async function confirmBlockAction() {
    if (!currentUserId) return;

    const endpoint = currentUserEnabled 
        ? `/api/admin/users/${currentUserId}/disable`
        : `/api/admin/users/${currentUserId}/enable`;

    try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            alert('로그인이 필요합니다.');
            window.location.href = '/login';
            return;
        }

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const action = currentUserEnabled ? '차단' : '차단 해제';
            alert(`회원이 ${action}되었습니다.`);
            window.location.reload();
        } else if (response.status === 401 || response.status === 403) {
            alert('권한이 없습니다.');
            window.location.href = '/login';
        } else {
            const error = await response.json();
            alert(error.message || '처리에 실패했습니다.');
        }
    } catch (error) {
        console.error('Block action error:', error);
        alert('처리 중 오류가 발생했습니다.');
    } finally {
        closeBlockModal();
    }
}

// ESC 키로 모달 닫기
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeModal();
        closeBlockModal();
    }
});
