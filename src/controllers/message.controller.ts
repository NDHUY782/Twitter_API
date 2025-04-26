import { NextFunction, Request, Response } from 'express'
import messageService from '../services/message.service'
import { TokenPayload } from '~/models/requests/User.requests'
import { GetConversationParams } from '~/models/requests/Conversation.request'

export const createMessageController = async (
  req: Request<GetConversationParams>,
  res: Response,
  next: NextFunction
) => {
  const { conversation_id } = req.params
  const { user_id } = req.decoded_authorization as TokenPayload
  const { content, receiver_id } = req.body
  const message = await messageService.createMessage({
    conversation_id,
    receiver_id,
    user_id,
    content
  })
  return res.json(message)
}

export const getListMessagesByConversationController = async (
  req: Request<GetConversationParams>,
  res: Response,
  next: NextFunction
) => {
  const { conversation_id } = req.params
  const { limit, page } = req.query
  const messages = await messageService.getListMessagesByConversation(conversation_id, Number(limit), Number(page))
  return res.json(messages)
}

export const markAsSeen = async (req: Request, res: Response) => {
  try {
    const { message_id } = req.body
    const result = await messageService.markAsSeen(message_id)
    return res.json(result)
  } catch (error) {
    res.status(500).json({ error: 'Failed to mark message as seen' })
  }
}
