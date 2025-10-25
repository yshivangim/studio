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

### **2. Authorize Your Development Environment**

To make Google Sign-In work while you are developing, you must add your development domains to the list of authorized domains in the Firebase Console. This is a required security step.

*   In the **Authentication** > **Sign-in method** tab, scroll down to the **Authorized domains** section.
*   Click **Add domain** and enter `localhost`.
*   Click **Add domain** again and enter `127.0.0.1`.

### **3. Troubleshooting `auth/unauthorized-domain`**

If you have added `localhost` and `127.0.0.1` and still see an `auth/unauthorized-domain` error, it means your development environment is using a different hostname. To find it:
1.  Open your browser's developer tools (Right-click -> Inspect -> Console).
2.  Try to sign in with Google in your app.
3.  Look for a message in the console that says `Attempting to sign in from hostname: [some-hostname]`.
4.  Copy that exact `[some-hostname]` value.
5.  Go back to the Firebase Console and add that new hostname to your **Authorized domains** list.

### **4. Your Live Domain (100% Online)**

When you deploy your app to Firebase Hosting, it will get a public URL (for example, `your-project-id.web.app`).

**Firebase automatically adds this live domain to the authorized list for you.** You do not need to do this manually. The steps above for `localhost` are only for testing before you deploy.

After completing these steps in the Firebase console, the authentication will work correctly for both local development and your live, deployed application.
