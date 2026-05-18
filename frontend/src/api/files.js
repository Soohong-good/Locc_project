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
  const res = await client.get(apiPath, { responseType: 'blob' })
  const url = URL.createObjectURL(res.data)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

export const downloadFile = async (fileId, fileName = '첨부파일') => {
  const response = await client.get(`/api/files/download/${fileId}`, {
    responseType: 'blob',
  })

  // Content-Disposition 헤더에서 파일명 추출 시도
  const disposition = response.headers['content-disposition']
  let resolvedName = fileName
  if (disposition) {
    // filename*=UTF-8''encoded 또는 filename="name" 형태 모두 처리
    const utf8Match = disposition.match(/filename\*=UTF-8''(.+)/i)
    const asciiMatch = disposition.match(/filename="?([^";\n]+)"?/i)
    if (utf8Match) {
      resolvedName = decodeURIComponent(utf8Match[1])
    } else if (asciiMatch) {
      resolvedName = asciiMatch[1].trim()
    }
  }

  const url = window.URL.createObjectURL(new Blob([response.data]))
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', resolvedName)
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
}
