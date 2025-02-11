import { Request } from 'express'
import { getNameFromFullname, handleUploadImage, handleUploadVideo } from '~/utils/file'
import sharp from 'sharp'
import { UPLOAD_IMAGE_DIR } from '~/constants/dir'
import path from 'path'
import fs from 'fs'
import fsPromise from 'fs/promises'
import { isProduction } from '~/constants/config'
import { MediaType } from '~/constants/enums'
import { Media } from '~/models/Other'
import { encodeHLSWithMultipleVideoStreams } from '~/utils/video'

class MediasService {
  async uploadImage(req: Request) {
    const files = await handleUploadImage(req)
    const result: Media[] = await Promise.all(
      files.map(async (file) => {
        const newName = getNameFromFullname(file.newFilename)
        const newPath = path.resolve(UPLOAD_IMAGE_DIR, `${newName}.jpg`)
        await sharp(file.filepath).jpeg().toFile(newPath)

        // fs.unlinkSync(file.filepath)

        // return `http://localhost:4000/uploads/${newName}.jpg`
        return {
          url: isProduction
            ? `${process.env.HOST}/static/${newName}.jpg`
            : `http://localhost:${process.env.PORT}/api/static/image/${newName}.jpg`,
          type: MediaType.Image
        }
      })
    )
    return result
  }
  async uploadVideo(req: Request) {
    const files = await handleUploadVideo(req)
    console.log(files)
    // const { newFilename } = files[0]
    const result: Media[] = files.map((file) => {
      console.log(file)
      return {
        url: isProduction
          ? `${process.env.HOST}/static/${file.newFilename}`
          : `http://localhost:${process.env.PORT}/api/static/video/${file.newFilename}`,
        type: MediaType.Video
      }
    })

    return result
  }
  async uploadVideoHLS(req: Request) {
    const files = await handleUploadVideo(req)
    const result: Media[] = await Promise.all(
      files.map(async (file) => {
        await encodeHLSWithMultipleVideoStreams(file.filepath)
        const newName = getNameFromFullname(file.newFilename)
        await fsPromise.unlink(file.filepath)
        return {
          url: isProduction
            ? `${process.env.HOST}/static/${newName}`
            : `http://localhost:${process.env.PORT}/api/static/video-hls/${newName}`,
          type: MediaType.HLS
        }
      })
    )

    return result
  }
}

const mediasService = new MediasService()
export default mediasService
