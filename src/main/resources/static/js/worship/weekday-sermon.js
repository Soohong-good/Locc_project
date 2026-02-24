/**
 * 기타예배 (수요예배/금요기도회) 탭 전환
 */
const WeekdaySermon = {
    currentType: 'wednesday', // 기본값

    /**
     * 탭 전환
     */
    async switchTab(type) {
        console.log('탭 전환:', type);
        
        // 탭 버튼 활성화 상태 변경
        this.updateTabButtons(type);
        
        // 데이터 로딩
        await this.loadTabData(type);
        
        // URL 업데이트 (히스토리)
        history.pushState({ type }, '', `/worship/sermon/weekday?type=${type}`);
        
        this.currentType = type;
    },

    /**
     * 탭 버튼 UI 업데이트
     */
    updateTabButtons(type) {
        document.querySelectorAll('[data-tab]').forEach(btn => {
            btn.classList.remove('bg-white', 'text-slate-900');
            btn.classList.add('bg-slate-800', 'text-slate-400');
        });

        const activeBtn = document.querySelector(`[data-tab="${type}"]`);
        if (activeBtn) {
            activeBtn.classList.remove('bg-slate-800', 'text-slate-400');
            activeBtn.classList.add('bg-white', 'text-slate-900');
        }
    },

    /**
     * 탭 데이터 비동기 로딩
     */
    async loadTabData(type) {
        try {
            const response = await fetch(`/api/sermons/weekday/${type}`);
            if (!response.ok) {
                throw new Error('데이터 로딩 실패');
            }

            const data = await response.json();
            console.log('로딩된 데이터:', data);

            // YouTube 영상 업데이트
            this.updateYoutubeSection(data.youtubeVideos, type);

            // 설교 목록 업데이트
            this.updateSermonList(data.sermons);

        } catch (error) {
            console.error('탭 데이터 로딩 실패:', error);
            alert('데이터를 불러오는데 실패했습니다.');
        }
    },

    /**
     * YouTube 영상 섹션 업데이트
     */
    updateYoutubeSection(videos, type) {
        const youtubeSection = document.getElementById('youtubeSection');
        
        if (!videos || videos.length === 0) {
            if (youtubeSection) {
                youtubeSection.style.display = 'none';
            }
            return;
        }

        const video = videos[0];
        const title = type === 'wednesday' ? '수요예배 최신 영상' : '금요기도회 최신 영상';

        const html = `
            <div class="max-w-6xl mx-auto">
                <div class="mb-8">
                    <h2 class="text-sm tracking-[0.2em] text-slate-400 uppercase mb-2">Latest Video from YouTube</h2>
                    <h3 class="text-3xl font-light text-slate-900">${title}</h3>
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

        if (youtubeSection) {
            youtubeSection.innerHTML = html;
            youtubeSection.style.display = 'block';
        }
    },

    /**
     * 설교 목록 업데이트
     */
    updateSermonList(sermons) {
        const container = document.getElementById('sermonListContainer');
        if (!container) return;

        if (!sermons || sermons.length === 0) {
            container.innerHTML = `
                <div class="col-span-full py-20 text-center">
                    <p class="text-slate-400 font-light text-lg">등록된 설교가 없습니다.</p>
                </div>
            `;
            return;
        }

        const html = sermons.map(sermon => this.createSermonCard(sermon)).join('');
        container.innerHTML = html;
    },

    /**
     * 설교 카드 HTML 생성
     */
    createSermonCard(sermon) {
        const isAdmin = document.getElementById('admin-marker')?.dataset.admin === 'true';
        const adminButtons = isAdmin ? `
            <div class="absolute left-[150px] top-6 flex gap-2 z-10">
                <button onclick="SermonList.openEditModal(event, ${sermon.id})"
                        data-id="${sermon.id}"
                        data-title="${sermon.title}"
                        data-bibleverse="${sermon.scripture}"
                        data-preacher="${sermon.preacher}"
                        data-sermondate="${sermon.sermonDate}"
                        data-category="${sermon.category}"
                        data-videourl="${sermon.videoUrl || ''}"
                        class="px-4 py-2 text-sm bg-white border border-slate-300 hover:border-slate-900 transition leading-none">
                    수정
                </button>
                <button onclick="SermonList.confirmDelete(event, ${sermon.id})"
                        data-id="${sermon.id}"
                        data-title="${sermon.title}"
                        class="px-4 py-2 text-sm bg-white border border-red-300 text-red-600 hover:border-red-600 transition leading-none">
                    삭제
                </button>
            </div>
        ` : '';

        const newBadge = sermon.isNew ? '<span class="px-2 py-1 text-xs font-bold bg-red-500 text-white rounded">NEW</span>' : '';

        return `
            <article class="group bg-white border border-slate-200 hover:border-slate-900 hover:shadow-lg transition-all duration-300 relative">
                ${adminButtons}
                <div class="p-8 cursor-pointer" onclick="location.href='/worship/sermon/${sermon.id}'">
                    <div class="flex items-center justify-between mb-4">
                        <p class="text-sm text-slate-400 font-light tracking-wide">${this.formatDate(sermon.sermonDate)}</p>
                        ${newBadge}
                    </div>
                    <h3 class="text-2xl font-light text-slate-900 leading-tight mb-4 group-hover:text-slate-600 transition line-clamp-2">
                        ${sermon.title}
                    </h3>
                    <p class="text-base text-slate-600 mb-4 font-medium">${sermon.scripture}</p>
                    <p class="text-sm text-slate-500 mb-6">${sermon.preacher}</p>
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
     * 날짜 포맷팅
     */
    formatDate(dateString) {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}.${month}.${day}`;
    }
};

// 브라우저 뒤로가기/앞으로가기 처리
window.addEventListener('popstate', (event) => {
    if (event.state && event.state.type) {
        WeekdaySermon.switchTab(event.state.type);
    }
});

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', () => {
    // 현재 타입 설정
    const urlParams = new URLSearchParams(window.location.search);
    const type = urlParams.get('type') || 'wednesday';
    WeekdaySermon.currentType = type;

    // 탭 버튼 이벤트 리스너 등록
    document.querySelectorAll('[data-tab-button]').forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const type = button.getAttribute('data-tab-button');
            WeekdaySermon.switchTab(type);
        });
    });

    console.log('기타예배 탭 전환 초기화 완료');
});
