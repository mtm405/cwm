// DEPRECATED: This file is now replaced by auth/authController.js and auth/authService.js
// See new architecture in static/js/auth/
// This file is kept for backward compatibility only. Remove after migration is complete.

/* global google */

// Minimal AuthService for Google OAuth only
class AuthService {
    constructor(apiBaseUrl = "") {
        this.apiBaseUrl = apiBaseUrl;
        this.onSignIn = this.onSignIn.bind(this);
    }

    async onSignIn(googleUser) {
        const id_token = googleUser.credential || googleUser.id_token || googleUser.token;
        try {
            const response = await fetch("/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ token: id_token })
            });
            if (response.ok) {
                window.location.href = "/dashboard";
            } else {
                alert("Sign-in failed. Please try again.");
            }
        } catch (error) {
            alert("Error during sign-in: " + error.message);
        }
    }

    initGoogleSignIn() {
        if (typeof google !== "undefined" && google.accounts && document.getElementById("google-signin-button")) {
            google.accounts.id.initialize({
                client_id: document.querySelector('meta[name="google-signin-client_id"]').content,
                callback: this.onSignIn
            });
            google.accounts.id.renderButton(
                document.getElementById("google-signin-button"),
                { theme: "outline", size: "large" }
            );
            google.accounts.id.prompt();
        } else {
            console.error("Google API script not loaded or button missing");
        }
    }
}

document.addEventListener("DOMContentLoaded", () => {
    if (typeof google !== "undefined") {
        const authService = new AuthService();
        authService.initGoogleSignIn();
    } else {
        console.error("Google API script not loaded");
    }
});
