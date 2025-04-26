import { config } from 'dotenv'
import { ObjectId, WithId } from 'mongodb'
import { TokenType, UserVerifyStatus } from '~/constants/enums'
import HTTP_STATUS from '~/constants/httpStatus'
import { USERS_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Errors'
import { BookmarkTweetReqBody } from '~/models/requests/Bookmark.requests'
import Bookmark from '~/models/schemas/Bookmark.Schena'
import Conversation from '~/models/schemas/Conversation.Schema'
import Tweet from '~/models/schemas/Tweet.schema'
import databaseService from '~/services/database.service'

config()
class ConversationService {
  async getConversation(user_id: string, conversation_id: string, limit: number, page: number) {
    const conversation = await databaseService.conversations
      .find({
        _id: new ObjectId(conversation_id),
        $or: [
          {
            sender_id: new ObjectId(user_id)
          },
          {
            receiver_id: new ObjectId(user_id)
          }
        ]
      })
      .skip((page - 1) * limit)
      .limit(limit)
    if (!conversation) {
      throw new Error('Conversation not found')
    }
    return conversation
  }
  async createConversation(user_id_1: string, user_id_2: string) {
    const existingConversation = await databaseService.conversations.findOne({
      $or: [
        {
          sender_id: new ObjectId(user_id_1),
          receiver_id: new ObjectId(user_id_2)
        },
        {
          sender_id: new ObjectId(user_id_2),
          receiver_id: new ObjectId(user_id_1)
        }
      ]
    })
    if (existingConversation) {
      throw new ErrorWithStatus({
        message: USERS_MESSAGES.CONVERSATION_ALREADY_EXISTS,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }
    const conversation = await databaseService.conversations.insertOne(
      new Conversation({
        sender_id: new ObjectId(user_id_1),
        receiver_id: new ObjectId(user_id_2)
      })
    )
    return conversation
  }
}

const conversationService = new ConversationService()
export default conversationService
