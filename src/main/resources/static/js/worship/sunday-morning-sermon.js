/**
 * 주일오전예배 비동기 탭 전환 스크립트
 * - 1부/2부 탭 전환
 * - YouTube 영상 + 설교 목록 동적 업데이트
 * - SermonCRUD 모듈과 연동
 */
const SundayMorningSermon = {
    currentServiceNumber: 2, // 기본값: 2부
    isAdminUser: false, // 관리자 여부

    /**
     * 탭 전환
     */
    switchTab(serviceNumber) {
        console.log('탭 전환:', serviceNumber);
        
        this.currentServiceNumber = serviceNumber;
        this.updateTabButtons(serviceNumber);
        this.loadTabData(serviceNumber);
        
        // URL 업데이트 (뒤로가기 지원)
        const url = new URL(window.location);
        url.searchParams.set('serviceNumber', serviceNumber);
        window.history.pushState({ serviceNumber }, '', url);
    },

    /**
     * 탭 버튼 UI 업데이트
     */
    updateTabButtons(serviceNumber) {
        document.querySelectorAll('[data-tab-button]').forEach(btn => {
            const btnServiceNumber = parseInt(btn.getAttribute('data-tab-button'));
            if (btnServiceNumber === serviceNumber) {
                btn.classList.remove('bg-slate-800', 'text-slate-400', 'hover:bg-slate-700');
                btn.classList.add('bg-white', 'text-slate-900');
            } else {
                btn.classList.remove('bg-white', 'text-slate-900');
                btn.classList.add('bg-slate-800', 'text-slate-400', 'hover:bg-slate-700');
            }
        });
    },

    /**
     * AJAX로 탭 데이터 로딩
     */
    async loadTabData(serviceNumber) {
        try {
            const response = await fetch(`/api/sermons/sunday-morning/${serviceNumber}?page=0&size=10`);
            if (!response.ok) throw new Error('데이터 로딩 실패');
            
            const data = await response.json();
            console.log('주일오전 탭 데이터 로딩 완료:', serviceNumber, '부');
            
            // YouTube 섹션 업데이트
            this.updateYoutubeSection(data.youtubeVideos, serviceNumber);
            
            // 설교 목록 업데이트
            this.updateSermonList(data.sermons);
            
            // 최신 설교 영상 업데이트 (YouTube 영상 정보도 전달)
            this.updateLatestSermonSection(data.latestSermon, data.youtubeVideos);
            
        } catch (error) {
            console.error('탭 데이터 로딩 실패:', error);
        }
    },

    /**
     * YouTube 섹션 업데이트
     */
    updateYoutubeSection(videos, serviceNumber) {
        const section = document.getElementById('youtubeSection');
        if (!section) return;
        
        if (!videos || videos.length === 0) {
            section.style.display = 'none';
            return;
        }
        
        section.style.display = 'block';
        const video = videos[0];
        const sectionTitle = serviceNumber === 1 ? '주일오전 1부 최신 영상' : '주일오전 2부 최신 영상';
        
        // section 내부 컨텐츠만 교체 (중복 방지)
        const existingContainer = section.querySelector('.max-w-6xl');
        if (existingContainer) {
            existingContainer.innerHTML = `
                <div class="mb-8">
                    <h2 class="text-sm tracking-[0.2em] text-slate-400 uppercase mb-2">Latest Video from YouTube</h2>
                    <h3 class="text-3xl font-light text-slate-900">${sectionTitle}</h3>
                </div>
                <div>
                    <div class="aspect-video bg-slate-900 overflow-hidden shadow-xl">
                        <iframe src="https://www.youtube.com/embed/${video.videoId}"
                                frameborder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowfullscreen
                                class="w-full h-full">
                        </iframe>
                    </div>
                    <div class="mt-6">
                        <h4 class="text-xl font-medium text-slate-900">${video.title}</h4>
                        <p class="text-sm text-slate-600 mt-2">${video.publishedAt}</p>
                    </div>
                </div>
            `;
        } else {
            // 컨테이너가 없으면 전체 생성
            section.innerHTML = `
                <div class="max-w-6xl mx-auto">
                    <div class="mb-8">
                        <h2 class="text-sm tracking-[0.2em] text-slate-400 uppercase mb-2">Latest Video from YouTube</h2>
                        <h3 class="text-3xl font-light text-slate-900">${sectionTitle}</h3>
                    </div>
                    <div>
                        <div class="aspect-video bg-slate-900 overflow-hidden shadow-xl">
                            <iframe src="https://www.youtube.com/embed/${video.videoId}"
                                    frameborder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowfullscreen
                                    class="w-full h-full">
                            </iframe>
                        </div>
                        <div class="mt-6">
                            <h4 class="text-xl font-medium text-slate-900">${video.title}</h4>
                            <p class="text-sm text-slate-600 mt-2">${video.publishedAt}</p>
                        </div>
                    </div>
                </div>
            `;
        }
    },

    /**
     * 최신 설교 영상 섹션 업데이트
     * YouTube 영상이 없을 때만 표시
     */
    updateLatestSermonSection(latestSermon, youtubeVideos) {
        const section = document.getElementById('latestSermonSection');
        if (!section) return;
        
        // YouTube 영상이 있으면 최신 설교 영상 섹션 숨김
        if (youtubeVideos && youtubeVideos.length > 0) {
            section.style.display = 'none';
            return;
        }
        
        // YouTube 영상이 없고, 최신 설교에 videoUrl이 있으면 표시
        if (!latestSermon || !latestSermon.videoUrl) {
            section.style.display = 'none';
            return;
        }
        
        section.style.display = 'block';
        
        // YouTube URL에서 videoId 추출
        let videoId = '';
        if (latestSermon.videoUrl.includes('v=')) {
            videoId = latestSermon.videoUrl.split('v=')[1].split('&')[0];
        } else if (latestSermon.videoUrl.includes('youtu.be/')) {
            videoId = latestSermon.videoUrl.split('youtu.be/')[1].split('?')[0];
        }
        
        if (!videoId) {
            section.style.display = 'none';
            return;
        }
        
        // section 내부 컨텐츠만 교체 (중복 방지)
        const existingContainer = section.querySelector('.max-w-6xl');
        if (existingContainer) {
            existingContainer.innerHTML = `
                <div class="mb-8">
                    <h2 class="text-sm tracking-[0.2em] text-slate-400 uppercase mb-2">Latest Sermon</h2>
                    <h3 class="text-3xl font-light text-slate-900">${latestSermon.title}</h3>
                </div>
                <div class="aspect-video bg-slate-900 overflow-hidden shadow-xl">
                    <iframe src="https://www.youtube.com/embed/${videoId}"
                            frameborder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowfullscreen
                            class="w-full h-full">
                    </iframe>
                </div>
                <div class="mt-6 flex items-center gap-6 text-sm text-slate-600">
                    <div class="flex items-center gap-2">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                        </svg>
                        <span>${latestSermon.preacher}</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                        </svg>
                        <span>${latestSermon.sermonDate}</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                        </svg>
                        <span>${latestSermon.scripture}</span>
                    </div>
                </div>
            `;
        } else {
            // 컨테이너가 없으면 전체 생성
            section.innerHTML = `
                <div class="max-w-6xl mx-auto">
                    <div class="mb-8">
                        <h2 class="text-sm tracking-[0.2em] text-slate-400 uppercase mb-2">Latest Sermon</h2>
                        <h3 class="text-3xl font-light text-slate-900">${latestSermon.title}</h3>
                    </div>
                    <div class="aspect-video bg-slate-900 overflow-hidden shadow-xl">
                        <iframe src="https://www.youtube.com/embed/${videoId}"
                                frameborder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowfullscreen
                                class="w-full h-full">
                        </iframe>
                    </div>
                    <div class="mt-6 flex items-center gap-6 text-sm text-slate-600">
                        <div class="flex items-center gap-2">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                            </svg>
                            <span>${latestSermon.preacher}</span>
                        </div>
                        <div class="flex items-center gap-2">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                            </svg>
                            <span>${latestSermon.sermonDate}</span>
                        </div>
                        <div class="flex items-center gap-2">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                            </svg>
                            <span>${latestSermon.scripture}</span>
                        </div>
                    </div>
                </div>
            `;
        }
    },

    /**
     * 설교 목록 업데이트
     */
    updateSermonList(sermons) {
        const container = document.getElementById('sermonListContainer');
        if (!container) {
            console.error('sermonListContainer를 찾을 수 없습니다!');
            return;
        }
        
        // 배열 타입 검증
        if (!Array.isArray(sermons)) {
            console.error('sermons가 배열이 아닙니다:', sermons);
            container.innerHTML = `
                <div class="col-span-full py-20 text-center">
                    <p class="text-slate-400 font-light text-lg">데이터 형식 오류</p>
                </div>
            `;
            return;
        }
        
        if (sermons.length === 0) {
            container.innerHTML = `
                <div class="col-span-full py-20 text-center">
                    <p class="text-slate-400 font-light text-lg">등록된 설교가 없습니다.</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = sermons.map(sermon => this.createSermonCard(sermon)).join('');
        console.log('설교 목록 업데이트 완료:', sermons.length, '개');
    },

    /**
     * 설교 카드 HTML 생성 (sermon-list.js와 완전 통일)
     */
    createSermonCard(sermon) {
        const formattedDate = this.formatDate(sermon.sermonDate);
        const isNew = sermon.createdAt ? this.isWithin3Days(sermon.createdAt) : false;
        
        // 관리자 버튼 (SermonCRUD 함수 호출)
        const adminButtons = this.isAdminUser ? `
            <div class="absolute top-4 right-4 flex gap-2 z-10">
                <button onclick="SermonCRUD.openEditModal(event, ${sermon.id})"
                        data-id="${sermon.id}"
                        data-title="${this.escapeHtml(sermon.title)}"
                        data-bibleverse="${this.escapeHtml(sermon.scripture || '')}"
                        data-preacher="${this.escapeHtml(sermon.preacher || '')}"
                        data-sermondate="${sermon.sermonDate || ''}"
                        data-category="${this.escapeHtml(sermon.category || '')}"
                        data-videourl="${this.escapeHtml(sermon.videoUrl || '')}"
                        class="px-3 py-1 text-xs bg-white border border-slate-300 hover:border-slate-900 transition">
                    수정
                </button>
                <button onclick="SermonCRUD.confirmDelete(event, ${sermon.id})"
                        data-id="${sermon.id}"
                        data-title="${this.escapeHtml(sermon.title)}"
                        class="px-3 py-1 text-xs bg-white border border-red-300 text-red-600 hover:border-red-600 transition">
                    삭제
                </button>
            </div>
        ` : '';

        return `
            <article class="group bg-white border border-slate-200 hover:border-slate-900 hover:shadow-lg transition-all duration-300 relative">
                ${adminButtons}
                <div class="p-8 cursor-pointer" onclick="location.href='/worship/sermon/${sermon.id}'">
                    <div class="flex items-center justify-between mb-4">
                        <p class="text-sm text-slate-400 font-light tracking-wide">${formattedDate}</p>
                        ${isNew ? '<span class="px-2 py-1 text-xs font-bold bg-red-500 text-white rounded">NEW</span>' : ''}
                    </div>
                    <h3 class="text-2xl font-light text-slate-900 leading-tight mb-4 group-hover:text-slate-600 transition line-clamp-2">
                        ${this.escapeHtml(sermon.title)}
                    </h3>
                    <p class="text-base text-slate-600 mb-4 font-medium">${this.escapeHtml(sermon.scripture || '')}</p>
                    <p class="text-sm text-slate-500">${this.escapeHtml(sermon.preacher || '')}</p>
                </div>
                <div class="px-8 py-4 bg-slate-50 group-hover:bg-slate-900 transition-colors cursor-pointer"
                     onclick="location.href='/worship/sermon/${sermon.id}'">
                    <div class="flex items-center justify-between">
                        <span class="text-sm text-slate-600 group-hover:text-white transition font-medium">설교 보기</span>
                        <svg class="w-5 h-5 text-slate-400 group-hover:text-white group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                        </svg>
                    </div>
                </div>
            </article>
        `;
    },

    /**
     * 날짜 포맷팅 (YYYY.MM.DD)
     */
    formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}.${month}.${day}`;
    },

    /**
     * 최근 3일 이내인지 확인
     */
    isWithin3Days(dateString) {
        if (!dateString) return false;
        const createdDate = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - createdDate);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 3;
    },

    /**
     * HTML 이스케이프
     */
    escapeHtml(text) {
        if (!text) return '';
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    }
};

