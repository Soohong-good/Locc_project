/**
 * 설교 CRUD 공통 모듈
 * - 모달 관리
 * - 생성/수정/삭제 기능
 * - 교역자 목록 관리
 */
const SermonCRUD = (function() {
    // 비공개 변수
    let quill = null;
    let currentSermonId = null;
    let staffList = [];
    
    /**
     * 초기화
     */
    function init() {
        console.log('설교 CRUD 모듈 초기화');
        
        // Quill 모듈 등록
        QuillEditor.registerCustomFontSizes();
        QuillEditor.registerImageResize();
        
        // 교역자 목록 로드
        loadStaffList();
        
        // 설교자 select 이벤트 설정
        setupPreacherSelect();
        
        // 모달 외부 클릭 시 닫기
        window.addEventListener('click', function(event) {
            const sermonModal = document.getElementById('sermonModal');
            const deleteModal = document.getElementById('deleteModal');
            
            if (event.target === sermonModal) {
                closeModal();
            }
            if (event.target === deleteModal) {
                closeDeleteModal();
            }
        });
        
        // ESC 키로 모달 닫기
        document.addEventListener('keydown', function(event) {
            if (event.key === 'Escape') {
                closeModal();
                closeDeleteModal();
            }
        });
    }
    
    /**
     * Quill 에디터 초기화
     */
    function initEditor() {
        if (quill) return;
        
        quill = QuillEditor.init('#sermonContent', {
            placeholder: '설교 내용을 입력하세요... (이미지를 드래그하여 추가할 수 있습니다)',
            uploadUrl: '/api/sermons/upload-image',
            height: 300
        });
        
        console.log('설교 에디터 초기화 완료');
    }
    
    /**
     * 교역자 목록 로드 (설교자만: 담임목사, 목사, 전도사)
     */
    async function loadStaffList() {
        try {
            const response = await fetch('/api/staff/preachers');
            if (response.ok) {
                staffList = await response.json();
                console.log('설교자 목록 로드 완료:', staffList.length, '명');
            }
        } catch (error) {
            console.error('설교자 목록 로드 실패:', error);
        }
    }
    
    /**
     * 설교자 select 박스 채우기
     */
    function populatePreacherSelect() {
        const selectElement = document.getElementById('sermonPreacherSelect');
        if (!selectElement) return;
        
        // 기존 옵션 제거 (첫 번째 "교역자 선택"과 마지막 "직접입력" 제외)
        while (selectElement.options.length > 2) {
            selectElement.remove(1);
        }
        
        // 교역자 목록으로 옵션 추가
        const directInputOption = selectElement.lastElementChild;
        staffList.forEach(staff => {
            const option = document.createElement('option');
            const displayText = `${staff.name} ${staff.displayPosition}`;
            option.value = displayText;
            option.textContent = displayText;
            selectElement.insertBefore(option, directInputOption);
        });
        
        console.log('설교자 옵션 추가 완료:', staffList.length, '명');
    }
    
    /**
     * 설교자 select에서 선택 시 input에 반영
     */
    function setupPreacherSelect() {
        const selectElement = document.getElementById('sermonPreacherSelect');
        const inputElement = document.getElementById('sermonPreacher');
        
        if (!selectElement || !inputElement) return;
        
        selectElement.addEventListener('change', function() {
            if (this.value === '__DIRECT__') {
                // 직접입력 선택 시
                inputElement.value = '';
                inputElement.readOnly = false;
                inputElement.classList.remove('bg-slate-100');
                inputElement.classList.add('bg-slate-50');
                inputElement.placeholder = '설교자 이름 직접입력';
                inputElement.focus();
                this.value = '';
            } else if (this.value) {
                // 교역자 선택 시
                inputElement.value = this.value;
                inputElement.readOnly = true;
                inputElement.classList.remove('bg-slate-50');
                inputElement.classList.add('bg-slate-100');
                inputElement.placeholder = '설교자 이름';
                this.value = '';
            }
        });
    }
    
    /**
     * 오늘 날짜를 YYYY-MM-DD 형식으로 반환
     */
    function getTodayDate() {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
    
    /**
     * 새 설교 작성 모달 열기
     */
    function openWriteModal() {
        console.log('새 설교 모달 열기');
        
        if (!checkToken()) {
            return;
        }
        
        // 모달 제목 변경
        const modalTitle = document.getElementById('modalTitle');
        if (modalTitle) {
            modalTitle.textContent = '새 설교 등록';
        }
        
        // Quill 에디터 초기화
        if (!quill) {
            initEditor();
        } else {
            QuillEditor.clearContent(quill);
        }
        
        // 폼 초기화
        document.getElementById('sermonTitle').value = '';
        document.getElementById('sermonBibleVerse').value = '';
        
        const preacherInput = document.getElementById('sermonPreacher');
        preacherInput.value = '';
        preacherInput.readOnly = true;
        preacherInput.classList.remove('bg-slate-50');
        preacherInput.classList.add('bg-slate-100');
        preacherInput.placeholder = '설교자 이름';
        
        document.getElementById('sermonDate').value = getTodayDate();
        
        // serviceNumber 초기화 (있는 경우)
        const serviceNumberElement = document.getElementById('sermonServiceNumber');
        if (serviceNumberElement) {
            serviceNumberElement.value = '';
        }
        
        document.getElementById('sermonVideoUrl').value = '';
        
        // 설교자 select 박스 채우기
        populatePreacherSelect();
        
        // ID 초기화
        currentSermonId = null;
        
        // 에러 메시지 숨김
        const errorMsg = document.getElementById('errorMessage');
        if (errorMsg) {
            errorMsg.classList.add('hidden');
        }
        
        // 모달 열기
        const modal = document.getElementById('sermonModal');
        if (modal) {
            modal.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        }
    }
    
    /**
     * 수정 모달 열기
     */
    async function openEditModal(event, sermonId) {
        if (event) {
            event.stopPropagation();
        }
        
        if (!checkToken()) return;
        
        console.log('설교 수정 모달 열기 - ID:', sermonId);
        
        // 모달 제목 변경
        const modalTitle = document.getElementById('modalTitle');
        if (modalTitle) {
            modalTitle.textContent = '설교 수정';
        }
        
        // Quill 에디터 초기화
        if (!quill) {
            initEditor();
        }
        
        // 설교자 select 박스 채우기
        populatePreacherSelect();
        
        try {
            // 서버에서 상세 정보 가져오기
            const response = await fetch(`/api/sermons/${sermonId}`);
            
            if (!response.ok) {
                throw new Error('설교 정보를 불러오는데 실패했습니다.');
            }
            
            const sermon = await response.json();
            
            // 데이터 채우기
            document.getElementById('sermonTitle').value = sermon.title || '';
            document.getElementById('sermonBibleVerse').value = sermon.scripture || '';
            
            const preacherInput = document.getElementById('sermonPreacher');
            const preacherValue = sermon.preacher || '';
            preacherInput.value = preacherValue;
            
            // 설교자가 교역자 목록에 있는지 확인
            const isStaffPreacher = staffList.some(staff => 
                `${staff.name} ${staff.displayPosition}` === preacherValue
            );
            
            if (isStaffPreacher) {
                preacherInput.readOnly = true;
                preacherInput.classList.remove('bg-slate-50');
                preacherInput.classList.add('bg-slate-100');
            } else {
                preacherInput.readOnly = false;
                preacherInput.classList.remove('bg-slate-100');
                preacherInput.classList.add('bg-slate-50');
            }
            
            document.getElementById('sermonDate').value = sermon.sermonDate || '';
            document.getElementById('sermonCategory').value = sermon.category || '';
            document.getElementById('sermonVideoUrl').value = sermon.videoUrl || '';
            
            // serviceNumber 설정 (있는 경우)
            const serviceNumberElement = document.getElementById('sermonServiceNumber');
            if (serviceNumberElement && sermon.serviceNumber) {
                serviceNumberElement.value = sermon.serviceNumber;
            }
            
            // Quill 에디터에 내용 설정
            if (quill && sermon.content) {
                QuillEditor.setContent(quill, sermon.content);
            }
            
            currentSermonId = sermonId;
            
            // 에러 메시지 숨김
            const errorMsg = document.getElementById('errorMessage');
            if (errorMsg) {
                errorMsg.classList.add('hidden');
            }
            
            // 모달 열기
            const modal = document.getElementById('sermonModal');
            if (modal) {
                modal.classList.remove('hidden');
                document.body.style.overflow = 'hidden';
            }
        } catch (error) {
            console.error('설교 정보 로드 실패:', error);
            showToast('설교 정보를 불러오는데 실패했습니다.', 'error');
        }
    }
    
    /**
     * 모달 닫기
     */
    function closeModal() {
        const modal = document.getElementById('sermonModal');
        if (modal) {
            modal.classList.add('hidden');
            document.body.style.overflow = '';
            
            // Quill 에디터 초기화
            if (quill) {
                QuillEditor.clearContent(quill);
            }
            
            // 폼 리셋
            document.getElementById('sermonTitle').value = '';
            document.getElementById('sermonBibleVerse').value = '';
            
            const preacherInput = document.getElementById('sermonPreacher');
            preacherInput.value = '';
            preacherInput.readOnly = true;
            preacherInput.classList.remove('bg-slate-50');
            preacherInput.classList.add('bg-slate-100');
            preacherInput.placeholder = '설교자 이름';
            
            document.getElementById('sermonDate').value = '';
            document.getElementById('sermonVideoUrl').value = '';
            
            // serviceNumber 초기화 (있는 경우)
            const serviceNumberElement = document.getElementById('sermonServiceNumber');
            if (serviceNumberElement) {
                serviceNumberElement.value = '';
            }
            
            currentSermonId = null;
            
            // 에러 메시지 숨김
            const errorMsg = document.getElementById('errorMessage');
            if (errorMsg) {
                errorMsg.classList.add('hidden');
            }
        }
    }
    
    /**
     * 설교 저장 (생성 or 수정)
     */
    async function saveSermon() {
        if (!checkToken()) return;
        
        // 폼 데이터 수집
        const title = document.getElementById('sermonTitle').value.trim();
        const bibleVerse = document.getElementById('sermonBibleVerse').value.trim();
        const preacher = document.getElementById('sermonPreacher').value.trim();
        const sermonDate = document.getElementById('sermonDate').value;
        const content = QuillEditor.getContent(quill);
        const category = document.getElementById('sermonCategory').value;
        const videoUrl = document.getElementById('sermonVideoUrl').value.trim();
        
        console.log('=== 설교 저장 시작 ===');
        console.log('제목:', title);
        console.log('성경구절:', bibleVerse);
        console.log('설교자:', preacher);
        console.log('날짜:', sermonDate);
        console.log('카테고리:', category);
        console.log('유튜브 URL:', videoUrl);
        
        // 검증
        if (!title || !bibleVerse || !preacher || !sermonDate || !content || content === '<p><br></p>') {
            showError('모든 필수 필드를 입력해주세요.');
            return;
        }
        
        // FormData 생성
        const formData = new FormData();
        formData.append('title', title);
        formData.append('scripture', bibleVerse);
        formData.append('preacher', preacher);
        formData.append('sermonDate', sermonDate);
        formData.append('content', content);
        formData.append('category', category);
        
        // serviceNumber 추가 (있는 경우)
        const serviceNumberElement = document.getElementById('sermonServiceNumber');
        if (serviceNumberElement && serviceNumberElement.value) {
            formData.append('serviceNumber', serviceNumberElement.value);
            console.log('serviceNumber:', serviceNumberElement.value);
        }
        
        if (videoUrl) {
            formData.append('videoUrl', videoUrl);
        }
        
        // 파일 첨부 (있는 경우)
        const fileInput = document.getElementById('sermonFiles');
        if (fileInput && fileInput.files.length > 0) {
            Array.from(fileInput.files).forEach(file => {
                formData.append('files', file);
            });
            console.log('첨부파일:', fileInput.files.length, '개');
        }
        
        try {
            const headers = getAuthHeaders(false);
            
            let response;
            if (currentSermonId) {
                // 수정
                console.log('설교 수정 요청 - ID:', currentSermonId);
                response = await fetch(`/api/sermons/${currentSermonId}`, {
                    method: 'PUT',
                    headers: headers,
                    body: formData
                });
            } else {
                // 생성
                console.log('설교 생성 요청');
                response = await fetch('/api/sermons', {
                    method: 'POST',
                    headers: headers,
                    body: formData
                });
            }
            
            console.log('응답 상태:', response.status);
            
            if (handleAuthError(response)) return;
            
            if (response.ok) {
                const result = await response.json();
                console.log('성공 응답:', result);
                showToast(currentSermonId ? '설교가 수정되었습니다.' : '설교가 등록되었습니다.', 'success');
                closeModal();
                
                // 페이지 새로고침
                setTimeout(() => {
                    location.reload();
                }, 500);
            } else {
                const errorText = await response.text();
                console.error('에러 응답:', errorText);
                try {
                    const error = JSON.parse(errorText);
                    showError(error.message || '저장에 실패했습니다.');
                } catch (e) {
                    showError(`저장에 실패했습니다. (${response.status})`);
                }
            }
        } catch (error) {
            console.error('설교 저장 실패:', error);
            showError('저장에 실패했습니다.');
        }
    }
    
    /**
     * 삭제 확인 모달 열기
     */
    function confirmDelete(event, sermonId) {
        if (event) {
            event.stopPropagation();
        }
        
        if (!checkToken()) return;
        
        const button = event.currentTarget;
        currentSermonId = button.dataset.id;
        
        // 삭제 모달에 제목 표시
        const titleElement = document.getElementById('deleteSermonTitle');
        if (titleElement) {
            titleElement.textContent = button.dataset.title;
        }
        
        // 모달 열기
        const modal = document.getElementById('deleteModal');
        if (modal) {
            modal.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        }
    }
    
    /**
     * 삭제 모달 닫기
     */
    function closeDeleteModal() {
        const modal = document.getElementById('deleteModal');
        if (modal) {
            modal.classList.add('hidden');
            document.body.style.overflow = '';
        }
        currentSermonId = null;
    }
    
    /**
     * 설교 삭제
     */
    async function deleteSermon() {
        if (!checkToken()) return;
        if (!currentSermonId) return;
        
        try {
            const response = await fetch(`/api/sermons/${currentSermonId}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });
            
            if (handleAuthError(response)) return;
            
            if (response.ok) {
                showToast('설교가 삭제되었습니다.', 'success');
                closeDeleteModal();
                
                // 페이지 새로고침
                setTimeout(() => {
                    location.reload();
                }, 500);
            } else {
                const error = await response.json().catch(() => ({ message: '삭제에 실패했습니다.' }));
                showToast(error.message || '삭제에 실패했습니다.', 'error');
            }
        } catch (error) {
            console.error('설교 삭제 실패:', error);
            showToast('삭제에 실패했습니다.', 'error');
        }
    }
    
    /**
     * 에러 메시지 표시
     */
    function showError(message) {
        const errorDiv = document.getElementById('errorMessage');
        if (errorDiv) {
            errorDiv.textContent = message;
            errorDiv.classList.remove('hidden');
        }
    }
    
    // Public API
    return {
        init,
        openWriteModal,
        openEditModal,
        closeModal,
        saveSermon,
        confirmDelete,
        closeDeleteModal,
        deleteSermon
    };
})();

// DOMContentLoaded 시 초기화
document.addEventListener('DOMContentLoaded', () => {
    SermonCRUD.init();
});
