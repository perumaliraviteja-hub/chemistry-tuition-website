# AI-to-AI Project Handoff

> **System prompt for the next agent:** You are taking over the Pamerla Murali Dhar Chemistry tuition website in `D:\wesite of Pamerla Murali Dhar`. Preserve the existing public design, content boundaries, and security decisions. Read this file before changing anything. Resume only from the explicit next actions below; do not infer or implement later-stage features.

## 1. Project Overview & Current State

This is a premium static Chemistry tuition and academic profile website for Dr. Pamerla Murali Dhar, Assistant Professor of Chemistry at GITAM School of Science, Visakhapatnam.

The public website is complete through the earlier content/design stages and contains:

- `index.html` — Home page with hero, tuition positioning, learning approach, credibility, resources, and enquiry CTAs.
- `about.html` — About/teacher profile page with the supplied portrait, verified academic timeline, expertise, academic profile placeholders, and enquiry CTA.
- `courses.html` — Chemistry learning options page.
- `teaching.html` — Teaching approach and learning experience page.
- `resources.html` — Chemistry resources/learning library page.
- `research.html` — Academic and research profile page.
- `contact.html` — Contact/enquiry page with client-side-only validation and placeholder contact details.

The Stage 11 authentication foundation has been added, but it is not connected to a real Firebase project yet:

- `login.html` — Login UI for Google and mobile OTP, plus first-time profile selection.
- `dashboard.html` — Protected account dashboard shell.
- `auth.js` — Firebase modular browser SDK integration.
- `firebase-config.js` — Configuration object with intentionally empty values.
- `firestore.rules` — Owner-only profile rules for `users/{uid}`.
- `FIREBASE_SETUP.md` — Firebase console/setup checklist.

The latest Stage 11.1 attempt stopped safely at the configuration dependency. No live Firebase flows were tested and no Firebase deployment was performed.

## 2. Technology Stack

- Plain HTML5, CSS3, and browser JavaScript; no React, Vue, Angular, bundler, package manager, or backend application.
- Shared stylesheet: `styles.css`.
- Shared public-page behavior: `script.js`.
- Authentication pages load `auth.js` as an ES module.
- Firebase Web SDK browser ESM imports are pinned to version `12.18.0` from `https://www.gstatic.com/firebasejs/12.18.0/`.
- Firebase services intended:
  - Firebase Authentication: Google provider and Phone/SMS provider.
  - Cloud Firestore: authenticated user profiles under `users/{uid}`.
- Google Fonts: Montserrat for headings, Inter for body/UI, Lily Script One for limited decorative use.
- No passwords are stored by this site.
- No Admin SDK, service-account key, or server-side credentials are present.

## 3. System Architecture & Decisions

### Public website

- Each page is standalone HTML and shares the same header, navigation, footer, typography, and color tokens.
- All public pages now include a `My Account` link to `login.html`.
- The public page content and visual identity must remain unchanged unless a requested authentication/navigation fix requires a shared change.
- The site is intended to be served from `localhost` or HTTPS. Do not test Firebase modules by opening HTML directly with `file://`.

### Design system

Keep these existing tokens and do not introduce a new visual style:

- Primary: `#7C62DD`
- Secondary: `#F3C46C`
- Dark: `#151515`
- Pink accent: `#FFF3F7`
- Blue accent: `#EEF8FF`
- Montserrat headings, Inter body/UI, limited Lily Script One.

### Supplied assets

- `assets/dr-pamerla-murali-dhar.jpg` — exact supplied Dr. Murali Dhar portrait used in `about.html`; preserve its identity, aspect ratio, and existing rounded portrait frame.
- `assets/home-hero-image.png` — exact supplied Home hero image.
- `assets/learning-understanding-section.png` — exact supplied image for the “Learning that begins with understanding” section; its image styling intentionally has no border radius.

### Home visual corrections already applied

- The `Thoughtful Learning` hero card is the `.hero-card--main` element.
- Desktop positioning currently uses `right: calc(-14% - 110px)` to move it to the upper-right/outside area.
- Mobile overrides remain in the existing responsive rules. Do not move the other two cards:
  - `.hero-card--element` = Ph.D./CH card at bottom-left.
  - `.hero-card--tag` = 18+ years at GITAM card at bottom-right.
- The supplied learning-section image uses `border-radius: 0`.
- The three `.placeholder-icon` boxes and SVGs have fixed, equal dimensions.

### Authentication architecture

- `firebase-config.js` exports `firebaseConfig` and `isFirebaseConfigured`.
- `auth.js` exits safely when configuration values are blank. On the dashboard it redirects to `index.html`; on login it displays a setup error and does not create fake auth.
- Auth persistence uses Firebase `browserLocalPersistence`, not `localStorage` or a custom token store.
- Google uses `signInWithPopup` on normal desktop pointers and `signInWithRedirect` on coarse pointers.
- Phone login validates E.164-style input, creates Firebase `RecaptchaVerifier` with an invisible reCAPTCHA, sends OTP with `signInWithPhoneNumber`, verifies the code, and supports resend/error handling.
- First-time users choose only `Student`, `Parent / Guardian`, or `Other`. `Administrator` is intentionally absent.
- User profile document path: `users/{firebaseUid}`.
- Profile fields written: `uid`, `name`, `email`, `phone`, `accountType`, `createdAt`.
- The client reads only the current user’s own profile.
- `firestore.rules` allows a signed-in user to read their own document, create/update only their own document, restricts account types to the three public options, preserves `uid` and `createdAt`, and denies deletes.
- A future administrator role must be assigned outside public signup/profile selection, using a trusted server-side mechanism such as custom claims and separate rules. Do not add an admin signup option.

