

import { client } from './client'

export const plantApi = {

  getAll: () =>
    client.get('/api/v1/plant'),

  getById: (id) =>
    client.get(`/api/v1/plant/${id}`),

  getState: (id) =>
    client.get(`/api/v1/plant/${id}/state`),

  getTelemetry: (id, range = '7d') =>
    client.get(`/api/v1/plant/${id}/telemetry?range=${range}`),

  create: ({ plantType, plantName, initialAgeDays = 0 }) =>
    client.post('/api/v1/plant', { plantType, plantName, initialAgeDays }),

  update: (id, data) =>
    client.put(`/api/v1/plant/${id}`, data),

  remove: (id) =>
    client.delete(`/api/v1/plant/${id}`),

  getUploadUrl: (plantId, fileType = 'jpg') =>
    client.post(`/api/v1/plant/${plantId}/upload-url`, { fileType }),

  uploadToS3: async (presignedUrl, file) => {
    const res = await fetch(presignedUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': file.type || 'image/jpeg'
      },
      body: file,
    })

    if (!res.ok) {
      const errText = await res.text().catch(() => '')
      throw new Error(`S3 returned ${res.status}: ${errText}`)
    }
    return true
  },

  checkHardware: (hardwareId) =>
    client.get(`/api/v1/plant/sensor/check/${hardwareId}`),

  linkSensor: (plantId, hardwareId, forceReassign = false) =>
    client.put(`/api/v1/plant/${plantId}/sensor`, { hardwareId, forceReassign }),
}
