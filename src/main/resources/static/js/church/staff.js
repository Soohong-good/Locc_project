/**
 * 섬기는 분들 페이지 스크립트 (방식 2: Fragment 로드)
 * church/staff.html
 */

const StaffPage = (function() {
    let currentCategory = 'minister';
    let isAdmin = false;

    /**
     * 페이지 초기화
     */
    function init() {
        console.log('Staff 페이지 초기화');

        // 관리자 권한 확인
        checkAdminRole();

        // 초기 데이터 로드 (교역자)
        changeCategory('minister');

        // 모달 리스너 설정
        setupModalListeners();
    }

    /**
     * 관리자 권한 확인
     */
    function checkAdminRole() {
        isAdmin = document.querySelector('#createModal') !== null;
        console.log('관리자 권한:', isAdmin);
    }

    /**
     * 모달 리스너 설정
     */
    function setupModalListeners() {
        const createModal = document.getElementById('createModal');
        const editModal = document.getElementById('editModal');

        if (createModal) {
            createModal.addEventListener('click', function(e) {
                if (e.target === createModal) {
                    closeCreateModal();
                }
            });
        }

        if (editModal) {
            editModal.addEventListener('click', function(e) {
                if (e.target === editModal) {
                    closeEditModal();
                }
            });
        }

        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                closeCreateModal();
                closeEditModal();
            }
        });
    }

    /**
     * 카테고리 변경 및 Fragment 로드
     */
    async function changeCategory(category) {
        console.log('카테고리 변경:', category);
        currentCategory = category;

        // 탭 활성화 상태 변경
        document.querySelectorAll('.category-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.getElementById(`tab-${category}`).classList.add('active');

        // Fragment URL 결정
        const url = `/church/staff/${category}`;

        // 로딩 표시
        const contentArea = document.getElementById('staff-content-area');
        contentArea.innerHTML = `
            <div class="flex items-center justify-center py-20">
                <div class="text-center">
                    <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mb-4"></div>
                    <p class="text-slate-600">로딩 중...</p>
                </div>
            </div>
        `;

        try {
            // Fragment 가져오기
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error('Fragment 로드 실패');
            }

            const html = await response.text();
            contentArea.innerHTML = html;

            console.log(`${category} Fragment 로드 완료`);
        } catch (error) {
            console.error('Fragment 로드 오류:', error);
            contentArea.innerHTML = `
                <div class="py-20 text-center">
                    <p class="text-red-600">데이터를 불러오는데 실패했습니다.</p>
                    <button onclick="StaffPage.changeCategory('${category}')" 
                            class="mt-4 px-6 py-2 bg-slate-900 text-white hover:bg-slate-800">
                        다시 시도
                    </button>
                </div>
            `;
        }
    }

    /**
     * 추가 모달 열기
     */
    function openCreateModalFor(position, isSeniorPastor, category, customPosition = '') {
        const modal = document.getElementById('createModal');
        if (!modal) return;

        // 폼 초기화
        document.getElementById('createForm').reset();
        
        // 이미지 미리보기 초기화
        clearCreateImage();

        // Hidden 필드 설정
        document.getElementById('createPosition').value = position;
        document.getElementById('createCategory').value = category;
        document.getElementById('createIsSeniorPastor').value = isSeniorPastor ? 'true' : 'false';
        document.getElementById('createCustomPosition').value = customPosition;

        // 모달 표시
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
    
    /**
     * 추가 모달 이미지 미리보기
     */
    function previewCreateImage(input) {
        if (input.files && input.files[0]) {
            const file = input.files[0];
            
            // 파일 크기 검증 (5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert('파일 크기는 5MB를 초과할 수 없습니다.');
                input.value = '';
                return;
            }
            
            // 파일 타입 검증
            if (!file.type.startsWith('image/')) {
                alert('이미지 파일만 업로드 가능합니다.');
                input.value = '';
                return;
            }
            
            const reader = new FileReader();
            reader.onload = function(e) {
                document.getElementById('createPreviewImg').src = e.target.result;
                document.getElementById('createImagePreview').classList.remove('hidden');
            };
            reader.readAsDataURL(file);
        }
    }
    
    /**
     * 추가 모달 이미지 제거
     */
    function clearCreateImage() {
        document.getElementById('createImageInput').value = '';
        document.getElementById('createPreviewImg').src = '';
        document.getElementById('createImagePreview').classList.add('hidden');
    }

    /**
     * 추가 모달 닫기
     */
    function closeCreateModal() {
        const modal = document.getElementById('createModal');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    }

    /**
     * 수정 모달 열기
     */
    async function openEditModal(staffId) {
        const modal = document.getElementById('editModal');
        if (!modal) return;

        try {
            // 서버에서 데이터 가져오기
            const response = await fetch(`/api/staff/${staffId}`);
            if (!response.ok) {
                throw new Error('데이터 로드 실패');
            }

            const staff = await response.json();

            // 폼에 데이터 채우기
            document.getElementById('editId').value = staff.id;
            document.getElementById('editName').value = staff.name;
            document.getElementById('editEnglishName').value = staff.englishName;
            document.getElementById('editPosition').value = staff.positionEnglish;
            document.getElementById('editCategory').value = staff.categoryEnglish;
            document.getElementById('editIsSeniorPastor').value = staff.isSeniorPastor ? 'true' : 'false';
            document.getElementById('editCustomPosition').value = staff.customPosition || '';
            document.getElementById('editResponsibility').value = staff.responsibility || '';
            document.getElementById('editDisplayOrder').value = staff.displayOrder || 0;

            // 모달 표시
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        } catch (error) {
            console.error('데이터 로드 오류:', error);
            alert('데이터를 불러오는데 실패했습니다.');
        }
    }

    /**
     * 수정 모달 닫기
     */
    function closeEditModal() {
        const modal = document.getElementById('editModal');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    }

    /**
     * 섬기는 분 추가
     */
    async function createStaff(event) {
        event.preventDefault();

        const form = event.target;
        const formData = new FormData(form);
        
        // 이미지 파일이 있는지 확인
        const imageFile = formData.get('image');
        const hasImage = imageFile && imageFile.size > 0;
        
        // 기본 데이터 (JSON)
        const data = {
            name: formData.get('name'),
            englishName: formData.get('englishName'),
            position: formData.get('position'),
            category: formData.get('category'),
            isSeniorPastor: formData.get('isSeniorPastor') === 'true',
            customPosition: formData.get('customPosition'),
            responsibility: formData.get('responsibility'),
            displayOrder: parseInt(formData.get('displayOrder')) || 0
        };

        try {
            // 1. Staff 생성
            const createResponse = await fetch('/api/staff', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (!createResponse.ok) {
                throw new Error('추가 실패');
            }

            const createdStaff = await createResponse.json();
            
            // 2. 이미지가 있으면 업로드
            if (hasImage) {
                const imageFormData = new FormData();
                imageFormData.append('image', imageFile);
                
                const imageResponse = await fetch(`/api/staff/${createdStaff.id}/image`, {
                    method: 'POST',
                    body: imageFormData
                });
                
                if (!imageResponse.ok) {
                    console.error('이미지 업로드 실패');
                    // 이미지 업로드 실패해도 Staff는 생성되었으므로 계속 진행
                }
            }

            closeCreateModal();
            changeCategory(currentCategory);
            alert('추가되었습니다.');
        } catch (error) {
            console.error('추가 오류:', error);
            alert('추가에 실패했습니다.');
        }
    }

    /**
     * 섬기는 분 수정
     */
    async function updateStaff(event) {
        event.preventDefault();

        const formData = new FormData(event.target);
        const id = formData.get('id');
        const data = {
            name: formData.get('name'),
            englishName: formData.get('englishName'),
            position: formData.get('position'),  // 추가!
            category: formData.get('category'),
            isSeniorPastor: formData.get('isSeniorPastor') === 'true',
            customPosition: formData.get('customPosition'),
            responsibility: formData.get('responsibility'),
            displayOrder: parseInt(formData.get('displayOrder')) || 0
        };

        try {
            const response = await fetch(`/api/staff/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error('수정 실패');
            }

            closeEditModal();
            changeCategory(currentCategory);
            alert('수정되었습니다.');
        } catch (error) {
            console.error('수정 오류:', error);
            alert('수정에 실패했습니다.');
        }
    }

    /**
     * 섬기는 분 삭제
     */
    async function deleteStaff(id) {
        if (!confirm('정말 삭제하시겠습니까?')) {
            return;
        }

        try {
            const response = await fetch(`/api/staff/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('삭제 실패');
            }

            changeCategory(currentCategory);
            alert('삭제되었습니다.');
        } catch (error) {
            console.error('삭제 오류:', error);
            alert('삭제에 실패했습니다.');
        }
    }

    /**
     * 이미지 업로드
     */
    async function uploadImage(id, input) {
        const file = input.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('image', file);

        try {
            const response = await fetch(`/api/staff/${id}/image`, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error('업로드 실패');
            }

            changeCategory(currentCategory);
            alert('이미지가 업로드되었습니다.');
        } catch (error) {
            console.error('업로드 오류:', error);
            alert('이미지 업로드에 실패했습니다.');
        }
    }

    /**
     * 이미지 삭제
     */
    async function deleteImage(id) {
        if (!confirm('이미지를 삭제하시겠습니까?')) {
            return;
        }

        try {
            const response = await fetch(`/api/staff/${id}/image`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('삭제 실패');
            }

            changeCategory(currentCategory);
            alert('이미지가 삭제되었습니다.');
        } catch (error) {
            console.error('삭제 오류:', error);
            alert('이미지 삭제에 실패했습니다.');
        }
    }

    // Public API
    return {
        init,
        changeCategory,
        openCreateModalFor,
        closeCreateModal,
        openEditModal,
        closeEditModal,
        createStaff,
        updateStaff,
        deleteStaff,
        uploadImage,
        deleteImage,
        previewCreateImage,
        clearCreateImage
    };
})();