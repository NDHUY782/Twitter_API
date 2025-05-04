import { Router } from 'express'
import {
  createConversationController,
  getConversationController,
  getConversationsController
} from '~/controllers/conversation.controller'
import { accessTokenValidator, verifiedUserValidator } from '~/middleware/users.middlewares'
import { wrapAsync, wrapRequestHandler, wrapRequest } from '~/utils/handlers'

const conversationRoute = Router()

/**
 * Description: get list conversations
 * Path: /
 * Method: GET
 * Header: {Authorization: Bearer <access_token>}
 */

conversationRoute.get('/', accessTokenValidator, verifiedUserValidator, wrapAsync(getConversationsController))

/**
 * Description: get list conversation
 * Path: /
 * Method: GET
 * Header: {Authorization: Bearer <access_token>}
 */
conversationRoute.get(
  '/:conversation_id',
  accessTokenValidator,
  verifiedUserValidator,
  wrapAsync(getConversationController)
)

/**
 * Description: create conversation
 * Path: /create
 * Method: POST
 * Body: {user_id_2: string, content: string}
 * Header: {Authorization: Bearer <access_token>}
 */
conversationRoute.post('/create', accessTokenValidator, verifiedUserValidator, wrapAsync(createConversationController))

export default conversationRoute
