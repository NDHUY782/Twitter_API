import { Db, ObjectId } from 'mongodb'
import Message from '~/models/schemas/Message.Schema'
import databaseService from '~/services/database.service'

export class MessageService {
  async createMessage({
    user_id,
    conversation_id,
    receiver_id,
    content
  }: {
    user_id: string
    receiver_id: string
    conversation_id: string
    content: string
  }) {
    const existingConversation = await databaseService.conversations.findOne({
      _id: new ObjectId(conversation_id),
      $or: [
        {
          sender_id: new ObjectId(user_id),
          receiver_id: new ObjectId(receiver_id)
        },
        {
          sender_id: new ObjectId(receiver_id),
          receiver_id: new ObjectId(user_id)
        }
      ]
    })
    if (!existingConversation) {
      throw new Error('Conversation not found')
    }

    const message = new Message({
      conversation_id: new ObjectId(conversation_id),
      sender_id: new ObjectId(user_id),
      receiver_id: new ObjectId(receiver_id),
      content: content,
      created_at: new Date(),
      seen: false
    })
    await databaseService.messages.insertOne(message)
    const result = await databaseService.messages.findOne({
      _id: message._id
    })
    if (!result) {
      throw new Error('Message not found')
    }

    return result
  }
  async getListMessagesByConversation(conversation_id: string, limit: number, page: number) {
    const existingConversation = await databaseService.conversations.findOne({
      _id: new ObjectId(conversation_id)
    })
    if (!existingConversation) {
      throw new Error('Conversation not found')
    }
    const messages = await databaseService.messages
      .find({
        conversation_id: new ObjectId(conversation_id)
      })
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ created_at: 1 })
      .toArray()
    return messages
  }
  async markAsSeen(message_id: string) {
    const result = await databaseService.messages.updateOne({ _id: new ObjectId(message_id) }, { $set: { seen: true } })
    return result.modifiedCount > 0
  }
}
const messageService = new MessageService()
export default messageService
