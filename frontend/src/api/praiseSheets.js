import client from './client'

export const getPraiseSheets = async ({ page = 0, size = 10, keyword } = {}) => {
  const { data } = await client.get('/api/praise-sheets', { params: { page, size, keyword } })
  return data.data
}

export const getPraiseSheet = async (id) => {
  const { data } = await client.get(`/api/praise-sheets/${id}`)
  return data.data
}

export const increasePraiseSheetViews = async (id) => {
  await client.post(`/api/praise-sheets/${id}/views`)
}

export const togglePraiseSheetPin = async (id) => {
  const { data } = await client.patch(`/api/praise-sheets/${id}/pin`)
  return data
}

export const createPraiseSheet = async (formData) => {
  const { data } = await client.post('/api/praise-sheets', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data.data
}

export const updatePraiseSheet = async ({ id, formData }) => {
  const { data } = await client.put(`/api/praise-sheets/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data.data
}

export const uploadPraiseSheetImage = async (file) => {
  const form = new FormData()
  form.append('image', file)
  const { data } = await client.post('/api/praise-sheets/upload-image', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data.data.url
}

export const deletePraiseSheet = async (id) => {
  const { data } = await client.delete(`/api/praise-sheets/${id}`)
  return data
}
