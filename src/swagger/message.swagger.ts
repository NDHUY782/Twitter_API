import { PathsObject } from 'openapi3-ts/oas30'

export const messagePaths: PathsObject = {
  '/messages/send-message/{conversation_id}': {
    post: {
      tags: ['Messages'],
      summary: 'Send a new message',
      parameters: [
        {
          name: 'conversation_id',
          in: 'path',
          required: true,
          schema: { type: 'string', format: 'objectId' }
        }
      ],
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['receiver_id', 'content'],
              properties: {
                receiver_id: { type: 'string', format: 'objectId' },
                content: { type: 'string' }
              }
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'Message sent',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  _id: { type: 'string', format: 'objectId' },
                  conversation_id: { type: 'string', format: 'objectId' },
                  sender_id: { type: 'string', format: 'objectId' },
                  receiver_id: { type: 'string', format: 'objectId' },
                  content: { type: 'string' },
                  created_at: { type: 'string', format: 'date-time' },
                  seen: { type: 'boolean' }
                }
              }
            }
          }
        }
      }
    }
  },

  '/messages/get-messages/{conversation_id}': {
    get: {
      tags: ['Messages'],
      summary: 'List messages in a conversation',
      parameters: [
        {
          name: 'conversation_id',
          in: 'path',
          required: true,
          schema: { type: 'string', format: 'objectId' }
        },
        {
          name: 'limit',
          in: 'query',
          required: true,
          schema: { type: 'integer', minimum: 1 }
        },
        {
          name: 'page',
          in: 'query',
          required: true,
          schema: { type: 'integer', minimum: 1 }
        }
      ],
      security: [{ bearerAuth: [] }],
      responses: {
        '200': {
          description: 'Array of messages',
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    _id: { type: 'string', format: 'objectId' },
                    conversation_id: { type: 'string', format: 'objectId' },
                    sender_id: { type: 'string', format: 'objectId' },
                    receiver_id: { type: 'string', format: 'objectId' },
                    content: { type: 'string' },
                    created_at: { type: 'string', format: 'date-time' },
                    seen: { type: 'boolean' }
                  }
                }
              }
            }
          }
        }
      }
    }
  },

  '/messages/mark-as-seen': {
    post: {
      tags: ['Messages'],
      summary: 'Mark a message as seen',
      description: 'Set the "seen" flag to true for a given message',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['message_id'],
              properties: {
                message_id: { type: 'string', format: 'objectId' }
              }
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'True if marked, false otherwise',
          content: {
            'application/json': {
              schema: {
                type: 'boolean'
              }
            }
          }
        }
      }
    }
  }
}
