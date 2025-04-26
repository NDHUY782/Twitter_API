import { Request, Response, NextFunction } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { GetConversationParams } from '~/models/requests/Conversation.request'
import { Pagination } from '~/models/requests/Tweet.requests'
import { TokenPayload } from '~/models/requests/User.requests'
import conversationService from '~/services/conversation.service'

export const getConversationController = async (req: Request<GetConversationParams>, res: Response) => {
  const conversation_id = req.params.conversation_id
  const { limit, page } = req.query
  const { user_id } = req.decoded_authorization as TokenPayload
  const result = await conversationService.getConversation(user_id, conversation_id, Number(limit), Number(page))
  return res.json(result)
}

export const createConversationController = async (req: Request, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const user_id_2 = req.body.user_id_2
  const result = await conversationService.createConversation(user_id, user_id_2)
  return res.json(result)
}
