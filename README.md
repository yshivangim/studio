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

## Enable Google Sign-In and Authorize Domains

For Google Sign-In to work, you must enable it in the Firebase console and authorize the domains where your app will run.

1.  **Enable Google Provider**:
    *   In the Firebase Console, go to the **Authentication** section.
    *   Click the **Sign-in method** tab.
    *   Click on **Google** from the list of providers.
    *   **Enable** the provider and click **Save**.

2.  **Authorize Domains for Development**:
    To make Google Sign-In work while you are developing on your local machine, you must add `localhost` to the list of authorized domains.
    *   In the **Authentication** > **Sign-in method** tab, scroll down to the **Authorized domains** section.
    *   Click **Add domain** and enter `localhost`.
    *   Click **Add domain** again and enter `127.0.0.1`.

3.  **Verify Your Live Domain**:
    When you deploy your app to Firebase Hosting, it will have a public URL (e.g., `your-project-id.web.app`). Firebase automatically adds this domain to the authorized list for you. You can verify it's there to ensure your live app's authentication will work.

After completing these steps, the authentication and all Firebase services should work correctly for both local development and your live, deployed application.
