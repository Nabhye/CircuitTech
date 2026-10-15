// js/login.js

import {
    loginUser,
    loginWithGoogle,
    resetPassword,
    watchAuth
} from "./auth.js";


// =========================================================
// DOM ELEMENTS
// =========================================================

const loginForm =
    document.getElementById("loginForm");

const emailInput =
    document.getElementById("email");

const passwordInput =
    document.getElementById("password");

const loginButton =
    document.getElementById("loginButton");

const loginButtonText =
    document.getElementById("loginButtonText");

const loginError =
    document.getElementById("loginError");

const passwordToggle =
    document.getElementById("passwordToggle");

const forgotPassword =
    document.getElementById("forgotPassword");

const googleLoginButton =
    document.getElementById("googleLoginButton");


// =========================================================
// CHECK EXISTING LOGIN
// =========================================================

watchAuth((user) => {

    if (user) {

        window.location.href =
            "dashboard.html";

    }

});


// =========================================================
// SHOW ERROR
// =========================================================

function showError(message) {

    loginError.textContent = message;

    loginError.classList.add("show");

}


// =========================================================
// HIDE ERROR
// =========================================================

function hideError() {

    loginError.textContent = "";

    loginError.classList.remove("show");

}


// =========================================================
// LOADING STATE
// =========================================================

function setLoading(loading) {

    loginButton.disabled = loading;

    if (loading) {

        loginButton.classList.add("loading");

        loginButtonText.textContent =
            "Signing in...";

    } else {

        loginButton.classList.remove("loading");

        loginButtonText.textContent =
            "Sign in";

    }

}


// =========================================================
// EMAIL / PASSWORD LOGIN
// =========================================================

loginForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();

        hideError();

        const email =
            emailInput.value.trim();

        const password =
            passwordInput.value;


        // -------------------------------------------------
        // VALIDATION
        // -------------------------------------------------

        if (!email || !password) {

            showError(
                "Please enter your email and password."
            );

            return;

        }


        // -------------------------------------------------
        // LOGIN
        // -------------------------------------------------

        try {

            setLoading(true);

            await loginUser(
                email,
                password
            );

            window.location.href =
                "dashboard.html";


        } catch (error) {

            console.error(
                "Login error:",
                error
            );


            let message =
                "Unable to sign in. Please try again.";


            // -------------------------------------------------
            // FIREBASE ERROR HANDLING
            // -------------------------------------------------

            if (
                error.code ===
                "auth/invalid-credential"
            ) {

                message =
                    "Incorrect email or password.";

            }

            else if (
                error.code ===
                "auth/user-not-found"
            ) {

                message =
                    "No account exists with this email.";

            }

            else if (
                error.code ===
                "auth/wrong-password"
            ) {

                message =
                    "Incorrect password.";

            }

            else if (
                error.code ===
                "auth/invalid-email"
            ) {

                message =
                    "Please enter a valid email address.";

            }

            else if (
                error.code ===
                "auth/too-many-requests"
            ) {

                message =
                    "Too many attempts. Please try again later.";

            }

            else if (
                error.code ===
                "auth/user-disabled"
            ) {

                message =
                    "This account has been disabled.";

            }


            showError(message);

        } finally {

            setLoading(false);

        }

    }
);


// =========================================================
// PASSWORD VISIBILITY
// =========================================================

passwordToggle.addEventListener(
    "click",
    () => {

        const isPassword =
            passwordInput.type === "password";


        passwordInput.type =
            isPassword
                ? "text"
                : "password";


        passwordToggle.textContent =
            isPassword
                ? "Hide"
                : "Show";

    }
);


// =========================================================
// FORGOT PASSWORD
// =========================================================

