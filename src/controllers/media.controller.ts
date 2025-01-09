import { Request, Response, NextFunction } from 'express'
import { USERS_MESSAGES } from '~/constants/messages'
import mediasService from '~/services/medias.service'

export const uploadSingleImageController = async (req: Request, res: Response, next: NextFunction) => {
  const url = await mediasService.handleUploadSingleImage(req)
  return res.json({
    msg: USERS_MESSAGES.UPLOAD_SUCCESS,
    result: url
  })
}
