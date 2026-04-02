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
        const revealRoots = document.querySelectorAll(".reveal");
        const blockSelector = [
            ".mono-block",
            ".method-step",
            ".mono-block-action",
            ".mono-block-hero",
            ".mono-block-core",
            ".mono-block-muted",
            ".value-card",
            ".feature-card"
        ].join(", ");
        const targets = [];

        revealRoots.forEach((root) => {
            const blocks = Array.from(root.querySelectorAll(blockSelector));
            if (blocks.length > 0) {
                targets.push(...blocks);
            } else {
                // Fallback for pages where .reveal itself is the only meaningful unit.
                targets.push(root);
            }
        });

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const block = entry.target;
                    const isMethodPage = document.body.classList.contains("method-page");
                    const revealRoot = block.closest(".reveal");
                    const baseDelay = 0;

                    block.classList.add("is-visible");
                    if (revealRoot) {
                        revealRoot.classList.add("is-visible");
                    }

                    const headings = block.querySelectorAll("h2, h3, .eyebrow");
                    const bodies = block.querySelectorAll("p, li, .mono-stack > *, .value-highlight");

                    headings.forEach((h, i) => {
                        setTimeout(() => {
                            h.classList.add("is-visible");
                        }, baseDelay + (isMethodPage ? 220 + i * 140 : 80 + i * 60));
                    });

                    bodies.forEach((b, i) => {
                        setTimeout(() => {
                            b.classList.add("is-visible");
                        }, baseDelay + (isMethodPage ? 420 + i * 130 : 260 + i * 110));
                    });

                    observer.unobserve(block);
                }
            });
        }, {
            threshold: 0.45
        });

        targets.forEach((target) => observer.observe(target));
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
