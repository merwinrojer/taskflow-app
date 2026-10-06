# TaskFlow mobile app

React Native CLI app for Android and iOS. The complete project setup, backend,
MongoDB configuration, API routes, and device-specific API URL instructions
are documented in the [repository README](../README.md).

```powershell
npm install
npm start
# In another terminal:
npm run android
# On macOS, after installing native dependencies:
npx pod-install
npm run ios
```

The development API base URL is configured in `src/api/client.ts`. Android
emulators use `10.0.2.2` to reach services on the host machine; physical devices
need the host's LAN IP.
