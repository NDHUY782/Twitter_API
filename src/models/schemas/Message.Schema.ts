import { ObjectId } from 'mongodb'

interface MessageType {
  _id?: ObjectId
  conversation_id: ObjectId
  sender_id: ObjectId
  receiver_id: ObjectId
  content: string
  created_at?: Date
  seen?: boolean
}

export default class Message {
  _id?: ObjectId
  conversation_id: ObjectId
  sender_id: ObjectId
  receiver_id: ObjectId
  content: string
  created_at: Date
  seen: boolean

  constructor({ _id, conversation_id, sender_id, receiver_id, content, created_at, seen }: MessageType) {
    this._id = _id
    this.conversation_id = conversation_id
    this.sender_id = sender_id
    this.receiver_id = receiver_id
    this.content = (content || '').trim()
    this.created_at = created_at || new Date()
    this.seen = seen ?? false
  }
}
