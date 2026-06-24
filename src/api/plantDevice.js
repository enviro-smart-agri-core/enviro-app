import { plantApi } from '../api/plant'

export async function createPlantWithSensor({ plantType, plantName, initialAgeDays, plantPicFile, hardwareId }) {

  const createRes = await plantApi.create({ plantType, plantName, initialAgeDays })
  const newPlant  = createRes.data || createRes
  const plantId   = newPlant._id || newPlant.id

  if (!plantId) throw new Error('Plant was created but no ID was returned')

  if (plantPicFile && plantId) {
    try {
      const ext      = plantPicFile.name?.split('.').pop()?.toLowerCase() || 'jpg'
      const validExt = ['jpg', 'jpeg', 'png', 'webp'].includes(ext) ? ext : 'jpg'

      const uploadRes  = await plantApi.getUploadUrl(plantId, validExt)
      const uploadData = uploadRes.data || uploadRes
      const { objectKey, uploadUrl } = uploadData

      if (uploadUrl && objectKey) {
        await plantApi.uploadToS3(uploadUrl, plantPicFile)
        await plantApi.update(plantId, { pictureKey: objectKey })
      }
    } catch (imgErr) {

      console.warn('Image upload failed, plant still created:', imgErr.message)
    }
  }

  if (hardwareId?.trim()) {
    const hwId = hardwareId.trim()
    try {
      await plantApi.linkSensor(plantId, hwId, true)
    } catch (linkErr) {
      throw new Error(`Plant created but sensor link failed: ${linkErr.message}`)
    }
  }

  return { plantId }
}

export async function checkHardwareId(hardwareId) {
  try {
    const res  = await plantApi.checkHardware(hardwareId)
    return res.data || res
  } catch {

    return null
  }
}

export async function deletePlant(plantId) {
  await plantApi.remove(plantId)
}

export async function updatePlantPhoto(plantId, file) {
  const ext      = file.name?.split('.').pop()?.toLowerCase() || 'jpg'
  const validExt = ['jpg', 'jpeg', 'png', 'webp'].includes(ext) ? ext : 'jpg'

  const uploadRes  = await plantApi.getUploadUrl(plantId, validExt)
  const uploadData = uploadRes.data || uploadRes
  const { objectKey, uploadUrl } = uploadData

  if (!uploadUrl || !objectKey) throw new Error('Backend did not return upload URL')

  await plantApi.uploadToS3(uploadUrl, file)
  await plantApi.update(plantId, { pictureKey: objectKey })
}
