(function () {
    /* ===== HERO TRIGGER ===== */
    function triggerHero() {
        const hero = document.querySelector(".hero-central");
        if (hero && !hero.classList.contains("hero-loaded")) {
            hero.classList.add("hero-loaded");
        }
    }

    function initHero() {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", () => {
                setTimeout(triggerHero, 50);
            });
        } else {
            setTimeout(triggerHero, 50);
        }

        window.addEventListener("load", () => {
            setTimeout(triggerHero, 0);
        });
    }

    /* ===== SCROLL REVEAL ===== */
    function initScrollReveal() {
        const reveals = document.querySelectorAll(".reveal");

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const el = entry.target;
                    const isMethodPage = document.body.classList.contains("method-page");
                    const blockIndex = Array.from(document.querySelectorAll(".reveal")).indexOf(el);
                    const baseDelay = isMethodPage ? blockIndex * 200 : 0;

                    el.classList.add("is-visible");

                    const headings = el.querySelectorAll("h2, h3, .eyebrow");
                    const bodies = el.querySelectorAll("p, li, .mono-stack > *, .value-highlight");

                    headings.forEach((h, i) => {
                        setTimeout(() => {
                            h.classList.add("is-visible");
                        }, baseDelay + (isMethodPage ? 300 + i * 180 : 100 + i * 80));
                    });

                    bodies.forEach((b, i) => {
                        setTimeout(() => {
                            b.classList.add("is-visible");
                        }, baseDelay + (isMethodPage ? 900 + i * 160 : 600 + i * 150));
                    });

                    observer.unobserve(el);
                }
            });
        }, {
            threshold: 0.2
        });

        reveals.forEach((el) => observer.observe(el));
    }

    /* ===== HEADER SCROLL ===== */
    function initHeaderScroll() {
        const header = document.querySelector(".site-header");
        if (!header) return;

        // prevent double init
        if (header.dataset.scrollInitialized === "true") return;
        header.dataset.scrollInitialized = "true";

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
    }

    /* ===== INIT ===== */
    function initMotion() {
        initHero();
        initScrollReveal();
        initHeaderScroll();
    }

    // Run after components loaded (header required)
    window.addEventListener("componentsLoaded", initMotion);

    // Fallback
    document.addEventListener("DOMContentLoaded", initMotion);
})();