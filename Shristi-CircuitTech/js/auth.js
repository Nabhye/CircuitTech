import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";

import {
    getAuth,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signOut,
    sendPasswordResetEmail,
    GoogleAuthProvider,
    signInWithPopup
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";

import {
    firebaseConfig
} from "./firebase-config.js";


const app = initializeApp(firebaseConfig);

const auth = getAuth(app);


// =========================================================
// EMAIL LOGIN
// =========================================================

export async function loginUser(
    email,
    password
) {

    return await signInWithEmailAndPassword(
        auth,
        email,
        password
    );

}


// =========================================================
// GOOGLE LOGIN
// =========================================================

export async function loginWithGoogle() {

    const provider =
        new GoogleAuthProvider();


    provider.setCustomParameters({
        prompt: "select_account"
    });


    return await signInWithPopup(
        auth,
        provider
    );

}


// =========================================================
// LOGOUT
// =========================================================

export async function logoutUser() {

    await signOut(auth);

}


// =========================================================
// PASSWORD RESET
// =========================================================

export async function resetPassword(email) {

    return await sendPasswordResetEmail(
        auth,
        email
    );

}


// =========================================================
// AUTH STATE
// =========================================================

export function watchAuth(callback) {

    return onAuthStateChanged(
        auth,
        callback
    );

}


// =========================================================
// CURRENT USER
// =========================================================

export function getCurrentUser() {

    return auth.currentUser;

}


export {
    auth
};