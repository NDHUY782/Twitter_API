import { ParamsDictionary } from 'express-serve-static-core'

export interface GetConversationParams extends ParamsDictionary {
  conversation_id: string
}
