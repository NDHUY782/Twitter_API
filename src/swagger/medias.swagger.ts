import { PathsObject } from 'openapi3-ts/oas30'

export const mediaPaths: PathsObject = {
  '/media/upload-image': {
    post: {
      summary: 'Upload image files',
      description: 'Upload one or more images and receive their accessible URLs',
      tags: ['Media'],
      requestBody: {
        required: true,
        content: {
          'multipart/form-data': {
            schema: {
              type: 'object',
              required: ['images'],
              properties: {
                images: {
                  type: 'array',
                  items: { type: 'string', format: 'binary' },
                  description: 'Array of image files'
                }
              }
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'Upload Success',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  msg: { type: 'string' },
                  result: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        url: { type: 'string', format: 'uri' },
                        type: { type: 'integer', description: 'MediaType.Image = 0' }
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

  '/media/upload-video': {
    post: {
      summary: 'Upload video files',
      description: 'Upload one or more videos and receive their accessible URLs',
      tags: ['Media'],
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'multipart/form-data': {
            schema: {
              type: 'object',
              required: ['videos'],
              properties: {
                videos: {
                  type: 'array',
                  items: { type: 'string', format: 'binary' },
                  description: 'Array of video files'
                }
              }
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'Upload Success',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  msg: { type: 'string' },
                  result: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        url: { type: 'string', format: 'uri' },
                        type: { type: 'integer', description: 'MediaType.Video = 1' }
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

  '/media/upload-video-hls': {
    post: {
      summary: 'Upload video files for HLS',
      description: 'Upload video files which will be processed to HLS format',
      tags: ['Media'],
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'multipart/form-data': {
            schema: {
              type: 'object',
              required: ['videos'],
              properties: {
                videos: {
                  type: 'array',
                  items: { type: 'string', format: 'binary' },
                  description: 'Array of video files'
                }
              }
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'Upload Success',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  msg: { type: 'string' },
                  result: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        url: { type: 'string', format: 'uri' },
                        type: { type: 'integer', description: 'MediaType.HLS = 2' }
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
}
