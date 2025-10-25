# Firebase Studio

This is a NextJS starter in Firebase Studio.

## Setup Firebase Configuration

Before running the application, you need to configure your Firebase project credentials.

1.  Navigate to your Firebase project in the [Firebase Console](https://console.firebase.google.com/).
2.  In the project overview, click the **Web** icon (`</>`) to go to your web app's settings. If you don't have a web app, create one.
3.  Go to **Project Settings** > **General** tab.
4.  Scroll down to the **Your apps** section and find the **SDK setup and configuration** panel.
5.  Select the **Config** option.
6.  You will see a `firebaseConfig` object. Copy this entire object.
7.  Open the `src/firebase/index.ts` file in your project.
8.  Replace the placeholder `firebaseConfig` object with the one you copied from the Firebase console.

Your `src/firebase/index.ts` file should look like this, but with your actual project keys:

```typescript
// ... imports

// IMPORTANT: Replace this with your actual Firebase configuration
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef123456",
  measurementId: "G-ABCDEFGHIJ"
};

// ... rest of the file
```

After updating the configuration, the authentication and all Firebase services should work correctly.
