import client from './client'

// GET /api/newyear — 공개 엔드포인트
export async function fetchNewYear() {
    const { data } = await client.get('/api/newyear')
    return data.data
}

// PUT /api/newyear/transcript — 관리자 전용 (client 인터셉터가 토큰 자동 주입)
export async function updateNewYearTranscript({ transcript }) {
    const { data } = await client.put('/api/newyear/transcript', { transcript })
    return data
}

// POST /api/newyear/update-video — 관리자 전용 (client 인터셉터가 토큰 자동 주입)
export async function updateNewYearLatestVideo() {
    const { data } = await client.post('/api/newyear/update-video')
    return data
}

// PUT /api/newyear/scripture — 본문 성경 참조 설정 (관리자 전용)
export async function updateNewYearScripture({ scripture }) {
    const { data } = await client.put('/api/newyear/scripture', { scripture })
    return data
}

// POST /api/newyear/pdf — PDF 업로드 (관리자 전용)
export async function uploadNewYearPdf(file) {
    const formData = new FormData()
    formData.append('file', file)
    const { data } = await client.post('/api/newyear/pdf', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data
}