(function () {
    "use strict";

    const FEED_URL = "/assets/data/facebook-posts.json";
    const DISPLAY_LIMIT = 3;

    function formatDate(value) {
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return "";

        return new Intl.DateTimeFormat("en", {
            year: "numeric",
            month: "long",
            day: "numeric",
            timeZone: "UTC"
        }).format(date);
    }

    function excerpt(value, maxLength = 180) {
        if (typeof value !== "string") return "";

        const normalized = value.replace(/\s+/g, " ").trim();
        if (normalized.length <= maxLength) return normalized;

        const candidate = normalized.slice(0, maxLength + 1);
        const boundary = candidate.lastIndexOf(" ");
        return `${candidate.slice(0, boundary > maxLength * 0.7 ? boundary : maxLength).trim()}…`;
    }

    function isSafeFacebookUrl(value) {
        try {
            const url = new URL(value);
            const hostname = url.hostname.toLowerCase();
            return url.protocol === "https:"
                && (hostname === "facebook.com" || hostname.endsWith(".facebook.com"));
        } catch {
            return false;
        }
    }

    function createPostCard(post) {
        if (!post || !isSafeFacebookUrl(post.permalink_url)) return null;

        const article = document.createElement("article");
        article.className = "facebook-card";

        if (typeof post.image_url === "string" && post.image_url.startsWith("https://")) {
            const media = document.createElement("div");
            media.className = "facebook-card__media";

            const image = document.createElement("img");
            image.className = "facebook-card__image";
            image.src = post.image_url;
            image.alt = "";
            image.loading = "lazy";
            image.decoding = "async";
            image.referrerPolicy = "no-referrer";
            image.addEventListener("error", () => {
                media.remove();
                article.classList.add("facebook-card--text-only");
            }, { once: true });

            media.append(image);
            article.append(media);
        } else {
            article.classList.add("facebook-card--text-only");
        }

        const body = document.createElement("div");
        body.className = "facebook-card__body";

        const meta = document.createElement("p");
        meta.className = "facebook-card__meta is-visible";
        const typeLabel = post.type === "reel" ? "FIELD NOTE · REEL" : "FIELD NOTE";
        const dateLabel = formatDate(post.created_at);
        meta.textContent = dateLabel ? `${typeLabel} · ${dateLabel}` : typeLabel;

        const message = document.createElement("p");
        message.className = "facebook-card__message is-visible";
        message.textContent = excerpt(post.message) || "View this latest learning note in its original context.";

        const link = document.createElement("a");
        link.className = "facebook-card__link";
        link.href = post.permalink_url;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.textContent = post.type === "reel" ? "Watch the field note →" : "Continue reading →";
        link.setAttribute("aria-label", `${link.textContent.replace(" →", "")} on Facebook (opens in a new tab)`);

        body.append(meta, message, link);
        article.append(body);
        return article;
    }

    async function loadFacebookContent() {
        const feed = document.querySelector("[data-facebook-feed]");
        const status = document.querySelector("[data-facebook-status]");
        if (!feed || !status) return;

        try {
            const response = await fetch(FEED_URL, {
                headers: { "Accept": "application/json" },
                cache: "no-cache"
            });
            if (!response.ok) throw new Error(`Feed request failed with ${response.status}`);

            const payload = await response.json();
            if (payload.schema_version !== 1 || !Array.isArray(payload.posts)) {
                throw new Error("Unsupported Facebook feed schema");
            }

            const cards = payload.posts
                .slice(0, DISPLAY_LIMIT)
                .map(createPostCard)
                .filter(Boolean);

            if (cards.length === 0) {
                status.textContent = "New learning notes are being prepared. Please check back soon.";
                return;
            }

            feed.replaceChildren(...cards);
            feed.hidden = false;
            status.textContent = `${cards.length} recent learning notes loaded.`;
            status.classList.add("visually-hidden");
        } catch (error) {
            console.error("Facebook content could not be loaded.", error);
            status.textContent = "The latest learning notes are temporarily unavailable.";
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", loadFacebookContent, { once: true });
    } else {
        loadFacebookContent();
    }
})();
