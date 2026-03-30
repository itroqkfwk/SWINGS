# Deployment

## Recommended Free Stack

- Frontend: Vercel
- Backend: Render Web Service
- MySQL: Neon Postgres is easier on free tiers, but this project is currently MySQL-based, so use Railway MySQL or a free MySQL host if you keep the current DB layer
- Redis: Upstash Redis if chat/pubsub is required
- File uploads: Cloudinary or S3-compatible object storage

## Important Production Notes

- Render free disk is ephemeral. `FILE_UPLOAD_DIR` is not durable there.
- If you keep local file uploads on Render, uploaded images can disappear after redeploy or restart.
- For real operation, move profile/feed image uploads to object storage before launch.
- Set `REDIS_ENABLED=true` only when an actual Redis instance is configured.

## Backend (Render)

- Root directory: `SWINGS-BE`
- Build command: `./gradlew bootJar -x test`
- Start command: `java -jar build/libs/*.jar`
- Health check path: `/swings`

Required environment variables:

- `DB_URL`
- `DB_USERNAME`
- `DB_PASSWORD`
- `JWT_SECRET`
- `BACKEND_BASE_URL`
- `FRONTEND_BASE_URL`
- `CORS_ALLOWED_ORIGIN_PATTERNS`

Optional environment variables:

- `PORT`
- `SERVER_CONTEXT_PATH`
- `FILE_UPLOAD_DIR`
- `REDIS_ENABLED`
- `REDIS_HOST`
- `REDIS_PORT`
- `MAIL_HOST`
- `MAIL_PORT`
- `MAIL_USERNAME`
- `MAIL_PASSWORD`
- `TOSS_SECRET_KEY`
- `GOOGLE_OAUTH_CLIENT_ID`
- `FIREBASE_KEY_PATH`
- `FIREBASE_KEY_JSON`

### Example Render values

```env
DB_URL=jdbc:mysql://your-host:3306/swings?serverTimezone=Asia/Seoul&characterEncoding=UTF-8&useSSL=false&allowPublicKeyRetrieval=true
DB_USERNAME=swings_user
DB_PASSWORD=replace-me
JWT_SECRET=replace-with-a-long-random-secret
BACKEND_BASE_URL=https://your-render-app.onrender.com/swings
FRONTEND_BASE_URL=https://your-vercel-app.vercel.app/swings
CORS_ALLOWED_ORIGIN_PATTERNS=https://your-vercel-app.vercel.app
REDIS_ENABLED=false
```

## Frontend (Vercel)

- Root directory: `SWINGS-FE`
- Framework preset: `Vite`
- Build command: `npm run build`
- Output directory: `dist`

Required environment variables:

- `VITE_API_BASE_URL`
- `VITE_WS_BASE_URL`
- `VITE_UPLOADS_BASE_URL`

Optional environment variables:

- `VITE_GOOGLE_CLIENT_ID`
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_FIREBASE_MEASUREMENT_ID`
- `VITE_FIREBASE_VAPID_KEY`
- `VITE_TOSS_CLIENT_KEY`
- `VITE_KAKAO_MAP_API_KEY`

### Example Vercel values

```env
VITE_API_BASE_URL=https://your-render-app.onrender.com/swings
VITE_WS_BASE_URL=https://your-render-app.onrender.com/swings/ws
VITE_UPLOADS_BASE_URL=https://your-render-app.onrender.com/swings/uploads
```

## Deployment Order

1. Create the database first and verify the backend can connect.
2. Deploy backend to Render and set required environment variables.
3. Confirm `https://your-render-app.onrender.com/swings` responds.
4. Deploy frontend to Vercel with backend URLs wired in.
5. Update `FRONTEND_BASE_URL` and `CORS_ALLOWED_ORIGIN_PATTERNS` on Render to the final Vercel domain.
6. If chat is needed in production, add Redis and set `REDIS_ENABLED=true`.

## Current Project Status

- Frontend production build passes.
- Backend main application code compiles and `bootJar` succeeds.
- Full `gradlew build` is blocked in this environment because test dependencies cannot be downloaded from Maven Central due network restrictions.
