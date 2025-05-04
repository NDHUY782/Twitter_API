import { PathsObject } from 'openapi3-ts/oas30'

export const likePaths: PathsObject = {
  '/likes': {
    post: {
      summary: 'Like a tweet',
      description: 'Add a like to the specified tweet for the authenticated user',
      tags: ['Likes'],
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['tweet_id'],
              properties: {
                tweet_id: {
                  type: 'string',
                  format: 'objectId',
                  description: 'ID of the tweet to like'
                }
              }
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'Like Success',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  msg: { type: 'string' },
                  result: {
                    type: 'object',
                    properties: {
                      _id: { type: 'string', format: 'objectId' },
                      user_id: { type: 'string', format: 'objectId' },
                      tweet_id: { type: 'string', format: 'objectId' },
                      created_at: { type: 'string', format: 'date-time' }
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

  '/likes/tweet/{tweet_id}': {
    delete: {
      summary: 'Remove like from a tweet',
      description: 'Delete the like for the specified tweet by the authenticated user',
      tags: ['Likes'],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'tweet_id',
          in: 'path',
          required: true,
          schema: { type: 'string', format: 'objectId' },
          description: 'ID of the tweet to unlike'
        }
      ],
      responses: {
        '200': {
          description: 'unlike Success',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  msg: { type: 'string' },
                  result: {
                    type: 'object',
                    properties: {
                      _id: { type: 'string', format: 'objectId' },
                      user_id: { type: 'string', format: 'objectId' },
                      tweet_id: { type: 'string', format: 'objectId' },
                      created_at: { type: 'string', format: 'date-time' }
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
}
