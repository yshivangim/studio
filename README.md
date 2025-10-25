# Firebase Studio

This is a NextJS starter in Firebase Studio.

## Setup Firebase Configuration

Your Firebase configuration has been automatically injected into `src/firebase/index.ts`. You do not need to manually add your API keys to the code.

## Enable Google Sign-In and Authorize Domains

For authentication (especially Google Sign-In) to work during development, you **MUST** authorize the domains where your app will run.

### **1. Enable Google Provider**

*   In the Firebase Console, navigate to the **Authentication** section.
*   Click the **Sign-in method** tab.
*   Find **Google** in the list of providers.
*   Click the pencil icon to edit, **Enable** the provider, and click **Save**.

### **2. Authorize Your Development Environment (The Fix for Current Errors)**

To make Google Sign-In work while you are developing on your local machine (`localhost`), you must add `localhost` to the list of authorized domains. This is a required security step.

*   In the **Authentication** > **Sign-in method** tab, scroll down to the **Authorized domains** section.
*   Click **Add domain** and enter `localhost`.
*   Click **Add domain** again and enter `127.0.0.1`.

This step is **only for development**. It will **not** prevent your app from working when it is live on the internet.

### **3. Your Live Domain (100% Online)**

When you deploy your app to Firebase Hosting, it will get a public URL (for example, `your-project-id.web.app`).

**Firebase automatically adds this live domain to the authorized list for you.** You do not need to do this manually. The steps above for `localhost` are only for testing before you deploy.

After completing these steps in the Firebase console, the authentication will work correctly for both local development and your live, deployed application.