// DOMContentLoaded - 이벤트 리스너 등록
document.addEventListener('DOMContentLoaded', () => {
    console.log('주일오전예배 스크립트 초기화');
    
    // 관리자 권한 체크
    const adminMarker = document.getElementById('admin-marker');
    SundayMorningSermon.isAdminUser = adminMarker !== null && adminMarker.dataset.admin === 'true';
    console.log('관리자 권한:', SundayMorningSermon.isAdminUser);
    
    // 탭 버튼에 이벤트 리스너 등록
    document.querySelectorAll('[data-tab-button]').forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const serviceNumber = parseInt(button.getAttribute('data-tab-button'));
            SundayMorningSermon.switchTab(serviceNumber);
        });
    });
    
    // 뒤로가기/앞으로가기 지원
    window.addEventListener('popstate', (event) => {
        if (event.state && event.state.serviceNumber) {
            SundayMorningSermon.switchTab(event.state.serviceNumber);
        }
    });
    
    // 초기 상태 저장
    const urlParams = new URLSearchParams(window.location.search);
    const initialServiceNumber = parseInt(urlParams.get('serviceNumber')) || 2;
    SundayMorningSermon.currentServiceNumber = initialServiceNumber;
    window.history.replaceState({ serviceNumber: initialServiceNumber }, '');
});
