import { initializeApp } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";
import {
  browserLocalPersistence,
  GoogleAuthProvider,
  RecaptchaVerifier,
  getAuth,
  getRedirectResult,
  onAuthStateChanged,
  setPersistence,
  signInWithPhoneNumber,
  signInWithPopup,
  signInWithRedirect,
  signOut,
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";
import {
  doc,
  getDoc,
  getFirestore,
  serverTimestamp,
  setDoc,
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";
import { firebaseConfig, isFirebaseConfigured } from "./firebase-config.js";

const isLoginPage = document.body?.dataset.authPage === "login";
const isDashboardPage = document.body?.dataset.authPage === "dashboard";
const authStatus = document.querySelector("[data-auth-status]");
const authError = document.querySelector("[data-auth-error]");
const googleButton = document.querySelector("[data-google-signin]");
const phoneForm = document.querySelector("[data-phone-form]");
const otpForm = document.querySelector("[data-otp-form]");
const profileForm = document.querySelector("[data-profile-form]");
const profileStep = document.querySelector("[data-profile-step]");
const otpStep = document.querySelector("[data-otp-step]");
const loginMethods = document.querySelector("[data-login-methods]");
const logoutButton = document.querySelector("[data-logout]");

const setMessage = (message = "", type = "status") => {
  const target = type === "error" ? authError : authStatus;
  if (target) {
    target.textContent = message;
    target.hidden = !message;
  }
  if (type === "error" && authStatus) {
    authStatus.hidden = true;
  }
};

const setBusy = (button, busy, busyLabel) => {
  if (!button) return;
  if (busy) {
    button.dataset.defaultLabel = button.textContent;
    button.disabled = true;
    button.textContent = busyLabel;
  } else {
    button.disabled = false;
    button.textContent = button.dataset.defaultLabel || button.textContent;
  }
};

const friendlyError = (error) => {
  const messages = {
    "auth/account-exists-with-different-credential": "This email is already linked to another sign-in method.",
    "auth/captcha-check-failed": "The verification check could not be completed. Please try again.",
    "auth/code-expired": "That OTP has expired. Request a new code.",
    "auth/credential-already-in-use": "This sign-in credential is already in use.",
    "auth/invalid-phone-number": "Enter a valid phone number in international format, such as +919876543210.",
    "auth/invalid-verification-code": "That OTP is not valid. Check the code and try again.",
    "auth/network-request-failed": "A network error occurred. Check your connection and try again.",
    "auth/operation-not-allowed": "This sign-in method is not enabled in the Firebase console yet.",
    "auth/popup-blocked": "The sign-in popup was blocked. Allow popups and try again.",
    "auth/popup-closed-by-user": "The sign-in window was closed before completion.",
    "auth/too-many-requests": "Too many attempts were made. Wait a little and try again.",
    "auth/unauthorized-domain": "This website domain is not authorized in Firebase Authentication.",
  };
  return messages[error?.code] || "We could not complete sign-in. Please try again.";
};

const showProfileStep = (user) => {
  loginMethods?.setAttribute("hidden", "true");
  otpStep?.setAttribute("hidden", "true");
  profileStep?.removeAttribute("hidden");
  const nameField = profileForm?.elements.name;
  const emailField = profileForm?.elements.email;
  const phoneField = profileForm?.elements.phone;
  if (nameField) nameField.value = user.displayName || "";
  if (emailField) emailField.value = user.email || "";
  if (phoneField) phoneField.value = user.phoneNumber || "";
  profileForm?.querySelector("input[name=accountType]")?.focus();
};

const readProfile = async (user, db) => {
  const profileSnapshot = await getDoc(doc(db, "users", user.uid));
  return profileSnapshot.exists() ? profileSnapshot.data() : null;
};

const goToDashboard = () => {
  if (!isDashboardPage) window.location.href = "dashboard.html";
};

const initializeAuth = () => {
  if (!isFirebaseConfigured) {
    setMessage("Firebase is not connected yet. Add the Firebase Web App values in firebase-config.js to enable sign-in.", "error");
    [googleButton, phoneForm].forEach((control) => {
      if (control) control.setAttribute("aria-disabled", "true");
    });
    if (isDashboardPage) window.location.href = "index.html";
    return null;
  }

  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);
  setPersistence(auth, browserLocalPersistence).catch((error) => setMessage(friendlyError(error), "error"));

  const provider = new GoogleAuthProvider();
  let confirmationResult = null;
  let recaptchaVerifier = null;

  const getRecaptchaVerifier = () => {
    if (recaptchaVerifier) return recaptchaVerifier;
    recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
      size: "invisible",
      callback: () => setMessage("Verification complete. Sending your OTP…"),
      "expired-callback": () => setMessage("The verification check expired. Please request the OTP again.", "error"),
    });
    return recaptchaVerifier;
  };

  const sendOtp = async (event) => {
    event?.preventDefault();
    const phoneInput = phoneForm?.elements.phone;
    const sendButton = phoneForm?.querySelector("button[type=submit]");
    const phone = phoneInput?.value.trim() || "";
    if (!/^\+[1-9]\d{7,14}$/.test(phone)) {
      phoneInput?.setAttribute("aria-invalid", "true");
      setMessage("Enter your phone number in international format, including the + country code.", "error");
      phoneInput?.focus();
      return;
    }
    phoneInput?.setAttribute("aria-invalid", "false");
    setBusy(sendButton, true, "Sending OTP…");
    setMessage("Preparing secure phone verification…");
    try {
      confirmationResult = await signInWithPhoneNumber(auth, phone, getRecaptchaVerifier());
      otpStep?.removeAttribute("hidden");
      phoneForm?.querySelector("input")?.setAttribute("readonly", "true");
      otpForm?.elements.code?.focus();
      setMessage("OTP sent. Enter the code we sent to your phone.");
    } catch (error) {
      recaptchaVerifier?.clear();
      recaptchaVerifier = null;
      setMessage(friendlyError(error), "error");
    } finally {
      setBusy(sendButton, false, "Send OTP");
    }
  };

  const verifyOtp = async (event) => {
    event?.preventDefault();
    const codeInput = otpForm?.elements.code;
    const verifyButton = otpForm?.querySelector("button[type=submit]");
    const code = codeInput?.value.trim() || "";
    if (!/^\d{6}$/.test(code)) {
      codeInput?.setAttribute("aria-invalid", "true");
      setMessage("Enter the 6-digit OTP.", "error");
      codeInput?.focus();
      return;
    }
    setBusy(verifyButton, true, "Verifying…");
    setMessage("Verifying your OTP…");
    try {
      await confirmationResult.confirm(code);
    } catch (error) {
      setMessage(friendlyError(error), "error");
      codeInput?.focus();
    } finally {
      setBusy(verifyButton, false, "Verify OTP");
    }
  };

  const saveProfile = async (event, user) => {
    event?.preventDefault();
    const selectedType = profileForm?.elements.accountType?.value;
    const name = profileForm?.elements.name?.value.trim() || "";
    const allowedTypes = new Set(["Student", "Parent / Guardian", "Other"]);
    if (!allowedTypes.has(selectedType)) {
      setMessage("Choose how you will use this platform.", "error");
      return;
    }
    if (!name) {
      setMessage("Enter your name to finish setting up your profile.", "error");
      profileForm?.elements.name?.focus();
      return;
    }
    const saveButton = profileForm?.querySelector("button[type=submit]");
    setBusy(saveButton, true, "Saving profile…");
    setMessage("Saving your profile…");
    try {
      const existingProfile = await readProfile(user, db);
      const profileData = {
        uid: user.uid,
        name: name || user.displayName || "",
        email: user.email || profileForm.elements.email.value.trim(),
        phone: user.phoneNumber || profileForm.elements.phone.value.trim(),
        accountType: selectedType,
      };
      if (!existingProfile?.createdAt) profileData.createdAt = serverTimestamp();
      await setDoc(doc(db, "users", user.uid), profileData, { merge: true });
      goToDashboard();
    } catch (error) {
      setMessage(friendlyError(error), "error");
    } finally {
      setBusy(saveButton, false, "Save and continue");
    }
  };

  googleButton?.addEventListener("click", async () => {
    setBusy(googleButton, true, "Connecting…");
    setMessage("Opening secure Google sign-in…");
    try {
      if (window.matchMedia("(pointer: coarse)").matches) {
        await signInWithRedirect(auth, provider);
      } else {
        await signInWithPopup(auth, provider);
      }
    } catch (error) {
      setMessage(friendlyError(error), "error");
      setBusy(googleButton, false, "Continue with Google");
    }
  });

  phoneForm?.addEventListener("submit", sendOtp);
  otpForm?.addEventListener("submit", verifyOtp);
  otpForm?.querySelector("[data-resend-otp]")?.addEventListener("click", () => {
    phoneForm?.querySelector("input")?.removeAttribute("readonly");
    otpForm.elements.code.value = "";
    sendOtp();
  });
  profileForm?.addEventListener("submit", (event) => {
    if (auth.currentUser) saveProfile(event, auth.currentUser);
  });
  logoutButton?.addEventListener("click", async () => {
    setBusy(logoutButton, true, "Signing out…");
    try {
      await signOut(auth);
      window.location.href = "index.html";
    } catch (error) {
      setMessage(friendlyError(error), "error");
      setBusy(logoutButton, false, "Log out");
    }
  });

  getRedirectResult(auth).catch((error) => setMessage(friendlyError(error), "error"));

  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      if (isDashboardPage) window.location.href = "index.html";
      return;
    }
    try {
      const profile = await readProfile(user, db);
      if (isDashboardPage) {
        if (!profile?.accountType) {
          window.location.href = "login.html";
          return;
        }
        document.querySelector("[data-dashboard-name]").textContent = profile.name || user.displayName || "there";
        document.querySelector("[data-dashboard-account-type]").textContent = profile.accountType;
        document.querySelector("[data-profile-name]").textContent = profile.name || "Not provided";
        document.querySelector("[data-profile-email]").textContent = profile.email || "Not provided";
        document.querySelector("[data-profile-phone]").textContent = profile.phone || "Not provided";
        document.querySelector("[data-profile-created]").textContent = profile.createdAt?.toDate ? profile.createdAt.toDate().toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" }) : "Not provided";
        document.querySelector("[data-profile-uid]").textContent = profile.uid;
      } else if (isLoginPage) {
        if (profile?.accountType) goToDashboard();
        else showProfileStep(user);
      }
    } catch (error) {
      setMessage(friendlyError(error), "error");
    }
  });

  return { auth, db };
};

initializeAuth();
