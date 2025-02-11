import { Request, Response, NextFunction } from 'express'
import path from 'path'
import { UPLOAD_IMAGE_DIR, UPLOAD_VIDEO_DIR, UPLOAD_VIDEO_TEMP_DIR } from '~/constants/dir'
import HTTP_STATUS from '~/constants/httpStatus'
import { USERS_MESSAGES } from '~/constants/messages'
import mediasService from '~/services/medias.service'
import fs from 'fs'
export const uploadImageController = async (req: Request, res: Response, next: NextFunction) => {
  const url = await mediasService.uploadImage(req)
  res.json({
    msg: USERS_MESSAGES.UPLOAD_SUCCESS,
    result: url
  })
}

export const uploadVideoController = async (req: Request, res: Response, next: NextFunction) => {
  const url = await mediasService.uploadVideo(req)
  res.json({
    msg: USERS_MESSAGES.UPLOAD_SUCCESS,
    result: url
  })
}

export const serveImageController = async (req: Request, res: Response, next: NextFunction) => {
  const { name } = req.params
  res.sendFile(path.resolve(UPLOAD_IMAGE_DIR, name), (err) => {
    if (err) {
      res.status((err as any).status).send('Not Found')
    }
  })
}
export const serveVideoStreamController = async (req: Request, res: Response, next: NextFunction) => {
  const range = req.headers.range
  if (!range) {
    return res.status(HTTP_STATUS.BAD_REQUEST).send('Require Range header')
  }
  const { name } = req.params
  const videoPath = path.resolve(UPLOAD_VIDEO_DIR, name)
  //1MB = 10^byte
  //Tính theo nhị phân thì 1MB = 2^20 bytes (1024*1024)

  //Dung lượng vide0
  const videoSize = fs.statSync(videoPath).size
  //Dung lượng video cho mỗi phân đoạn video
  const chunkSize = 10 ** 6 // 1MB
  //Lấy giá trị byte bắt đấu từ header Range
  const start = Number(range.replace(/\D/g, ''))
  //Lấy giá trị byte kết thúc
  const end = Math.min(start + chunkSize, videoSize - 1)

  //Dung lượng thực tế cho mỗi video stream
  //Thường đây sẽ là chunkSize, ngoại trừ đoạn cuối
  const contentLength = end - start + 1
  const mime = (await import('mime')).default
  const contentType = mime.getType(videoPath) || 'video/*'
  const headers = {
    'Content-Range': `bytes ${start}-${end}/${videoSize}`,
    'Accept-Ranges': 'bytes',
    'Content-Length': contentLength,
    'Content-Type': contentType
  }
  res.writeHead(HTTP_STATUS.PARTIAL_CONTENT, headers)
  const videoStream = fs.createReadStream(videoPath, { start, end })
  videoStream.pipe(res)
  return res
}
export const uploadVideoHLSController = async (req: Request, res: Response, next: NextFunction) => {
  const url = await mediasService.uploadVideoHLS(req)
  res.json({
    msg: USERS_MESSAGES.UPLOAD_SUCCESS,
    result: url
  })
}
