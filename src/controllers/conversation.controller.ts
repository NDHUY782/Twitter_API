import { Request, Response, NextFunction } from 'express'
import conversationService from '~/services/conversation.service'

export const getConversationController = async (req: Request, res: Response) => {
  // const result = await conversationService.getConversation()
  return res.json({
    message: 'Get conversation successfully'
  })
}
