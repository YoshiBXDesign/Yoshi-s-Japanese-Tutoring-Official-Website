(function () {
    const MEASUREMENT_ID = "G-0JSZXJG6EQ";
    const CONSENT_KEY = "yjt_cookie_consent";
    const CONSENT_ACCEPTED = "accepted";
    const CONSENT_ESSENTIAL = "essential";
    const BANNER_ID = "cookie-consent";

    let analyticsReady = false;
    let analyticsLoading = false;
    let consentGranted = false;
    let queuedEvents = [];

    window.gtag = function () {
        if (!consentGranted) return;

        const args = Array.prototype.slice.call(arguments);

        if (!analyticsReady) {
            queuedEvents.push(args);
            return;
        }

        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push(arguments);
    };

    function getStoredConsent() {
        try {
            return window.localStorage.getItem(CONSENT_KEY);
        } catch (error) {
            return null;
        }
    }

    function setStoredConsent(value) {
        try {
            window.localStorage.setItem(CONSENT_KEY, value);
        } catch (error) {
            // Ignore storage failures and continue with in-memory behavior.
        }
    }

    function removeBanner() {
        const banner = document.getElementById(BANNER_ID);
        if (!banner) return;

        banner.classList.remove("is-visible");
        banner.classList.add("is-hidden");

        window.setTimeout(function () {
            banner.remove();
        }, 400);
    }

    function initializeAnalytics() {
        if (analyticsReady || analyticsLoading) return;

        consentGranted = true;
        analyticsLoading = true;
        window.dataLayer = window.dataLayer || [];

        const script = document.createElement("script");
        script.async = true;
        script.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(MEASUREMENT_ID);
        script.onload = function () {
            window.gtag = function () {
                window.dataLayer.push(arguments);
            };

            analyticsReady = true;
            window.gtag("js", new Date());
            window.gtag("config", MEASUREMENT_ID);

            queuedEvents.forEach(function (args) {
                window.gtag.apply(null, args);
            });
            queuedEvents = [];
            analyticsLoading = false;
        };

        script.onerror = function () {
            analyticsLoading = false;
        };

        document.head.appendChild(script);
    }

    function handleConsentSelection(value) {
        setStoredConsent(value);
        removeBanner();

        if (value === CONSENT_ACCEPTED) {
            initializeAnalytics();
        }
    }

    function createBanner() {
        if (document.getElementById(BANNER_ID)) return;

        const banner = document.createElement("section");
        banner.id = BANNER_ID;
        banner.className = "cookie-consent";
        banner.setAttribute("aria-label", "Cookie consent");

        banner.innerHTML = [
            '<div class="cookie-consent__inner">',
            '<p class="cookie-consent__text">This site uses essential storage for basic site function. Analytics are enabled only if you accept all cookies.</p>',
            '<div class="cookie-consent__actions">',
            '<button type="button" class="cookie-consent__action" data-consent-action="accept">Accept all</button>',
            '<button type="button" class="cookie-consent__action" data-consent-action="essential">Essential only</button>',
            '<a href="/privacy.html" class="cookie-consent__action cookie-consent__action--link">Privacy notice</a>',
            '</div>',
            '</div>'
        ].join("");

        document.body.appendChild(banner);

        const acceptButton = banner.querySelector('[data-consent-action="accept"]');
        const essentialButton = banner.querySelector('[data-consent-action="essential"]');

        if (acceptButton) {
            acceptButton.addEventListener("click", function () {
                handleConsentSelection(CONSENT_ACCEPTED);
            });
        }

        if (essentialButton) {
            essentialButton.addEventListener("click", function () {
                handleConsentSelection(CONSENT_ESSENTIAL);
            });
        }

        window.requestAnimationFrame(function () {
            banner.classList.add("is-visible");
        });
    }

    function initializeConsent() {
        const storedConsent = getStoredConsent();

        if (storedConsent === CONSENT_ACCEPTED) {
            initializeAnalytics();
            return;
        }

        if (storedConsent === CONSENT_ESSENTIAL) {
            return;
        }

        createBanner();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initializeConsent);
    } else {
        initializeConsent();
    }
})();
