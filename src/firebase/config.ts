// This is the single source of truth for the Firebase configuration.
// By not exporting it, we ensure it's only used within the firebase/index.ts initialization.
const firebaseConfig = {
  apiKey: "AIzaSyDL383RPqmLa-slX10bf1ko-VrCM9fBkqQ",
  authDomain: "studio-2446696699-3510f.firebaseapp.com",
  projectId: "studio-2446696699-3510f",
  storageBucket: "studio-2446696699-3510f.appspot.com",
  messagingSenderId: "933954996577",
  appId: "1:933954996577:web:97478cc89775ccaedf5d20",
  measurementId: ""
};

export const getFirebaseConfig = () => {
    // This function will only be called on the client side,
    // ensuring the config is not exposed on the server.
    if (typeof window === 'undefined') {
        throw new Error("Firebase config should only be accessed on the client.");
    }
    return firebaseConfig;
}
