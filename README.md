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
  - Fully inline schemas—no external $ref

- **DevOps & Deployment**
  - Docker & Docker Compose
  - Ready for AWS (EC2 )
  - Environment-driven configuration

---

## 🛠️ Tech Stack

- **Runtime:** Node.js 20
- **Framework:** Express
- **Language:** Typescipt
- **Database:** MongoDB (native driver)
- **Auth:** JSON Web Tokens
- **Docs:** OpenAPI 3.0 (swagger-ui-express)
- **Realtime:** Socket.io
- **Uploads:** multer, sharp, ffmpeg/HLS
- **Containerization:** Docker, Docker Compose

---

## 📦 Installation & Setup

1. **Clone the repo**

   ```bash
   git clone https://github.com/NDHUY782/Twitter_API.git
   cd Twitter_API
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment**  
   Copy `.env.example` → `.env` and fill in:

   ```
   PORT=4000
   MONGODB_URI=mongodb://localhost:27017/twitter
   JWT_SECRET=…
   JWT_REFRESH_SECRET=…
   JWT_EMAIL_VERIFY_SECRET=…
   JWT_FORGOT_PASSWORD_SECRET=…
   HOST=https://your-aws-domain.com
   ```

4. **Run locally**
   ```bash
   npm run dev
   npm start
   ```
   - API at `http://localhost:4000/api`
   - Swagger UI at `http://localhost:4000/api-docs`

---

## 🐳 Docker

Build and run with Docker Compose:

```bash
docker-compose up --build -d
```

- Service `twitter-api` listens on port `5000`

---

## ☁️ Deployment on AWS

1. Push Docker image to ECR
2. Create ECS task & service pointing to that image
3. Attach Application Load Balancer on port 80 → 5000
4. Set environment variables in ECS task definition
5. (Optional) API Gateway + Lambda for HTTP proxy

Swagger UI on production:

```
http://3.26.97.252:5000/api-docs
```

---

## 🔌 WebSocket Events

| Event             | Payload                   | Description                 |
| ----------------- | ------------------------- | --------------------------- |
| `send message`    | `{ from, to, content }`   | Client → server to send msg |
| `receive message` | `{ from, content }`       | Server → client on new msg  |
| `seen message`    | `{ message_id }`          | Mark message as seen        |
| `typing`          | `{ from, typing: true }`  | Client typing indicator     |
| `stop typing`     | `{ from, typing: false }` | Client stopped typing       |

---

## 📁 Project Structure

```
.
├── .github
├── src/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   └── swagger/
├── Dockerfile
├── docker-compose.yml
├── .env
└── README.md
```

---

## 🤝 Contributing

1. Fork & clone
2. Create feature branch
3. Write code & tests
4. Open a Pull Request

---
