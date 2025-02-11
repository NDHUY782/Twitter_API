import { Router } from 'express'
import { serveImageController, serveVideoStreamController } from '~/controllers/media.controller'
import { wrapRequestHandler, wrapAsync } from '~/utils/handlers'

const staticRoute = Router()

staticRoute.get('/image/:name', wrapRequestHandler(serveImageController))
staticRoute.get('/video-stream/:name', wrapAsync(serveVideoStreamController))

export default staticRoute
