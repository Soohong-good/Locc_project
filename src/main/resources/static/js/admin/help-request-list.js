// 도움요청 관리 JavaScript

let currentPage = 0;
let currentStatus = null;
let totalPages = 0;

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    loadPage(0);
});

// 상태별 필터
function filterByStatus(status) {
    currentStatus = status;
    currentPage = 0;
    
    // 필터 버튼 스타일 업데이트
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('bg-slate-900', 'text-white');
        btn.classList.add('bg-slate-100', 'text-slate-700');
    });
    
    if (status === null) {
        document.getElementById('filter-all').classList.remove('bg-slate-100', 'text-slate-700');
        document.getElementById('filter-all').classList.add('bg-slate-900', 'text-white');
    } else if (status === 'PENDING') {
        document.getElementById('filter-pending').classList.remove('bg-slate-100', 'text-slate-700');
        document.getElementById('filter-pending').classList.add('bg-slate-900', 'text-white');
    } else if (status === 'IN_PROGRESS') {
        document.getElementById('filter-in-progress').classList.remove('bg-slate-100', 'text-slate-700');
        document.getElementById('filter-in-progress').classList.add('bg-slate-900', 'text-white');
    } else if (status === 'COMPLETED') {
        document.getElementById('filter-completed').classList.remove('bg-slate-100', 'text-slate-700');
        document.getElementById('filter-completed').classList.add('bg-slate-900', 'text-white');
    }
    
    loadPage(0);
}

// 페이지 로드
async function loadPage(page) {
    const token = localStorage.getItem('accessToken');
    if (!token) {
        alert('로그인이 필요합니다.');
        window.location.href = '/auth/login';
        return;
    }

    currentPage = page;
    
    let url = `/api/admin/help-requests?page=${page}&size=20`;
    if (currentStatus) {
        url += `&status=${currentStatus}`;
    }

    try {
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('목록 조회 실패');
        }

        const data = await response.json();
        totalPages = data.totalPages;

        renderList(data.content);
        updatePagination(data);
    } catch (error) {
        console.error('목록 로드 오류:', error);
        document.getElementById('requestList').innerHTML = `
            <div class="p-8 text-center text-red-600">
                목록을 불러오는데 실패했습니다.
            </div>
        `;
    }
}

// 목록 렌더링
function renderList(requests) {
    const container = document.getElementById('requestList');
    
    if (requests.length === 0) {
        container.innerHTML = `
            <div class="p-8 text-center text-slate-500">
                도움요청이 없습니다.
            </div>
        `;
        return;
    }

    container.innerHTML = requests.map(request => `
        <div class="p-6 hover:bg-slate-50 transition cursor-pointer" onclick="openDetailModal(${request.id})">
            <div class="flex items-start justify-between mb-3">
                <div class="flex-1">
                    <div class="flex items-center gap-3 mb-2">
                        <h3 class="text-lg font-medium text-slate-900">${escapeHtml(request.name)}</h3>
                        ${getStatusBadge(request.status, request.statusDescription)}
                    </div>
                    <div class="text-sm text-slate-600 space-y-1">
                        <div>📞 ${escapeHtml(request.phone)}</div>
                        <div>📧 ${escapeHtml(request.email)}</div>
                    </div>
                </div>
                <div class="text-sm text-slate-500">
                    ${formatDateTime(request.createdAt)}
                </div>
            </div>
            <p class="text-slate-700 line-clamp-2">${escapeHtml(request.content)}</p>
            ${request.adminMemo ? `
                <div class="mt-3 p-3 bg-amber-50 border border-amber-200 rounded text-sm">
                    <div class="font-medium text-amber-900 mb-1">관리자 메모</div>
                    <div class="text-amber-800">${escapeHtml(request.adminMemo)}</div>
                </div>
            ` : ''}
        </div>
    `).join('');
}

// 상태 뱃지
function getStatusBadge(status, description) {
    const colors = {
        'PENDING': 'bg-red-100 text-red-700 border-red-200',
        'IN_PROGRESS': 'bg-blue-100 text-blue-700 border-blue-200',
        'COMPLETED': 'bg-green-100 text-green-700 border-green-200'
    };
    
    return `<span class="px-2 py-1 text-xs font-medium rounded border ${colors[status]}">${description}</span>`;
}

// 페이징 업데이트
function updatePagination(data) {
    const pageInfo = document.getElementById('pageInfo');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');

    pageInfo.textContent = `${data.number + 1} / ${data.totalPages || 1}`;
    
    prevBtn.disabled = data.first;
    nextBtn.disabled = data.last;
}

// 상세 모달 열기
async function openDetailModal(id) {
    const token = localStorage.getItem('accessToken');
    
    try {
        const response = await fetch(`/api/admin/help-requests?page=0&size=1`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('상세 조회 실패');
        }

        const data = await response.json();
        const request = data.content.find(r => r.id === id);
        
        if (!request) {
            alert('요청을 찾을 수 없습니다.');
            return;
        }

        renderDetailModal(request);
        document.getElementById('detailModal').classList.remove('hidden');
    } catch (error) {
        console.error('상세 조회 오류:', error);
        alert('상세 정보를 불러오는데 실패했습니다.');
    }
}

