/* ===== GLOBAL LAYOUT LOADER ===== */

async function loadComponent(selector, path) {
    try {
        const res = await fetch(path + '?v=' + new Date().getTime());
        const html = await res.text();
        const target = document.querySelector(selector);
        if (target) {
            target.innerHTML = html;
        }
        return true;
    } catch (e) {
        console.error("Component load error:", path, e);
        return false;
    }
}

function bindMobileNavToggle() {
    const header = document.querySelector(".site-header");
    if (!header) return false;

    const navCombo = header.querySelector(".nav-combo");
    const navToggle = header.querySelector(".mono-hamburger");
    if (!navCombo || !navToggle) return false;

    // idempotent binding across repeated init paths
    if (navToggle.dataset.toggleBound === "true") return true;
    navToggle.dataset.toggleBound = "true";

    navToggle.addEventListener("click", () => {
        const isOpen = navCombo.getAttribute("data-state") === "open";
        navCombo.setAttribute("data-state", isOpen ? "closed" : "open");
        navToggle.setAttribute("aria-expanded", (!isOpen).toString());
    });

    return true;
}

document.addEventListener("DOMContentLoaded", async () => {
    await Promise.all([
        loadComponent("#global-header", "/components/header.html"),
        loadComponent("#global-footer", "/components/footer.html")
    ]);

    bindMobileNavToggle();

    // Dispatch event so other JS (e.g. auth, header behavior) can safely attach listeners
    window.dispatchEvent(new Event("componentsLoaded"));
});
