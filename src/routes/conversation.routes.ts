import { Router } from 'express'
import { getConversationController } from '~/controllers/conversation.controller'
import { accessTokenValidator, verifiedUserValidator } from '~/middleware/users.middlewares'
import { wrapAsync, wrapRequestHandler, wrapRequest } from '~/utils/handlers'

const conversationRoute = Router()
/**
 * Description: get list conversation
 * Path: /
 * Method: POST
 * Body: {tweet_id}
 * Header: {Authorization: Bearer <access_token>}
 */

conversationRoute.get('/', accessTokenValidator, verifiedUserValidator, wrapAsync(getConversationController))

export default conversationRoute
