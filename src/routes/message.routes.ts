import { Router } from 'express'
import {
  createMessageController,
  getListMessagesByConversationController,
  markAsSeen
} from '~/controllers/message.controller'
import { paginationValidator } from '~/middleware/tweet.middlewares'
import { accessTokenValidator, verifiedUserValidator } from '~/middleware/users.middlewares'
import { wrapAsync, wrapRequestHandler, wrapRequest } from '~/utils/handlers'

const messageRoute = Router()

/**
 * Description: Send message to a conversation
 * Path: /send-message/:conversation_id
 * Method: POST
 * Body: {content: string}
 * Header: {Authorization: Bearer <access_token>}
 */
messageRoute.post(
  '/send-message/:conversation_id',
  accessTokenValidator,
  verifiedUserValidator,
  wrapAsync(createMessageController)
)

/**
 * Description: Get list message in conversation
 * Path: /get-messages/:conversation_id
 * Method: GET
 * Body: {limit: string, page: string}
 * Header: {Authorization: Bearer <access_token>}
 */
messageRoute.get(
  '/get-messages/:conversation_id',
  accessTokenValidator,
  paginationValidator,
  wrapAsync(getListMessagesByConversationController)
)
/**
 * Description: Get list message in conversation
 * Path: /get-messages/:conversation_id
 * Method: GET
 * Body: {limit: string, page: string}
 * Header: {Authorization: Bearer <access_token>}
 */
messageRoute.get('/mark-as-seen/:conversation_id', accessTokenValidator, wrapAsync(markAsSeen))

export default messageRoute