// 상세 모달 렌더링
function renderDetailModal(request) {
    const content = document.getElementById('modalContent');
    
    content.innerHTML = `
        <div class="space-y-4">
            <!-- 기본 정보 -->
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label class="text-sm font-medium text-slate-600">이름</label>
                    <div class="mt-1 text-slate-900">${escapeHtml(request.name)}</div>
                </div>
                <div>
                    <label class="text-sm font-medium text-slate-600">상태</label>
                    <div class="mt-1">${getStatusBadge(request.status, request.statusDescription)}</div>
                </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label class="text-sm font-medium text-slate-600">전화번호</label>
                    <div class="mt-1 text-slate-900">${escapeHtml(request.phone)}</div>
                </div>
                <div>
                    <label class="text-sm font-medium text-slate-600">이메일</label>
                    <div class="mt-1 text-slate-900">${escapeHtml(request.email)}</div>
                </div>
            </div>

            <div>
                <label class="text-sm font-medium text-slate-600">요청일시</label>
                <div class="mt-1 text-slate-900">${formatDateTime(request.createdAt)}</div>
            </div>

            <!-- 내용 -->
            <div>
                <label class="text-sm font-medium text-slate-600">요청 내용</label>
                <div class="mt-1 p-3 bg-slate-50 rounded text-slate-900 whitespace-pre-wrap">${escapeHtml(request.content)}</div>
            </div>

            <!-- 상태 변경 -->
            <div>
                <label class="text-sm font-medium text-slate-600 block mb-2">상태 변경</label>
                <div class="flex gap-2">
                    <button onclick="updateStatus(${request.id}, 'PENDING')" 
                            class="px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition text-sm">
                        미처리
                    </button>
                    <button onclick="updateStatus(${request.id}, 'IN_PROGRESS')" 
                            class="px-4 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition text-sm">
                        처리중
                    </button>
                    <button onclick="updateStatus(${request.id}, 'COMPLETED')" 
                            class="px-4 py-2 bg-green-100 text-green-700 rounded hover:bg-green-200 transition text-sm">
                        완료
                    </button>
                </div>
            </div>

            <!-- 관리자 메모 -->
            <div>
                <label class="text-sm font-medium text-slate-600 block mb-2">관리자 메모</label>
                <textarea id="adminMemoInput" 
                          class="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:border-slate-900"
                          rows="4"
                          placeholder="관리자 메모를 입력하세요...">${request.adminMemo || ''}</textarea>
                <button onclick="updateMemo(${request.id})" 
                        class="mt-2 px-4 py-2 bg-slate-900 text-white rounded hover:bg-slate-800 transition text-sm">
                    메모 저장
                </button>
            </div>

            <!-- 삭제 -->
            <div class="pt-4 border-t">
                <button onclick="deleteRequest(${request.id})" 
                        class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition text-sm">
                    삭제
                </button>
            </div>
        </div>
    `;
}

// 상세 모달 닫기
function closeDetailModal() {
    document.getElementById('detailModal').classList.add('hidden');
}

// 상태 변경
async function updateStatus(id, status) {
    const token = localStorage.getItem('accessToken');
    
    try {
        const response = await fetch(`/api/admin/help-requests/${id}/status`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status })
        });

        if (!response.ok) {
            throw new Error('상태 변경 실패');
        }

        alert('상태가 변경되었습니다.');
        closeDetailModal();
        loadPage(currentPage);
    } catch (error) {
        console.error('상태 변경 오류:', error);
        alert('상태 변경에 실패했습니다.');
    }
}

// 메모 저장
async function updateMemo(id) {
    const token = localStorage.getItem('accessToken');
    const adminMemo = document.getElementById('adminMemoInput').value;
    
    try {
        const response = await fetch(`/api/admin/help-requests/${id}/memo`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ adminMemo })
        });

        if (!response.ok) {
            throw new Error('메모 저장 실패');
        }

        alert('메모가 저장되었습니다.');
        closeDetailModal();
        loadPage(currentPage);
    } catch (error) {
        console.error('메모 저장 오류:', error);
        alert('메모 저장에 실패했습니다.');
    }
}

// 삭제
async function deleteRequest(id) {
    if (!confirm('정말 삭제하시겠습니까?')) {
        return;
    }

    const token = localStorage.getItem('accessToken');
    
    try {
        const response = await fetch(`/api/admin/help-requests/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('삭제 실패');
        }

        alert('삭제되었습니다.');
        closeDetailModal();
        loadPage(currentPage);
    } catch (error) {
        console.error('삭제 오류:', error);
        alert('삭제에 실패했습니다.');
    }
}

// 유틸리티 함수
function formatDateTime(dateTimeString) {
    return new Date(dateTimeString).toLocaleString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
