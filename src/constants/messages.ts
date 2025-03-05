export const USERS_MESSAGES = {
  VALIDATION_ERROR: 'Validation Error',
  NAME_IS_REQUIRED: 'Name must required',
  NAME_MUST_BE_A_STRING: 'Name must be a string',
  NAME_LENGTH: 'Name length at least 1-100',
  EMAIL_IS_REQUIRED: 'Email must required',
  EMAIL_EXIST: 'Email al ready exist',
  EMAIL_ALREADY_EXIST: 'Email already exist',
  EMAIL_IS_INVALID: 'Email must be a string',
  PASSWORD_IS_REQUIRED: 'Password must required',
  PASSWORD_MUST_BE_A_STRING: 'Password must be a string',
  PASSWORD_LENGTH: 'Password length MUST BE 6-50',
  PASSWORD_MUST_BE_STRONG: 'Password must be strong',
  PASSWORD_CONFIRMATION_IS_REQUIRED: 'Password Confirmation must required',
  PASSWORD_CONFIRMATION_MUST_BE_A_STRING: 'Password Confirmation must be a string',
  PASSWORD_CONFIRMATION_LENGTH: 'Password Confirmation length MUST BE 6-50',
  PASSWORD_CONFIRMATION_MUST_BE_STRONG: 'Password Confirmation must be strong',
  PASSWORD_CONFIRMATION_MUST_MATCH: 'Password Confirmation must match',
  DATE_OF_BIRTH_MUST_ISO8601: 'Date of birth must be ios8601',
  EMAIL_OR_PASSWORD_IS_INCORRECT: 'Email or password is incorrect',
  AUTHORIZATION_HEADER_IS_REQUIRED: ' Authorization header is required',
  REFRESH_TOKEN_IS_REQUIRED: ' Refresh token is required',
  REFRESH_TOKEN_IS_INVALID: ' Refresh token is invalid ',
  USED_REFRESH_TOKEN_OR_NOT_EXIST: ' Refresh token is used or not exist',
  LOGOUT_SUCCESS: 'Log out success',
  ACCESS_TOKEN_IS_INVALID: 'Access token is invalid',
  USER_NOT_FOUND: 'User not found',
  EMAIL_ALREADY_VERIFIED_BEFORE: 'Email already verified before',
  EMAIL_ALREADY_VERIFIED: 'Email already verified',
  USER_IS_NOT_VERIFIED: 'User is not verified',
  RESEND_EMAIL_VERIFY_SUCCESS: 'Resend email verify success',
  CHECK_EMAIL_TO_RESET_PASSWORD: 'Please check email to reset password',
  FORGOT_PASSWORD_TOKEN_IS_REQUIRE: 'Forgot password is required',
  VERIFY_FORGOT_PASSWORD_SUCCESS: 'Verify forgot password success',
  INVALID_FORGOT_PASSWORD_TOKEN: 'Invalid forgot password token',
  BIO_SHOULD_BE_A_STRING: 'Bio should be a string',
  BIO_LENGTH: 'Bio length MUST BE 6-50',
  LOCATION_SHOULD_BE_A_STRING: 'Location should be a string',
  LOCATION_LENGTH: 'Location length MUST BE 6-200',
  WEBSITE_SHOULD_BE_A_STRING: 'Website should be a string',
  WEBSITE_LENGTH: 'Website length MUST BE 6-200',
  USERNAME_SHOULD_BE_A_STRING: 'Username should be a string',
  USERNAME_INVALID: 'Username MUST BE 4-15, contain only underscores, number,',
  IMAGE_URL_MUST_BE_STRING: 'Image URL must be a string',
  IMAGE_URL_LENGTH: 'Image URL length MUST BE 6-450',
  UPDATE_ME_SUCCESS: 'Update me success',
  GET_USER_PROFILE_SUCCESS: 'Get user profile success',
  FOLLOW_SUCCESS: 'Follow success',
  INVALID_USER_ID: 'Invalid user id',
  ALREADY_FOLLOWED: 'Already followed',
  ALREADY_UNFOLLOW_SUCCESS: 'Already unfollow success',
  UNFOLLOW_SUCCESS: 'Unfollow success',
  USERNAME_EXIST: 'Username already exist',
  OLD_PASSWORD_NOT_MATCH: 'Old password not match',
  CHANGE_PASSWORD_SUCCESS: 'Change password success',
  UPLOAD_SUCCESS: 'Upload success',
  REFRESH_TOKEN_SUCCESS: 'Refresh token success',
  ACCESS_TOKEN_IS_REQUIRED: 'Access token is required'
} as const
export const TWEET_MESSAGES = {
  INVALID_TYPE: 'Invalid type',
  INVALID_AUDIENCE: 'Invalid audience',
  INVALID_PARENT_ID: 'Invalid parent id',
  PARENT_ID_MUST_BE_NULL: 'Parent id must be null',
  CONTENT_MUST_BE_NON_EMPTY_STRING: 'Content must be non empty string',
  CONTENT_MUST_BE_EMPTY_STRING: 'Content must be empty string',
  HASHTAGS_MUST_BE_AN_ARRAY_OF_STRINGS: 'Hashtags must be an array of strings',
  MENTIONS_MUST_BE_AN_ARRAY_OF_USER_ID: 'Mentions must be an array of user id',
  MEDIAS_MUST_BE_AN_ARRAY_OF_MEDIA_OBJECT: 'Medias must be an array of media object',
  INVALID_TWEET_ID: 'Invalid tweet id',
  TWEET_NOT_FOUND: 'Tweet not found',
  TWEET_IS_NOT_PUBLIC: 'Tweet is not public',
  INVALID_TWEET_TYPE: 'Invalid tweet type',
  INVALID_LIMIT: 'Invalid limit - Maximum is 100',
  INVALID_PAGE: 'Page >= 1'
} as const
