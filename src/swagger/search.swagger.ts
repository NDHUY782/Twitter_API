import { PathsObject } from 'openapi3-ts/oas30'

export const searchPaths: PathsObject = {
  '/search': {
    get: {
      summary: 'Search tweets',
      description: 'Search tweets by content keywords, media type, and optionally filter to only those you follow',
      tags: ['Search'],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'limit',
          in: 'query',
          required: true,
          schema: { type: 'integer', minimum: 1, maximum: 100 },
          description: 'Number of results per page'
        },
        {
          name: 'page',
          in: 'query',
          required: true,
          schema: { type: 'integer', minimum: 1 },
          description: 'Page number'
        },
        {
          name: 'content',
          in: 'query',
          required: true,
          schema: { type: 'string' },
          description: 'Full-text search keywords'
        },
        {
          name: 'media_type',
          in: 'query',
          required: false,
          schema: { type: 'integer', enum: [0, 1] },
          description: 'Filter by media type: 0 = Image, 1 = Video/HLS'
        },
        {
          name: 'people_follow',
          in: 'query',
          required: false,
          schema: { type: 'string', enum: ['0', '1'] },
          description: '1 = only tweets from users you follow; omit or 0 = all users'
        }
      ],
      responses: {
        '200': {
          description: 'Search results',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  msg: { type: 'string' },
                  result: {
                    type: 'object',
                    properties: {
                      tweets: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/Tweet' }
                      },
                      limit: { type: 'integer' },
                      page: { type: 'integer' },
                      total_page: { type: 'integer' }
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
