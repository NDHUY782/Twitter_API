# Twitter-Clone API

A backend API that mimics core Twitter functionality: user management, tweeting, search, bookmarks, likes, conversations, messaging, and media uploads (images, video/HLS). Comes with OpenAPI (Swagger) docs, Docker support, and real-time messaging via Socket.io.

---

## 🚀 Features

- **User accounts & authentication**

  - Register, login, logout, refresh JWT
  - Email verification & password reset
  - Profile retrieval & update
  - Follow / unfollow users
  - Add multiple users to your “Twitter Circle”

- **Tweets**

  - Create tweet, retweet, quote, comment
  - Public vs. Twitter-Circle audiences
  - Hashtags, mentions, media attachments
  - View counts (guest vs. user)

- **Search**

  - Full-text search over tweet content
  - Filter by media type (image, video, HLS)
  - Optionally restrict to people you follow

- **Bookmarks & Likes**

  - Bookmark / unbookmark tweets
  - Like / unlike tweets

- **Conversations & Messages**

  - Create conversations between two users
  - Send & list messages with pagination
  - Mark messages as seen
  - Real-time events (send/receive/typing/seen) via Socket.io

- **Media Upload**

  - Image upload & on-the-fly JPEG conversion
  - Video upload, streaming with HTTP Range support
  - HLS packaging queue for adaptive streaming

- **API Documentation**

  - Swagger UI available at `/api-docs`
  - Fully inline schemas—no external `$ref`

- **DevOps & Deployment**
  - Docker & Docker Compose
  - Ready for AWS (ECS / EC2 / API Gateway)
  - Environment-driven configuration

---

## 🛠️ Tech Stack

- **Runtime:** Node.js 20
- **Framework:** Express
- **Database:** MongoDB (via native driver)
- **Auth:** JSON Web Tokens
- **Docs:** OpenAPI 3.0 (swagger-ui-express)
- **Realtime:** Socket.io
- **Uploads:** multer, sharp, ffmpeg/HLS
- **Containerization:** Docker, Docker Compose

---

## 📦 Installation & Setup

1. **Clone the repo**
   ```bash
   https://github.com/NDHUY782/Twitter_API.git
   cd Twitter_API
   ```
