(function () {
    // Cleanup legacy auth flag left in localStorage from old login implementation.
    if (localStorage.getItem("loggedIn") !== null) {
        localStorage.removeItem("loggedIn");
    }

    function triggerHero() {
        const hero = document.querySelector(".hero-central");
        if (hero && !hero.classList.contains("hero-loaded")) {
            hero.classList.add("hero-loaded");
        }
    }

    // Fire on DOM ready
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", () => {
            // small delay to allow CSS to apply initial state
            setTimeout(triggerHero, 50);
        });
    } else {
        setTimeout(triggerHero, 50);
    }

    // Fallback on full load
    window.addEventListener("load", () => {
        setTimeout(triggerHero, 0);
    });
    /* ===== SCROLL REVEAL (Monolith Motion) ===== */

    const reveals = document.querySelectorAll(".reveal");

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                const el = entry.target;

                // reveal container
                el.classList.add("is-visible");

                // staged reveal: heading -> body
                const headings = el.querySelectorAll("h2, h3");
                const bodies = el.querySelectorAll("p, ul, .mono-stack > *");

                headings.forEach((h, i) => {
                    setTimeout(() => {
                        h.classList.add("is-visible");
                    }, 200 + i * 120);
                });

                bodies.forEach((b, i) => {
                    setTimeout(() => {
                        b.classList.add("is-visible");
                    }, 600 + i * 120);
                });

                observer.unobserve(el);
            }
        });
    }, {
        threshold: 0.2
    });

    reveals.forEach((el) => observer.observe(el));

    /* ===== INIT AFTER COMPONENT LOAD ===== */
    function initHeaderAndAuth() {
        const header = document.querySelector(".site-header");

        // prevent double init
        if (header && header.dataset.initialized === "true") return;
        if (header) header.dataset.initialized = "true";
        if (!header) return;

        /* ===== HEADER SCROLL BEHAVIOR ===== */
        let lastScroll = 0;

        window.addEventListener("scroll", () => {
            const currentScroll = window.scrollY;

            if (currentScroll > lastScroll && currentScroll > 80) {
                header.classList.remove("show");
                header.classList.add("hide");
            } else {
                header.classList.remove("hide");
                header.classList.add("show");
            }

            lastScroll = currentScroll;
        });

        /* ===== LOGIN STATE RESTORE ===== */
        const isLoggedIn = sessionStorage.getItem("loggedIn") === "true";
        if (isLoggedIn) {
            header.classList.add("is-logged-in");
        } else {
            sessionStorage.removeItem("loggedIn");
            header.classList.remove("is-logged-in");
        }

        /* ===== LOGOUT HANDLER ===== */
        const logoutBtn = document.querySelector(".header-logout");
        if (logoutBtn) {
            logoutBtn.addEventListener("click", (e) => {
                e.preventDefault();

                // clear auth state
                sessionStorage.removeItem("loggedIn");

                // reset header UI
                header.classList.remove("is-logged-in");

                // redirect to home (public state)
                window.location.href = "/index.html";
            });
        }

        /* ===== MOBILE NAV TOGGLE ===== */
        const navToggle = header.querySelector(".mono-hamburger");
        const navCombo = header.querySelector(".nav-combo");

        if (navToggle && navCombo) {
            if (navToggle.dataset.toggleBound === "true") return;
            navToggle.dataset.toggleBound = "true";

            navToggle.addEventListener("click", () => {
                const isOpen = navCombo.getAttribute("data-state") === "open";

                navCombo.setAttribute("data-state", isOpen ? "closed" : "open");
                navToggle.setAttribute("aria-expanded", (!isOpen).toString());
            });
        }
    }

    // Run after components are loaded
    window.addEventListener("componentsLoaded", initHeaderAndAuth);

    // Fallback (in case header is static on some pages)
    document.addEventListener("DOMContentLoaded", initHeaderAndAuth);
    window.addEventListener("load", initHeaderAndAuth);

    // If componentsLoaded was dispatched before this script attached listeners,
    // recover by observing the header mount point.
    const headerMount = document.querySelector("#global-header");
    if (headerMount && !document.querySelector(".site-header")) {
        const headerObserver = new MutationObserver(() => {
            if (document.querySelector(".site-header")) {
                initHeaderAndAuth();
                headerObserver.disconnect();
            }
        });
        headerObserver.observe(headerMount, { childList: true, subtree: true });
    } else {
        initHeaderAndAuth();
    }

    document.addEventListener("DOMContentLoaded", initContactForm);

    /* ===== CONTACT FORM AJAX (NON-REDIRECT) ===== */
    function initContactForm() {
        const form = document.querySelector('form[action*="formspree.io"]');

        if (!form) return; // prevent errors on other pages

        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const submitBtn = form.querySelector("button[type='submit']");

            // Positive friction
            submitBtn.innerText = "Submitting...";
            submitBtn.disabled = true;
            submitBtn.style.opacity = "0.5";

            try {
                const response = await fetch(form.action, {
                    method: 'POST',
                    body: new FormData(form),
                    headers: {
                        'Accept': 'application/json'
                    }
                });

                if (response.ok) {
                    const parent = form.parentNode;
                    const confirmation = document.createElement('div');

                    // Ensure visibility (override .reveal opacity)
                    confirmation.className = "mono-block is-visible";
                    confirmation.style.textAlign = "center";
                    confirmation.style.animation = "fadeUp 1s ease forwards";

                    confirmation.innerHTML = `
                    <p class="mono-subtitle-strong is-visible" style="font-size: 1.6rem;">Application Received</p>
                    <p class="is-visible" style="opacity: 0.7;">I will review your message carefully and reply shortly.</p>
                  `;

                    parent.insertBefore(confirmation, form);

                    // Remove form completely to avoid !important conflicts
                    form.remove();
                } else {
                    alert("Submission failed. Please try again.");
                    submitBtn.innerText = "Submit";
                    submitBtn.disabled = false;
                    submitBtn.style.opacity = "1";
                }
            } catch (error) {
                alert("Network error. Please try again.");
                submitBtn.innerText = "Submit";
                submitBtn.disabled = false;
                submitBtn.style.opacity = "1";
            }
        });
    }
})();
