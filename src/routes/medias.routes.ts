import { Router } from 'express'
import { uploadImageController, uploadVideoController, uploadVideoHLSController } from '~/controllers/media.controller'
import { accessTokenValidator, verifiedUserValidator } from '~/middleware/users.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'

const mediaRouter = Router()

mediaRouter.post(
  '/upload-image',
  // accessTokenValidator,
  // verifiedUserValidator,
  wrapRequestHandler(uploadImageController)
)

mediaRouter.post(
  '/upload-video',
  accessTokenValidator,
  verifiedUserValidator,
  wrapRequestHandler(uploadVideoController)
)

mediaRouter.post(
  '/upload-video-hls',
  accessTokenValidator,
  verifiedUserValidator,
  wrapRequestHandler(uploadVideoHLSController)
)

export default mediaRouter
