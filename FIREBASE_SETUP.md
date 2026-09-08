# Firebase Authentication setup

The site now contains a Firebase Web SDK authentication foundation. Before using the login or dashboard pages, create or select the Firebase project that should own this website and complete these steps:

1. Register a Firebase Web App and copy its public web-app configuration into `firebase-config.js`. Leave no Admin SDK private key or service-account credential in this project.
2. In Authentication → Sign-in method, enable Google and Phone providers.
3. Add the local development host and the production host to Authentication → Settings → Authorized domains. Phone sign-in uses Firebase's reCAPTCHA verifier in the login page; it must not be bypassed.
4. Create a Cloud Firestore database and deploy `firestore.rules`. The rules allow a signed-in user to read or write only their own profile document at `users/{uid}` and only the three public account types.
5. Serve the site from `localhost` or HTTPS while testing; do not open the module pages directly with `file://`.

The future administrator role is intentionally not selectable in the public profile flow. Assigning that role should be handled later with a trusted server-side process (for example, Firebase custom claims) and separate admin authorization rules.
