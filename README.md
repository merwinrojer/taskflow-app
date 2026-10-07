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
`http://10.0.2.2:4000/api`. The app reads `API_BASE_URL` from `mobile/.env`
(copy `mobile/.env.example` to get the emulator default). For a physical phone
on the same Wi-Fi as the development computer, use the computer's private LAN
IPv4 address, for example `http://192.168.1.42:4000/api`, in `mobile/.env`.
Allow Node.js through Windows Firewall on a private network if prompted.
Production/release Android builds require HTTPS.

### Build an APK on GitHub (no local Android SDK or emulator)

The repository includes a manually triggered GitHub Actions workflow at
`.github/workflows/build-android-apk.yml`. It builds a debug APK on GitHub's
runner and uploads it as a downloadable artifact:

1. Start MongoDB and the backend on your computer. Find its private IPv4 address
   with `ipconfig` (the address in the active Wi-Fi adapter), and ensure the
   phone and computer are on the same Wi-Fi. Use `http://<computer-lan-ip>:4000/api`
   as the API URL. A local `localhost` address or emulator URL will not work on
   your phone. For an API hosted online, use its HTTPS URL ending in `/api`.
2. Push the workflow and app changes to GitHub.
3. In GitHub, open **Actions → Build Android APK → Run workflow**, enter the
   private-LAN HTTP API URL for a same-Wi-Fi demo or an HTTPS API URL for a
   hosted backend, and start the workflow.
4. When the run succeeds, open its **Artifacts** section and download
   `taskflow-android-debug`. Extract the ZIP to get `app-debug.apk`.
5. Transfer the APK to your Android phone, open it, and allow installation from
   that source if Android prompts you. The debug APK is for testing, not Play
   Store release.

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

## Browser demo

The optional browser client exercises the same local API without an Android
emulator. Start MongoDB and the backend first, then run:

```powershell
cd web
npm install
npm run dev
```

Open the local URL printed by Vite (normally `http://127.0.0.1:5173`), create a
demo account, and try task creation/editing/completion/deletion, search,
status filters, sorting, and dashboard stats. The browser client defaults to
`http://localhost:4000/api`; set `VITE_API_URL` if the backend uses a different
URL. This is a supplementary web demo and does not replace native Android/iOS
verification of the React Native app.

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