## 4. Active Chat Context & Progress

The immediate work was Stage 11.1 — connect Firebase and enable live authentication.

Inspection results:

- `FIREBASE_SETUP.md` is present and accurately describes the required setup.
- `firebase-config.js` still contains empty strings for all six Web App values:
  - `apiKey`
  - `authDomain`
  - `projectId`
  - `storageBucket`
  - `messagingSenderId`
  - `appId`
- There is no `.firebaserc` or `firebase.json` project binding in this workspace.
- Firebase CLI version available: `15.12.0`.
- The CLI account is logged in as `perumaliraviteja@gmail.com`.
- The only project visible to that account was `Mana Ride` (`mana-ride-d2dc0`). This is unrelated context and must not be assumed to be the Pamerla website’s Firebase project.
- No Firebase Console provider configuration, authorized domain, Firestore database, or intended project ID was supplied.
- No live Google sign-in, Phone OTP, profile creation, logout, returning-user, dashboard, or Firestore rules simulator test was performed.
- No files were changed during the Stage 11.1 inspection.

Static checks that passed:

- `node --check auth.js`
- `node --check script.js`
- All local HTML asset/link targets resolve.
- Firebase config fields are still intentionally blank.
- No `localStorage`/`sessionStorage` authentication code.
- No Admin SDK/private-key literals.
- No open `allow read, write: if true` Firestore rule.
- No public Administrator signup option.
- No Firebase CLI project binding exists yet.

## 5. Next Action Steps

Perform these steps in order and stop if the owner dependency is still missing:

1. Confirm the exact Firebase project ID intended for this Pamerla Murali Dhar website. Do not use `mana-ride-d2dc0` unless the owner explicitly confirms it.
2. Confirm the Firebase CLI account has access to that project, or authenticate the correct owner account.
3. Register/select the Firebase Web App for the confirmed project and obtain the public Web App configuration values.
4. Populate only the six public values in `firebase-config.js`. Never add service-account JSON, Admin SDK credentials, private keys, or passwords.
5. Add the intended Firebase project binding using the Firebase CLI (`firebase use --add` or equivalent) only after the project ID is confirmed.
6. In Firebase Console, enable Google under Authentication → Sign-in method.
7. Enable Phone under Authentication → Sign-in method, configure the SMS region/quotas as needed, and retain Firebase’s reCAPTCHA/app-verification flow.
8. Add the actual local and production hostnames to Authentication → Settings → Authorized domains.
9. Create or verify the Cloud Firestore database for the confirmed project.
10. Deploy the existing rules without weakening them: `firebase deploy --only firestore:rules`.
11. Serve the site over `localhost` or HTTPS with a local static server.
12. Test Google sign-in, first-time profile selection, profile creation, dashboard rendering, logout, and returning-user login.
13. Test Phone OTP with an owner-provided real test number or a Firebase fictional test number: send, verify, invalid code, expired code, and resend.
14. Use the Firebase Rules Simulator/emulator to verify:
    - User A can read/write only `users/{uidA}`.
    - User A cannot read/write `users/{uidB}`.
    - A non-authenticated request is denied.
    - Administrator is not accepted as an account type.
    - Deletes are denied.
15. Re-run syntax, local-link, secret, and rules scans. Record the actual project ID, provider status, Firestore status, rules deployment result, and live test results in the next handoff.

## 6. Edge Cases & Known Bugs

- **Primary blocker:** No intended Firebase project/configuration is available. Do not guess credentials or deploy to the visible Mana Ride project.
- Firebase modules will not work reliably from `file://`; use localhost/HTTPS.
- Google sign-in can fail with `auth/unauthorized-domain` until the exact host is added to Firebase Authorized Domains.
- Popup sign-in can be blocked by the browser; the code already maps popup errors and uses redirect on coarse pointers.
- Phone auth requires Firebase’s reCAPTCHA verifier. Do not bypass it or replace it with client-trusted logic.
- OTP errors are expected edge cases: invalid code, expired code, too many attempts, captcha failure, network failure, and unauthorized domain. The current UI maps these to user-facing messages.
- The phone-auth first-time profile flow requires the user to enter a name; `login.html` uses an editable name field and readonly email/phone fields.
- Firestore profile creation requires a server timestamp for `createdAt`. Existing profile merges preserve the original creation timestamp.
- Dashboard access redirects unauthenticated users to `index.html`; login remains available through the public `My Account` navigation link.
- A configured Firebase project with missing Firestore permissions will leave the dashboard unable to load profile data; diagnose rules/deployment rather than weakening rules.
- Do not add course enrollment, payments/Razorpay, course access control, Zoom/Meet, live scheduling, recorded video, cloud video storage, admin dashboards, or calendar features in this handoff.
- Do not invent phone numbers, email addresses, fees, schedules, student numbers, testimonials, guarantees, awards, or unsupported academic claims.
- The workspace is not a Git repository; do not claim Git status or commit history unless a repository is initialized and verified.
- Browser visual QA was not available in the previous auth setup run. After Firebase connection, use a real browser for desktop/mobile checks and record any rendering issue separately from the static checks.

## Resume Rule

The next agent must first obtain/confirm the intended Firebase project and public Web App config. If those are not supplied, report the exact owner action required and stop. Never infer a project from the available CLI account, never use the unrelated Mana Ride project, and never weaken the Firestore rules to make a test pass.
