# TaskFlow

A React Native CLI to-do app with a TypeScript/Express API, MongoDB persistence, JWT authentication, and an offline-persisted mobile session.

## Project structure

```text
.
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── validators/
│   │   ├── app.ts
│   │   └── server.ts
│   ├── .env.example
│   └── package.json
└── mobile/
    ├── android/ and ios/          # React Native CLI native projects
    └── src/
        ├── api/
        ├── components/
        ├── navigation/
        ├── screens/
        ├── store/
        ├── theme/
        ├── types/
        ├── hooks/
        └── utils/
```

## Requirements

- Node.js 22.11 or newer (the generated React Native 0.87 project requirement)
- MongoDB 6+ (local MongoDB or MongoDB Atlas)
- Android Studio and an Android SDK for Android; macOS with Xcode for iOS
- JDK 17 for Android builds

For MongoDB Atlas, create a database user and database, allow access only from
your trusted development/production network, and put the Atlas connection URI
in `MONGODB_URI`. MongoDB creates the `taskflow` database and collections on
first use. To generate a strong JWT key in PowerShell:

```powershell
node -e "console.log(require('node:crypto').randomBytes(48).toString('base64url'))"
```

## Backend setup

```powershell
cd backend
Copy-Item .env.example .env
# Set MONGODB_URI and JWT_SECRET in .env
npm install
npm test
npm run dev
```

The API listens on `http://localhost:4000` by default. Health check: `GET /health`.
Use a long, random `JWT_SECRET` in production; never commit `.env`.

For Android emulator access to the host machine, the mobile API base URL is
`http://10.0.2.2:4000/api`. For a physical device, change `mobile/src/api/client.ts`
to the development machine's LAN IP. iOS simulator can use `http://localhost:4000/api`.
Use HTTPS and a trusted host for production builds.

## Mobile setup

```powershell
cd mobile
npm install
npm run typecheck
npm test
npx pod-install       # macOS/iOS only
npm run android       # Android emulator/device
npm run ios           # macOS/iOS simulator/device
```

The mobile app provides email registration/login, persistent JWT sessions,
task create/edit/details/delete/complete, status filtering, search, category
labels, deadline/priority sorting, smart-priority sorting, dashboard counts,
dark mode, pull-to-refresh, loading placeholders, and swipe-to-delete.

## API

| Method | Path | Description |
| --- | --- | --- |
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Sign in |
| GET | `/api/auth/me` | Get current account (JWT required) |
| GET | `/api/tasks` | List/filter/search/sort tasks (JWT required) |
| GET | `/api/tasks/:id` | Get an owned task |
| POST | `/api/tasks` | Create task |
| PUT | `/api/tasks/:id` | Update task |
| PATCH | `/api/tasks/:id/complete` | Toggle completion |
| DELETE | `/api/tasks/:id` | Delete task |

Task list query parameters: `status=all|pending|completed`, `search`,
`category`, `sort=smart|priority|deadline|createdAt`, `page`, and `limit`.
The list response also includes user-wide `stats` (total, pending, completed),
independent of the selected filters.
Smart sorting scores priority (High 30, Medium 20, Low 10) plus deadline
urgency (today 30, tomorrow 20, within 7 days 10), descending.

## Production notes

Set `NODE_ENV=production`, configure a strict `CORS_ORIGIN`, use HTTPS, rotate
JWT secrets, and run MongoDB with authentication, backups, and network access
controls. Configure app signing, Android/iOS release builds, and device-specific
API URLs before distributing the mobile app.

For Android release signing, set `TASKFLOW_UPLOAD_STORE_FILE`,
`TASKFLOW_UPLOAD_STORE_PASSWORD`, `TASKFLOW_UPLOAD_KEY_ALIAS`, and
`TASKFLOW_UPLOAD_KEY_PASSWORD` in the build environment. Without these values,
the release variant is not signed with the debug key.
