/**
 * 업로드 전 이미지 리사이즈
 * 서버(ThumbnailGenerator)가 어차피 원본을 1920px로 줄여 저장하므로,
 * 전송 전에 같은 크기로 줄여 보내면 화질 손실 없이 업로드 용량만 크게 줄어든다.
 * (DSLR 원본 8~10MB → 약 0.5~1MB)
 */

const MAX_DIMENSION = 1920   // 서버 ThumbnailGenerator.RESIZE_MAX_WIDTH와 동일
const JPEG_QUALITY  = 0.85
const SKIP_UNDER    = 1024 * 1024   // 1MB 미만이면 그대로 전송

/**
 * 이미지 1장을 최대 1920px·JPEG로 변환한다.
 * 실패하거나 줄일 이유가 없으면 원본 File을 그대로 반환한다(업로드는 계속 가능).
 * GIF는 애니메이션이 깨지므로 변환하지 않는다.
 */
export const resizeImageFile = async (file) => {
  if (!file?.type?.startsWith('image/')) return file
  if (file.type === 'image/gif') return file

  let bitmap
  try {
    bitmap = await createImageBitmap(file)
  } catch {
    return file   // 브라우저가 못 읽는 형식이면 원본 그대로
  }

  const { width, height } = bitmap
  const scale = Math.min(1, MAX_DIMENSION / Math.max(width, height))
  if (scale === 1 && file.size < SKIP_UNDER) { bitmap.close(); return file }

  try {
    const canvas = document.createElement('canvas')
    canvas.width  = Math.round(width * scale)
    canvas.height = Math.round(height * scale)

    const ctx = canvas.getContext('2d')
    // JPEG는 투명도를 지원하지 않아 PNG 투명 영역이 검게 나오므로 흰색으로 채운다
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height)

    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', JPEG_QUALITY))
    if (!blob || blob.size >= file.size) return file   // 오히려 커지면 원본 유지

    const name = file.name.replace(/\.[^.]+$/, '') + '.jpg'
    return new File([blob], name, { type: 'image/jpeg', lastModified: Date.now() })
  } catch {
    return file
  } finally {
    bitmap.close()
  }
}

/** 여러 장을 순차 처리 (동시 처리 시 모바일에서 메모리 부담이 커짐) */
export const resizeImageFiles = async (files) => {
  const result = []
  for (const file of files) result.push(await resizeImageFile(file))
  return result
}

/** 바이트 → 사람이 읽는 크기 */
export const formatFileSize = (bytes) => {
  if (!bytes) return '0 KB'
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}
