(function () {
    /* ===== AUTH STATE ===== */
    function isLoggedIn() {
        return sessionStorage.getItem("loggedIn") === "true";
    }

    function setLoggedIn(state) {
        if (state) {
            sessionStorage.setItem("loggedIn", "true");
        } else {
            sessionStorage.removeItem("loggedIn");
        }
    }

    function ensureLoggedInFromLoginPage() {
        const isLoginPage = window.location.pathname.includes("login.html");
        if (isLoginPage) return; // handled in login.js flow

        const wasJustLoggedIn = sessionStorage.getItem("justLoggedIn");
        if (wasJustLoggedIn === "true") {
            setLoggedIn(true);
            sessionStorage.removeItem("justLoggedIn");
        }
    }

    /* ===== HEADER SYNC ===== */
    function syncHeaderState() {
        const header = document.querySelector(".site-header");
        if (!header) return;

        if (isLoggedIn()) {
            header.classList.add("is-logged-in");
        } else {
            sessionStorage.removeItem("loggedIn");
            header.classList.remove("is-logged-in");
        }
    }

    /* ===== LOGOUT ===== */
    function bindLogout() {
        const logoutBtn = document.querySelector(".header-logout");
        if (!logoutBtn) return;

        logoutBtn.addEventListener("click", (e) => {
            e.preventDefault();

            // clear auth state
            setLoggedIn(false);

            // clear booking/request state
            localStorage.removeItem("bookingRequested");

            // redirect to public home
            window.location.href = "/index.html";
        });
    }

    /* ===== INIT ===== */
    function initAuth() {
        ensureLoggedInFromLoginPage();
        syncHeaderState();
        bindLogout();
    }

    // after header injected
    window.addEventListener("componentsLoaded", () => {
        setTimeout(initAuth, 50);
    });

    // fallback
    document.addEventListener("DOMContentLoaded", initAuth);

    // immediate init fallback (if header already in DOM)
    if (document.querySelector(".site-header")) {
        initAuth();
    }

    // also re-sync header state on window load as final fallback
    window.addEventListener("load", () => {
        syncHeaderState();
    });
})();
