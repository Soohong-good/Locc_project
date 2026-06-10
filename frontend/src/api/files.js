import client from './client'

/**
 * 첨부파일 다운로드
 *
 * <a href> 방식은 Authorization 헤더를 포함하지 않으므로
 * 인증이 필요한 /api/files/download/{id} 엔드포인트에서 401이 발생함.
 * axios를 통해 blob으로 받아 동적 <a> 생성 방식으로 처리.
 *
 * @param {number|string} fileId - 파일 ID
 * @param {string} fileName - 다운로드 시 저장될 파일명 (Content-Disposition 없을 경우 폴백)
 */
export const deleteFile = async (fileId) => {
  await client.delete(`/api/files/${fileId}`)
}

export const downloadByPath = async (apiPath, filename = 'download') => {
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  const iosWin = isIOS ? window.open('about:blank', '_blank') : null

  let res
  try {
    res = await client.get(apiPath, { responseType: 'blob' })
  } catch (e) {
    if (iosWin) iosWin.close()
    throw e
  }

  const url = URL.createObjectURL(res.data)

  if (isIOS && iosWin && !iosWin.closed) {
    iosWin.location.href = url
    setTimeout(() => URL.revokeObjectURL(url), 10000)
  } else {
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }
}

export const downloadFile = async (fileId, fileName = '첨부파일') => {
  // iOS만 pre-open 필요: <a download>를 무시하므로 제스처 컨텍스트가 살아있을 때 창 미리 열기
  // Android는 <a download> 정상 지원 — blob URL을 새 탭으로 열면 뷰어가 열릴 뿐 다운로드 안 됨
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  const iosWin = isIOS ? window.open('about:blank', '_blank') : null

  let response
  try {
    response = await client.get(`/api/files/download/${fileId}`, {
      responseType: 'blob',
    })
  } catch (e) {
    if (iosWin) iosWin.close()
    throw e
  }

  // Content-Disposition 헤더에서 파일명 추출 시도
  const disposition = response.headers['content-disposition']
  let resolvedName = fileName
  if (disposition) {
    const utf8Match = disposition.match(/filename\*=UTF-8''(.+)/i)
    const asciiMatch = disposition.match(/filename="?([^";\n]+)"?/i)
    if (utf8Match) {
      resolvedName = decodeURIComponent(utf8Match[1])
    } else if (asciiMatch) {
      resolvedName = asciiMatch[1].trim()
    }
  }

  // response.data는 이미 Blob — 다시 감싸면 MIME 타입 소실되므로 직접 사용
  const url = window.URL.createObjectURL(response.data)

  if (isIOS && iosWin && !iosWin.closed) {
    // iOS: 미리 열어둔 창에 로드 → Safari 공유 시트로 저장
    iosWin.location.href = url
    setTimeout(() => window.URL.revokeObjectURL(url), 10000)
  } else {
    // Android + Desktop: <a download> → 시스템 다운로드 매니저로 저장
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', resolvedName)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  }
}
