import { PathsObject } from 'openapi3-ts/oas30'

export const conversationPaths: PathsObject = {
  '/conversations': {
    get: {
      summary: 'Get list of conversations',
      description: 'Retrieve paginated list of conversations for the authenticated user',
      tags: ['Conversation'],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'limit',
          in: 'query',
          required: true,
          schema: { type: 'integer', minimum: 1 },
          description: 'Number of conversations per page'
        },
        {
          name: 'page',
          in: 'query',
          required: true,
          schema: { type: 'integer', minimum: 1 },
          description: 'Page number'
        }
      ],
      responses: {
        '200': {
          description: 'Conversations fetched successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  total: { type: 'integer' },
                  page: { type: 'integer' },
                  limit: { type: 'integer' },
                  data: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        _id: { type: 'string', format: 'objectId' },
                        sender_id: { type: 'string', format: 'objectId' },
                        receiver_id: { type: 'string', format: 'objectId' },
                        created_at: { type: 'string', format: 'date-time' },
                        updated_at: { type: 'string', format: 'date-time' }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  },

  '/conversations/{conversation_id}': {
    get: {
      summary: 'Get a specific conversation',
      description: 'Retrieve a single conversation by ID for the authenticated user',
      tags: ['Conversation'],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'conversation_id',
          in: 'path',
          required: true,
          schema: { type: 'string', format: 'objectId' },
          description: 'ID of the conversation to fetch'
        },
        {
          name: 'limit',
          in: 'query',
          required: true,
          schema: { type: 'integer', minimum: 1 },
          description: 'Number of records per page'
        },
        {
          name: 'page',
          in: 'query',
          required: true,
          schema: { type: 'integer', minimum: 1 },
          description: 'Page number'
        }
      ],
      responses: {
        '200': {
          description: 'Conversation fetched successfully',
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    _id: { type: 'string', format: 'objectId' },
                    sender_id: { type: 'string', format: 'objectId' },
                    receiver_id: { type: 'string', format: 'objectId' },
                    created_at: { type: 'string', format: 'date-time' },
                    updated_at: { type: 'string', format: 'date-time' }
                  }
                }
              }
            }
          }
        },
        '404': {
          description: 'Conversation not found',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: { type: 'string' }
                }
              }
            }
          }
        }
      }
    }
  },

  '/conversations/create': {
    post: {
      summary: 'Create a new conversation',
      description: 'Start a new conversation between the authenticated user and another user',
      tags: ['Conversation'],
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['user_id_2'],
              properties: {
                user_id_2: {
                  type: 'string',
                  format: 'objectId',
                  description: 'ID of the user to converse with'
                }
              }
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'Conversation created',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  acknowledged: { type: 'boolean' },
                  insertedId: { type: 'string', format: 'objectId' }
                }
              }
            }
          }
        },
        '400': {
          description: 'Conversation already exists',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: { type: 'string' }
                }
              }
            }
          }
        }
      }
    }
  }
}