forgotPassword.addEventListener(
    "click",
    async () => {

        const email =
            emailInput.value.trim();


        // -------------------------------------------------
        // CHECK EMAIL
        // -------------------------------------------------

        if (!email) {

            showError(
                "Enter your email first, then click Forgot password."
            );

            emailInput.focus();

            return;

        }


        // -------------------------------------------------
        // SEND RESET EMAIL
        // -------------------------------------------------

        try {

            await resetPassword(email);

            hideError();

            alert(
                "Password reset email sent. Check your inbox."
            );


        } catch (error) {

            console.error(
                "Password reset error:",
                error
            );


            let message =
                "Unable to send password reset email.";


            if (
                error.code ===
                "auth/user-not-found"
            ) {

                message =
                    "No account exists with this email.";

            }

            else if (
                error.code ===
                "auth/invalid-email"
            ) {

                message =
                    "Please enter a valid email address.";

            }


            showError(message);

        }

    }
);


// =========================================================
// GOOGLE LOGIN
// =========================================================

googleLoginButton.addEventListener(
    "click",
    async () => {

        hideError();


        try {

            // -------------------------------------------------
            // DISABLE GOOGLE BUTTON
            // -------------------------------------------------

            googleLoginButton.disabled =
                true;


            googleLoginButton.innerHTML = `
                <span>
                    Signing in...
                </span>
            `;


            // -------------------------------------------------
            // GOOGLE AUTHENTICATION
            // -------------------------------------------------

            await loginWithGoogle();


            // -------------------------------------------------
            // REDIRECT
            // -------------------------------------------------

            window.location.href =
                "dashboard.html";


        } catch (error) {

            console.error(
                "Google login error:",
                error
            );


            let message =
                "Unable to sign in with Google.";


            // -------------------------------------------------
            // GOOGLE AUTH ERRORS
            // -------------------------------------------------

            if (
                error.code ===
                "auth/popup-closed-by-user"
            ) {

                message =
                    "Google sign-in was cancelled.";

            }

            else if (
                error.code ===
                "auth/popup-blocked"
            ) {

                message =
                    "Your browser blocked the Google sign-in popup.";

            }

            else if (
                error.code ===
                "auth/cancelled-popup-request"
            ) {

                message =
                    "Another Google sign-in request is already active.";

            }

            else if (
                error.code ===
                "auth/account-exists-with-different-credential"
            ) {

                message =
                    "An account already exists with this email using another sign-in method.";

            }

            else if (
                error.code ===
                "auth/network-request-failed"
            ) {

                message =
                    "Network error. Please check your internet connection.";

            }

            else if (
                error.code ===
                "auth/operation-not-allowed"
            ) {

                message =
                    "Google sign-in is not enabled in Firebase.";

            }


            showError(message);


            // -------------------------------------------------
            // RESTORE GOOGLE BUTTON
            // -------------------------------------------------

            googleLoginButton.disabled =
                false;


            googleLoginButton.innerHTML = `

                <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                >

                    <path
                        fill="#4285F4"
                        d="M21.35 12.23c0-.79-.07-1.55-.23-2.27H12v4.3h5.24a4.48 4.48 0 0 1-1.94 2.94v2.45h3.14c1.84-1.69 2.91-4.18 2.91-7.42Z"
                    />

                    <path
                        fill="#34A853"
                        d="M12 21.5c2.63 0 4.84-.87 6.45-2.35l-3.14-2.45c-.87.58-1.98.93-3.31.93-2.54 0-4.69-1.72-5.46-4.03H3.3v2.53A9.75 9.75 0 0 0 12 21.5Z"
                    />

                    <path
                        fill="#FBBC05"
                        d="M6.54 13.6a5.86 5.86 0 0 1 0-3.2V7.87H3.3a9.75 9.75 0 0 0 0 8.26l3.24-2.53Z"
                    />

                    <path
                        fill="#EA4335"
                        d="M12 6.37c1.43 0 2.71.49 3.72 1.46l2.79-2.79C16.84 3.48 14.63 2.5 12 2.5a9.75 9.75 0 0 0-8.7 5.37l3.24 2.53C7.31 8.09 9.46 6.37 12 6.37Z"
                    />

                </svg>

                <span>
                    Continue with Google
                </span>

            `;

        }

    }
);