import { PathsObject } from 'openapi3-ts/oas30'

export const tweetPaths: PathsObject = {
  '/tweets/create': {
    post: {
      tags: ['Tweet'],
      summary: 'Create a new tweet',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['type', 'audience', 'content', 'parent_id', 'hashtags', 'mentions', 'medias'],
              properties: {
                type: { type: 'integer', description: 'TweetType enum' },
                audience: { type: 'integer', description: 'TweetAudience enum' },
                content: { type: 'string' },
                parent_id: { type: ['string', 'null'], format: 'objectId', nullable: true },
                hashtags: { type: 'array', items: { type: 'string' } },
                mentions: { type: 'array', items: { type: 'string', format: 'objectId' } },
                medias: {
                  type: 'array',
                  items: {
                    type: 'object',
                    required: ['url', 'type'],
                    properties: {
                      url: { type: 'string', format: 'uri' },
                      type: { type: 'integer', description: 'MediaType enum' }
                    }
                  }
                }
              }
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'Create Success',
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
                      type: { type: 'integer' },
                      audience: { type: 'integer' },
                      content: { type: 'string' },
                      parent_id: { type: ['string', 'null'], format: 'objectId', nullable: true },
                      hashtags: { type: 'array', items: { type: 'string' } },
                      mentions: { type: 'array', items: { type: 'string', format: 'objectId' } },
                      medias: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            url: { type: 'string', format: 'uri' },
                            type: { type: 'integer' }
                          }
                        }
                      },
                      guest_views: { type: 'integer' },
                      user_views: { type: 'integer' },
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
  },

  '/tweets': {
    get: {
      tags: ['Tweet'],
      summary: 'Get new feed',
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'limit', in: 'query', required: true, schema: { type: 'integer', minimum: 1 } },
        { name: 'page', in: 'query', required: true, schema: { type: 'integer', minimum: 1 } }
      ],
      responses: {
        '200': {
          description: 'Get new feed Success',
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
                        items: {
                          type: 'object',
                          properties: {
                            _id: { type: 'string', format: 'objectId' },
                            user_id: { type: 'string', format: 'objectId' },
                            type: { type: 'integer' },
                            audience: { type: 'integer' },
                            content: { type: 'string' },
                            parent_id: { type: ['string', 'null'], format: 'objectId', nullable: true },
                            hashtags: { type: 'array', items: { type: 'string' } },
                            mentions: {
                              type: 'array',
                              items: {
                                type: 'object',
                                properties: {
                                  _id: { type: 'string' },
                                  name: { type: 'string' },
                                  username: { type: 'string' },
                                  email: { type: 'string', format: 'email' }
                                }
                              }
                            },
                            medias: {
                              type: 'array',
                              items: {
                                type: 'object',
                                properties: { url: { type: 'string' }, type: { type: 'integer' } }
                              }
                            },
                            bookmarks: { type: 'integer' },
                            likes: { type: 'integer' },
                            retweet_count: { type: 'integer' },
                            comment_count: { type: 'integer' },
                            quote_count: { type: 'integer' },
                            views: { type: 'integer' },
                            created_at: { type: 'string', format: 'date-time' },
                            updated_at: { type: 'string', format: 'date-time' }
                          }
                        }
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
  },

  '/tweets/{tweet_id}': {
    get: {
      tags: ['Tweet'],
      summary: 'Get tweet detail',
      security: [],
      parameters: [{ name: 'tweet_id', in: 'path', required: true, schema: { type: 'string', format: 'objectId' } }],
      responses: {
        '200': {
          description: 'Get tweet detail',
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
                      type: { type: 'integer' },
                      audience: { type: 'integer' },
                      content: { type: 'string' },
                      parent_id: { type: ['string', 'null'], format: 'objectId', nullable: true },
                      hashtags: { type: 'array', items: { type: 'string' } },
                      mentions: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            _id: { type: 'string' },
                            name: { type: 'string' },
                            username: { type: 'string' },
                            email: { type: 'string', format: 'email' }
                          }
                        }
                      },
                      medias: {
                        type: 'array',
                        items: { type: 'object', properties: { url: { type: 'string' }, type: { type: 'integer' } } }
                      },
                      guest_views: { type: 'integer' },
                      user_views: { type: 'integer' },
                      views: { type: 'integer' },
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
  },

  '/tweets/{tweet_id}/children': {
    get: {
      tags: ['Tweet'],
      summary: 'Get tweet children',
      security: [],
      parameters: [
        { name: 'tweet_id', in: 'path', required: true, schema: { type: 'string', format: 'objectId' } },
        { name: 'tweet_type', in: 'query', required: true, schema: { type: 'integer' } },
        { name: 'limit', in: 'query', required: true, schema: { type: 'integer', minimum: 1 } },
        { name: 'page', in: 'query', required: true, schema: { type: 'integer', minimum: 1 } }
      ],
      responses: {
        '200': {
          description: 'Get tweet children Success',
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
                        items: {
                          type: 'object',
                          properties: {
                            /* same structure as above */
                          }
                        }
                      },
                      tweet_type: { type: 'integer' },
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
