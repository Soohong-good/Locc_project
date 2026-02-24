/**
 * 관리자 대시보드 - 비동기 페이징
 */

let currentNoticePage = 0;
let currentSermonPage = 0;

// 페이지 로드 시 초기 데이터 로드
document.addEventListener('DOMContentLoaded', function() {
    loadNotices(0);
    loadSermons(0);
});

// 공지사항 목록 로드
async function loadNotices(page) {
    if (page < 0) return;
    
    try {
        const token = localStorage.getItem('accessToken');
        const response = await fetch(`/api/admin/notices?page=${page}&size=10`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) throw new Error('Failed to load notices');
        
        const notices = await response.json();
        const listEl = document.getElementById('noticeList');
        
        if (notices.length === 0 && page === 0) {
            listEl.innerHTML = '<div class="p-8 text-center text-slate-500">등록된 공지사항이 없습니다</div>';
            document.getElementById('noticePrevBtn').disabled = true;
            document.getElementById('noticeNextBtn').disabled = true;
            document.getElementById('noticePageInfo').textContent = '0';
            return;
        }
        
        // 목록 렌더링
        const html = notices.map(notice => `
            <div class="p-4 hover:bg-slate-50 transition ${notice.isPinned ? 'bg-blue-50/50' : ''}">
                <div class="flex items-start justify-between gap-4">
                    <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-2">
                            ${notice.isPinned ? '<span class="px-2 py-0.5 text-xs font-medium bg-blue-600 text-white rounded">고정됨</span>' : ''}
                            <a href="/church/notice/${notice.id}"
                               class="block font-medium text-slate-900 hover:text-blue-600 truncate">
                                ${escapeHtml(notice.title)}
                            </a>
                        </div>
                        <div class="flex items-center gap-3 mt-1 text-xs text-slate-500">
                            <span>${escapeHtml(notice.authorName)}</span>
                            <span>${formatDate(notice.createdAt)}</span>
                            <span>조회 ${notice.viewCount}</span>
                        </div>
                    </div>
                    <div class="flex gap-2 flex-shrink-0">
                        <button onclick="confirmDelete('notice', ${notice.id})"
                                class="px-3 py-1 text-xs border border-red-300 text-red-600 rounded hover:bg-red-50">
                            삭제
                        </button>
                        <button onclick="togglePin('notice', ${notice.id})"
                                class="px-3 py-1 text-xs ${notice.isPinned ? 'bg-blue-600 text-white hover:bg-blue-700' : 'border border-blue-300 text-blue-600 hover:bg-blue-50'} rounded transition">
                            ${notice.isPinned ? '고정 해제' : '고정'}
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
        
        listEl.innerHTML = html;
        
        // 페이징 버튼 상태 업데이트
        document.getElementById('noticePrevBtn').disabled = page === 0;
        document.getElementById('noticeNextBtn').disabled = notices.length < 10;
        document.getElementById('noticePageInfo').textContent = `${page + 1}`;
        
        currentNoticePage = page;
    } catch (error) {
        console.error('공지사항 로드 실패:', error);
        document.getElementById('noticeList').innerHTML = 
            '<div class="p-8 text-center text-red-500">로딩 중 오류가 발생했습니다</div>';
    }
}

// 설교 목록 로드
async function loadSermons(page) {
    if (page < 0) return;
    
    try {
        const token = localStorage.getItem('accessToken');
        const response = await fetch(`/api/admin/sermons?page=${page}&size=10`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) throw new Error('Failed to load sermons');
        
        const sermons = await response.json();
        const listEl = document.getElementById('sermonList');
        
        if (sermons.length === 0 && page === 0) {
            listEl.innerHTML = '<div class="p-8 text-center text-slate-500">등록된 설교가 없습니다</div>';
            document.getElementById('sermonPrevBtn').disabled = true;
            document.getElementById('sermonNextBtn').disabled = true;
            document.getElementById('sermonPageInfo').textContent = '0';
            return;
        }
        
        // 목록 렌더링
        const html = sermons.map(sermon => `
            <div class="p-4 hover:bg-slate-50 transition">
                <div class="flex items-start justify-between gap-4">
                    <div class="flex-1 min-w-0">
                        <a href="/worship/sermon/${sermon.id}"
                           class="block font-medium text-slate-900 hover:text-blue-600 truncate">
                            ${escapeHtml(sermon.title)}
                        </a>
                        <div class="flex items-center gap-3 mt-1 text-xs text-slate-500">
                            <span>${escapeHtml(sermon.preacher)}</span>
                            <span>${formatDate(sermon.sermonDate)}</span>
                            <span>${escapeHtml(sermon.category)}</span>
                        </div>
                    </div>
                    <div class="flex gap-2 flex-shrink-0">
                        <button onclick="confirmDelete('sermon', ${sermon.id})"
                                class="px-3 py-1 text-xs border border-red-300 text-red-600 rounded hover:bg-red-50">
                            삭제
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
        
        listEl.innerHTML = html;
        
        // 페이징 버튼 상태 업데이트
        document.getElementById('sermonPrevBtn').disabled = page === 0;
        document.getElementById('sermonNextBtn').disabled = sermons.length < 10;
        document.getElementById('sermonPageInfo').textContent = `${page + 1}`;
        
        currentSermonPage = page;
    } catch (error) {
        console.error('설교 로드 실패:', error);
        document.getElementById('sermonList').innerHTML = 
            '<div class="p-8 text-center text-red-500">로딩 중 오류가 발생했습니다</div>';
    }
}

// 삭제 확인
async function confirmDelete(type, id) {
    const typeName = type === 'notice' ? '공지사항' : '설교';
    if (!confirm(`이 ${typeName}을(를) 삭제하시겠습니까?`)) {
        return;
    }

    const endpoint = type === 'notice'
        ? `/api/admin/notices/${id}`
        : `/api/admin/sermons/${id}`;

    try {
        const response = await fetch(endpoint, {
            method: 'DELETE',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('accessToken')
            }
        });
        
        if (response.ok) {
            alert(`${typeName}이(가) 삭제되었습니다.`);
            // 현재 페이지 새로고침
            if (type === 'notice') {
                await loadNotices(currentNoticePage);
            } else {
                await loadSermons(currentSermonPage);
            }
        } else {
            alert('삭제에 실패했습니다.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('삭제 중 오류가 발생했습니다.');
    }
}

// 공지사항 고정 토글
async function togglePin(type, id) {
    if (type !== 'notice') return;

    try {
        const response = await fetch(`/api/admin/notices/${id}/pin`, {
            method: 'PATCH',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('accessToken')
            }
        });
        
        if (response.ok) {
            // 현재 페이지 새로고침
            await loadNotices(currentNoticePage);
        } else {
            alert('고정 설정 변경에 실패했습니다.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('고정 설정 변경 중 오류가 발생했습니다.');
    }
}

// 날짜 포맷팅
function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// HTML 이스케이프
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
