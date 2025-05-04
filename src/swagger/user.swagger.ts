import { PathsObject } from 'openapi3-ts/oas30'

export const userPaths: PathsObject = {
  '/users/register': {
    post: {
      summary: 'Register new user',
      description: 'Register a new user account',
      tags: ['Users'],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['name', 'username', 'email', 'password', 'confirm_password', 'date_of_birth'],
              properties: {
                name: { type: 'string' },
                username: { type: 'string' },
                email: { type: 'string', format: 'email' },
                password: { type: 'string' },
                confirm_password: { type: 'string' },
                date_of_birth: { type: 'string', format: 'date' }
              }
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'Register Success',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  msg: { type: 'string' },
                  data: {
                    type: 'object',
                    properties: { access_token: { type: 'string' }, refresh_token: { type: 'string' } }
                  }
                }
              }
            }
          }
        }
      }
    }
  },

  '/users/login': {
    post: {
      summary: 'Login user',
      description: 'Authenticate user and return tokens',
      tags: ['Users'],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['email', 'password'],
              properties: {
                email: { type: 'string', format: 'email' },
                password: { type: 'string' }
              }
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'Login Success',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  msg: { type: 'string' },
                  data: {
                    type: 'object',
                    properties: { access_token: { type: 'string' }, refresh_token: { type: 'string' } }
                  }
                }
              }
            }
          }
        }
      }
    }
  },

  '/users/logout': {
    post: {
      summary: 'Logout user',
      description: 'Invalidate refresh token',
      tags: ['Users'],
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['refresh_token'],
              properties: {
                refresh_token: { type: 'string' }
              }
            }
          }
        }
      },
      responses: {
        '200': { description: 'Logout Success' }
      }
    }
  },

  '/users/refresh-token': {
    post: {
      summary: 'Refresh access token',
      description: 'Exchange a refresh token for a new access token',
      tags: ['Users'],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['refresh_token'],
              properties: {
                refresh_token: { type: 'string' }
              }
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'Token refreshed',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  msg: { type: 'string' },
                  data: {
                    type: 'object',
                    properties: { access_token: { type: 'string' }, refresh_token: { type: 'string' } }
                  }
                }
              }
            }
          }
        }
      }
    }
  },

  '/users/verify-email': {
    post: {
      summary: 'Verify email address',
      description: 'Confirm user email using a token',
      tags: ['Users'],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['email_verify_token'],
              properties: { email_verify_token: { type: 'string' } }
            }
          }
        }
      },
      responses: {
        '200': { description: 'Email verified' }
      }
    }
  },

  '/users/resend-verify-email': {
    post: {
      summary: 'Resend email verification',
      description: 'Send a new email verification token',
      tags: ['Users'],
      security: [{ bearerAuth: [] }],
      responses: {
        '200': { description: 'Verification email sent' }
      }
    }
  },

  '/users/forgot-password': {
    post: {
      summary: 'Request password reset',
      description: 'Send a forgot-password email',
      tags: ['Users'],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { type: 'object', required: ['email'], properties: { email: { type: 'string', format: 'email' } } }
          }
        }
      },
      responses: { '200': { description: 'Forgot password email sent' } }
    }
  },

  '/users/verify-forgot-password': {
    post: {
      summary: 'Verify forgot password token',
      description: 'Check validity of forgot-password token',
      tags: ['Users'],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['forgot_password_token'],
              properties: { forgot_password_token: { type: 'string' } }
            }
          }
        }
      },
      responses: { '200': { description: 'Token verified' } }
    }
  },

  '/users/change-password': {
    post: {
      summary: 'Change password',
      description: 'Update user password',
      tags: ['Users'],
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['old_password', 'password', 'confirm_password'],
              properties: {
                old_password: { type: 'string' },
                password: { type: 'string' },
                confirm_password: { type: 'string' }
              }
            }
          }
        }
      },
      responses: { '200': { description: 'Password changed' } }
    }
  },

  '/users/me': {
    get: {
      summary: 'Get my profile',
      description: 'Retrieve profile of authenticated user',
      tags: ['Users'],
      security: [{ bearerAuth: [] }],
      responses: {
        '200': {
          description: 'Profile data',
          content: { 'application/json': { schema: { type: 'object', properties: { result: { type: 'object' } } } } }
        }
      }
    },
    patch: {
      summary: 'Update my profile',
      description: 'Modify authenticated user profile fields',
      tags: ['Users'],
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: false,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                date_of_birth: { type: 'string', format: 'date' },
                avatar: { type: 'string', format: 'uri' },
                bio: { type: 'string' },
                location: { type: 'string' },
                website: { type: 'string', format: 'uri' },
                username: { type: 'string' },
                cover_photo: { type: 'string', format: 'uri' }
              }
            }
          }
        }
      },
      responses: { '200': { description: 'Profile updated' } }
    }
  },

  '/users/{username}': {
    get: {
      summary: 'Get public user profile',
      description: 'Retrieve profile by username',
      tags: ['Users'],
      parameters: [{ name: 'username', in: 'path', required: true, schema: { type: 'string' } }],
      responses: { '200': { description: 'Profile retrieved' } }
    }
  },

  '/users/follow': {
    post: {
      summary: 'Follow a user',
      description: 'Add another user to the follower list',
      tags: ['Users'],
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['followed_user_id'],
              properties: { followed_user_id: { type: 'string', format: 'objectId' } }
            }
          }
        }
      },
      responses: { '200': { description: 'Followed user' } }
    }
  },

  '/users/follow/{user_id}': {
    delete: {
      summary: 'Unfollow a user',
      description: 'Remove a user from follower list',
      tags: ['Users'],
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'user_id', in: 'path', required: true, schema: { type: 'string', format: 'objectId' } }],
      responses: { '200': { description: 'Unfollowed user' } }
    }
  },

  '/users/twitter-circle/add': {
    post: {
      summary: 'Add users to Twitter Circle',
      description: 'Include multiple users in your private circle',
      tags: ['Users'],
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['user_ids'],
              properties: { user_ids: { type: 'array', items: { type: 'string', format: 'objectId' } } }
            }
          }
        }
      },
      responses: { '200': { description: 'Users added to circle' } }
    }
  }
}
