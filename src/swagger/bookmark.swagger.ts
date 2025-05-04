import { PathsObject } from 'openapi3-ts/oas30'

export const bookmarkPaths: PathsObject = {
  '/bookmarks': {
    post: {
      summary: 'Bookmark a tweet',
      description: 'Add a tweet to the authenticated user’s bookmarks',
      tags: ['Bookmarks'],
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
                  description: 'ID of the tweet to bookmark'
                }
              }
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'Bookmark Success',
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

  '/bookmarks/tweet/{tweet_id}': {
    delete: {
      summary: 'Unbookmark a tweet',
      description: 'Remove a tweet from the authenticated user’s bookmarks',
      tags: ['Bookmarks'],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'tweet_id',
          in: 'path',
          required: true,
          schema: { type: 'string', format: 'objectId' },
          description: 'ID of the tweet to unbookmark'
        }
      ],
      responses: {
        '200': {
          description: 'UnBookmark Success',
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
