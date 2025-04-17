import { config } from 'dotenv'
import { ObjectId, WithId } from 'mongodb'
import { TokenType, UserVerifyStatus } from '~/constants/enums'
import HTTP_STATUS from '~/constants/httpStatus'
import { USERS_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Errors'
import { BookmarkTweetReqBody } from '~/models/requests/Bookmark.requests'
import Bookmark from '~/models/schemas/Bookmark.Schena'
import Tweet from '~/models/schemas/Tweet.schema'
import databaseService from '~/services/database.service'

config()
class ConversationService {
  async getConversation() {
    console.log(123)
  }
}

const conversationService = new ConversationService()
export default conversationService
